"use client";

import { useRef, useState } from "react";
import { Drawer, DeleteButton, IconUpload } from "../../_components/ui";
import { Keuze } from "../../_components/velden";
import { opnamesToevoegen, verwijderOpnames, wijzigLied } from "./actions";
import { STEMMEN, leesBestandsnaam, naamVoor, naarStemgroep, nr, type Lied, type Stem } from "./liedjes";
import { OPNAME_TYPES, foutTekst, sleeptBestanden, uploadReeks } from "./uploaden";

// Een opname die nog geüpload moet worden
interface Nieuw {
  id: string;
  file: File;
  naam: string;
  eigenNaam: boolean;      // zelf aangepast: dan niet meer automatisch meenemen
  stem: Stem | "";
  rest: string;            // wat er in de bestandsnaam na de stem stond ("Band")
  bron: string;            // de titel uit de bestandsnaam, als het lied nog geen titel heeft
  voortgang: number | null;
  fout?: string;
}

const STEM_OPTIES = STEMMEN.map((s) => ({ value: s, label: s }));
const mb = (bytes: number) => `${(bytes / 1_000_000).toFixed(1)} MB`;
const leesNummer = (s: string) => (s.trim() ? Number(s) : null);

function maakWachtrij(files: File[], titel: string): Nieuw[] {
  return files.map((file) => {
    const b = leesBestandsnaam(file.name);
    const stem: Stem | "" = b.stem ?? "";
    return { id: crypto.randomUUID(), file, stem, rest: b.rest, bron: b.titel, naam: naamVoor(titel || b.titel, stem, b.rest), eigenNaam: false, voortgang: null };
  });
}

const IconKruis = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
);

// Een nieuw lied maken, of van een bestaand lied nummer en titel wijzigen.
// In beide gevallen kunnen er meerdere opnames tegelijk bij.
export default function LiedVenster({ lied, liedjes, bestanden = [], sluitend, onClose, onDone }: {
  lied: Lied | null;
  liedjes: Lied[];
  bestanden?: File[];
  sluitend?: boolean;
  onClose: () => void;
  onDone: (melding: string) => void;
}) {
  // Bij een nieuw lied: titel en nummer uit de eerste bestandsnaam waar ze in staan
  const uitBestand = bestanden.map((f) => leesBestandsnaam(f.name));
  const voorstel = Math.max(0, ...liedjes.map((l) => l.nummer ?? 0)) + 1;
  const [titel, setTitel]       = useState(lied?.titel ?? uitBestand.find((b) => b.titel)?.titel ?? "");
  const [nummer, setNummer]     = useState(nr(lied ? lied.nummer : uitBestand.find((b) => b.nummer)?.nummer ?? voorstel));
  const [wachtrij, setWachtrij] = useState<Nieuw[]>(() => maakWachtrij(bestanden, titel));
  const [busy, setBusy]         = useState<"save" | "delete" | null>(null);
  const [fout, setFout]         = useState("");
  const [drag, setDrag]         = useState(false);
  const kiezer = useRef<HTMLInputElement>(null);

  const n = leesNummer(nummer);
  const anderLied = n ? liedjes.find((l) => l.nummer === n && l.sleutel !== lied?.sleutel) : undefined;
  const gewijzigd = !!lied && (titel.trim() !== lied.titel || n !== lied.nummer);

  function voegToe(files: FileList | null) {
    if (!files?.length) return;
    setFout("");
    setWachtrij((w) => [...w, ...maakWachtrij([...files], titel)]);
  }

  const zet = (id: string, wat: Partial<Nieuw>) => setWachtrij((w) => w.map((x) => (x.id === id ? { ...x, ...wat } : x)));

  function wijzigTitel(t: string) {
    setTitel(t);
    setWachtrij((w) => w.map((x) => (x.eigenNaam ? x : { ...x, naam: naamVoor(t || x.bron, x.stem, x.rest) })));
  }

  async function opslaan() {
    setFout("");
    if (!titel.trim()) return setFout("Geef het lied een titel.");
    if (n !== null && !(n >= 1 && n <= 999)) return setFout("Een liednummer is een getal van 1 tot 999.");
    if (!lied && wachtrij.length === 0) return setFout("Voeg minstens één opname toe.");
    if (wachtrij.some((x) => !x.stem)) return setFout("Kies bij elke opname een stem.");
    if (wachtrij.some((x) => !x.naam.trim())) return setFout("Geef elke opname een naam.");

    setBusy("save");
    try {
      const aantal = wachtrij.length;
      if (aantal) {
        const klaar = await uploadReeks(wachtrij, (x, voortgang, fout) => zet(x.id, { voortgang, fout }));
        if (klaar.length) {
          const res = await opnamesToevoegen(
            klaar.map(({ x, key }) => ({ key, naam: x.naam, stemgroep: naarStemgroep(x.stem as Stem), liednummer: n })),
            titel,
          );
          if (res.error) throw new Error(res.error);
          setWachtrij((w) => w.filter((x) => !klaar.some((k) => k.x.id === x.id)));
        }
        if (klaar.length < aantal) throw new Error("Niet alles is geüpload. Probeer het nog eens voor de opnames met een melding.");
      }
      if (lied && gewijzigd) {
        const res = await wijzigLied(lied.opnames.map((o) => o.id), { liednummer: n, oudeTitel: lied.titel, titel });
        if (res.error) throw new Error(res.error);
      }
      onDone(!lied ? "Lied toegevoegd" : aantal ? `${aantal} ${aantal === 1 ? "opname" : "opnames"} toegevoegd` : "Wijzigingen opgeslagen");
    } catch (e) {
      setFout(foutTekst(e));
    }
    setBusy(null);
  }

  async function verwijderLied() {
    if (!lied) return;
    setBusy("delete");
    const res = await verwijderOpnames(lied.opnames.map((o) => o.id), lied.titel);
    setBusy(null);
    if (res.error) setFout(`Verwijderen lukte niet: ${res.error}`);
    else onDone("Lied verwijderd");
  }

  const aantalKlaar = wachtrij.filter((x) => x.voortgang === 1).length;
  const knop = busy === "save"
    ? (wachtrij.length ? `Uploaden… ${aantalKlaar} van ${wachtrij.length}` : "Opslaan…")
    : !lied ? "Lied toevoegen"
    : wachtrij.length && !gewijzigd ? `${wachtrij.length} ${wachtrij.length === 1 ? "opname" : "opnames"} toevoegen`
    : "Opslaan";

  return (
    <Drawer
      title={lied ? [nr(lied.nummer), lied.titel].filter(Boolean).join(" ") : "Nieuw lied"}
      onClose={busy ? () => {} : onClose}
      sluitend={sluitend}
      footer={
        <>
          {fout && <p className="adm-server-err" role="alert">{fout}</p>}
          <div className="adm-foot-actions">
            {lied && <DeleteButton label="Lied verwijderen" onConfirm={verwijderLied} busy={busy === "delete"} />}
            <span className="adm-spacer" />
            <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose} disabled={!!busy}>Annuleren</button>
            <button type="button" className="adm-btn adm-btn--primary" onClick={opslaan} disabled={!!busy || (!!lied && !gewijzigd && !wachtrij.length)}>{knop}</button>
          </div>
        </>
      }
    >
      <section className="adm-fieldset">
        <div className="adm-lied-velden">
          <div className="adm-field">
            <label htmlFor="ld-nr">Liednummer</label>
            <input id="ld-nr" className="adm-input adm-input--nummer" inputMode="numeric" value={nummer} onChange={(e) => setNummer(e.target.value.replace(/\D/g, "").slice(0, 3))} />
          </div>
          <div className="adm-field">
            <label htmlFor="ld-titel">Titel</label>
            <input id="ld-titel" className="adm-input" value={titel} onChange={(e) => wijzigTitel(e.target.value)} />
          </div>
        </div>
        {anderLied && <p className="adm-hint">{lied ? "Wordt samengevoegd met" : "Komt bij"} {nr(anderLied.nummer)} {anderLied.titel}</p>}
      </section>

      <section
        className="adm-fieldset"
        onDragOver={(e) => { if (sleeptBestanden(e)) { e.preventDefault(); e.stopPropagation(); setDrag(true); } }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDrag(false); }}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setDrag(false); voegToe(e.dataTransfer.files); }}
      >
        <button type="button" className="adm-lied-drop" data-drag={drag || undefined} onClick={() => kiezer.current?.click()} disabled={busy === "save"}>
          <IconUpload />
          <span><strong>Opnames kiezen</strong> of sleep ze hierheen</span>
        </button>
        <input ref={kiezer} type="file" multiple accept={OPNAME_TYPES} hidden onChange={(e) => { voegToe(e.target.files); e.target.value = ""; }} />

        {wachtrij.length > 0 && (
          <ul className="adm-wachtrij">
            {wachtrij.map((x) => (
              <li key={x.id} data-fout={x.fout ? "" : undefined}>
                <div className="adm-wachtrij-tekst">
                  <input className="adm-input adm-input--klein" value={x.naam} onChange={(e) => zet(x.id, { naam: e.target.value, eigenNaam: true })} aria-label={`Naam voor ${x.file.name}`} disabled={!!busy} />
                  <span className="adm-wachtrij-meta">{x.file.name} · {mb(x.file.size)}</span>
                  {x.voortgang !== null && <div className="adm-progress"><div style={{ width: `${Math.round(x.voortgang * 100)}%` }} /></div>}
                  {x.fout && <p className="adm-err">{x.fout}</p>}
                </div>
                <div className="adm-wachtrij-stem" data-leeg={!x.stem || undefined}>
                  <Keuze<Stem | "">
                    value={x.stem}
                    onChange={(stem) => zet(x.id, { stem, ...(x.eigenNaam ? {} : { naam: naamVoor(titel || x.bron, stem, x.rest) }) })}
                    opties={x.stem ? STEM_OPTIES : [{ value: "", label: "Kies stem" }, ...STEM_OPTIES]}
                    disabled={!!busy}
                  />
                </div>
                <button type="button" className="adm-icon-btn" title="Weghalen" aria-label={`Weghalen: ${x.file.name}`} onClick={() => setWachtrij((w) => w.filter((y) => y.id !== x.id))} disabled={!!busy}><IconKruis /></button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Drawer>
  );
}
