"use client";

import { useMemo, useState } from "react";
import { Drawer, DeleteButton, IconDownload, IconPlus, IconSearch, IconTrash, IconUpload, formatDatum, useNaijlen, useToast } from "../../_components/ui";
import { Datum } from "../../_components/velden";
import { uploadNaarR2 } from "../../_components/upload";
import { bestandToevoegen, verwijderBestanden, zetAlvDatum } from "../actions";
import DocumentVenster from "../DocumentVenster";
import { gewoon, openBestand, soort, type Document } from "../documenten";

// Per vergadering een blok met de stukken. Een nieuwe vergadering is een datum met
// een paar bestanden tegelijk; een stuk openen of bewerken gaat per regel.

type Venster =
  | { soort: "stuk"; id: number }
  | { soort: "stukken"; datum: string | null }   // null: een nieuwe vergadering
  | { soort: "vergadering"; datum: string };

const sleutel = (v: Venster) => (v.soort === "stuk" ? `s${v.id}` : `${v.soort}:${v.datum ?? ""}`);
const titel = (datum: string) => `ALV ${formatDatum(datum)}`;

// Een paar bestanden tegelijk: bij een nieuwe vergadering of bij een bestaande
function StukkenVenster({ datum: vast, sluitend, onClose, onDone }: {
  datum: string | null;
  sluitend?: boolean;
  onClose: () => void;
  onDone: (melding: string) => void;
}) {
  type Regel = { id: string; file: File; naam: string; voortgang: number | null; klaar?: boolean };
  const [datum, setDatum] = useState(vast ?? "");
  const [regels, setRegels] = useState<Regel[]>([]);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fout, setFout] = useState("");

  const zet = (id: string, wat: Partial<Regel>) => setRegels((r) => r.map((x) => (x.id === id ? { ...x, ...wat } : x)));
  const voegToe = (files: FileList | File[] | null) => files && setRegels((r) => [
    ...r,
    ...[...files].map((file) => ({ id: crypto.randomUUID(), file, voortgang: null, naam: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ") })),
  ]);

  async function save() {
    if (!datum) return setFout("Kies de datum van de vergadering.");
    const open = regels.filter((r) => !r.klaar);
    if (!open.length) return setFout("Kies een of meer bestanden.");
    if (open.some((r) => !r.naam.trim())) return setFout("Geef elk stuk een naam.");
    setBusy(true);
    setFout("");
    let gelukt = regels.length - open.length;
    for (const r of open) {
      try {
        zet(r.id, { voortgang: 0 });
        const key = await uploadNaarR2(r.file, { soort: "bestand", categorie: "alv" }, (v) => zet(r.id, { voortgang: v }));
        const res = await bestandToevoegen(key, { naam: r.naam, categorie: "alv", stemgroep: null, liednummer: null, datum });
        if (res.error) throw new Error(res.error);
        zet(r.id, { klaar: true, voortgang: 1 });
        gelukt++;
      } catch (e) {
        zet(r.id, { voortgang: null });
        setFout(`${r.naam}: ${e instanceof Error ? e.message : "uploaden lukte niet"}`);
        setBusy(false);
        return;
      }
    }
    setBusy(false);
    onDone(`${gelukt} ${gelukt === 1 ? "stuk" : "stukken"} toegevoegd`);
  }

  return (
    <Drawer
      sluitend={sluitend}
      title={vast ? `Stukken toevoegen aan ${titel(vast)}` : "Nieuwe vergadering"}
      onClose={busy ? () => {} : onClose}
      footer={
        <>
          {fout && <p className="adm-server-err" role="alert">{fout}</p>}
          <div className="adm-foot-actions">
            <span className="adm-spacer" />
            <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose} disabled={busy}>Annuleren</button>
            <button type="button" className="adm-btn adm-btn--primary" onClick={save} disabled={busy}>
              {busy ? "Uploaden…" : regels.length > 1 ? `${regels.length} stukken toevoegen` : "Toevoegen"}
            </button>
          </div>
        </>
      }
    >
      {!vast && (
        <section className="adm-fieldset">
          <div className="adm-field">
            <label htmlFor="alv-datum">Datum van de vergadering</label>
            <Datum id="alv-datum" value={datum} onChange={setDatum} />
          </div>
        </section>
      )}
      <section className="adm-fieldset">
        {regels.length > 0 && (
          <ul className="adm-stukken">
            {regels.map((r) => (
              <li key={r.id}>
                <input className="adm-input" value={r.naam} onChange={(e) => zet(r.id, { naam: e.target.value })} disabled={busy || r.klaar} aria-label={`Naam van ${r.file.name}`} />
                <span className="adm-stukken-ext">{soort(r.file.name.split(".").pop()!.toLowerCase())}</span>
                <button type="button" className="adm-icon-btn" onClick={() => setRegels((x) => x.filter((y) => y.id !== r.id))} disabled={busy || r.klaar} aria-label={`${r.naam} weghalen`}><IconTrash /></button>
                {r.voortgang !== null && <div className="adm-progress"><div style={{ width: `${Math.round(r.voortgang * 100)}%` }} /></div>}
              </li>
            ))}
          </ul>
        )}
        <label
          className="adm-drop"
          data-drag={drag || undefined}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); voegToe(e.dataTransfer.files); }}
        >
          <IconUpload />
          <span><strong>{regels.length ? "Nog een bestand" : "Kies de stukken"}</strong> of sleep ze hierheen</span>
          <input type="file" multiple disabled={busy} onChange={(e) => { voegToe(e.target.files); e.target.value = ""; }} />
        </label>
      </section>
    </Drawer>
  );
}

// De datum van een vergadering wijzigen, of de hele vergadering weghalen
function VergaderingVenster({ datum: oud, stukken, sluitend, onClose, onDone }: {
  datum: string;
  stukken: Document[];
  sluitend?: boolean;
  onClose: () => void;
  onDone: (melding: string) => void;
}) {
  const [datum, setDatum] = useState(oud);
  const [busy, setBusy] = useState<"save" | "delete" | null>(null);
  const [fout, setFout] = useState("");
  const ids = stukken.map((s) => s.id);

  async function save() {
    if (datum === oud) return onClose();
    setBusy("save");
    const res = await zetAlvDatum(ids, datum);
    setBusy(null);
    if (res.error) setFout(res.error);
    else onDone("Datum gewijzigd");
  }

  async function remove() {
    setBusy("delete");
    const res = await verwijderBestanden(ids, titel(oud));
    setBusy(null);
    if (res.error) setFout(`Verwijderen lukte niet: ${res.error}`);
    else onDone(`${titel(oud)} is verwijderd`);
  }

  return (
    <Drawer
      sluitend={sluitend}
      title={titel(oud)}
      onClose={onClose}
      footer={
        <>
          {fout && <p className="adm-server-err" role="alert">{fout}</p>}
          <div className="adm-foot-actions">
            <DeleteButton onConfirm={remove} busy={busy === "delete"} label={`Verwijderen (${stukken.length} ${stukken.length === 1 ? "stuk" : "stukken"})`} />
            <span className="adm-spacer" />
            <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose}>Annuleren</button>
            <button type="button" className="adm-btn adm-btn--primary" onClick={save} disabled={!!busy || !datum}>{busy === "save" ? "Opslaan…" : "Opslaan"}</button>
          </div>
        </>
      }
    >
      <section className="adm-fieldset">
        <div className="adm-field">
          <label htmlFor="alv-datum">Datum van de vergadering</label>
          <Datum id="alv-datum" value={datum} onChange={setDatum} />
        </div>
      </section>
    </Drawer>
  );
}

export default function AlvClient({ items, loadError, startNieuw, startId }: {
  items: Document[];
  loadError?: string;
  startNieuw?: boolean;
  startId?: string;
}) {
  const [zoek, setZoek]         = useState("");
  const [venster, setVenster]   = useState<Venster | null>(startNieuw ? { soort: "stukken", datum: null } : startId ? { soort: "stuk", id: Number(startId) } : null);
  const [open, sluitend]        = useNaijlen(venster);
  const [toast, melding]        = useToast();

  const alle = useMemo(() => {
    const per = new Map<string, Document[]>();
    for (const d of [...items].sort((a, b) => a.naam.localeCompare(b.naam, "nl"))) {
      const k = d.datum ?? "";
      per.set(k, [...(per.get(k) ?? []), d]);
    }
    return [...per].sort((a, b) => b[0].localeCompare(a[0])).map(([datum, stukken]) => ({ datum, stukken }));
  }, [items]);

  const woorden = gewoon(zoek).split(/\s+/).filter(Boolean);
  const vergaderingen = alle
    .map((v) => ({ ...v, stukken: v.stukken.filter((d) => woorden.every((w) => gewoon(`${d.naam} ${v.datum ? titel(v.datum) : ""}`).includes(w))) }))
    .filter((v) => v.stukken.length > 0);

  const stuk = open?.soort === "stuk" ? items.find((d) => d.id === open.id) ?? null : null;
  const sluit = () => setVenster(null);
  const klaar = (m: string) => { setVenster(null); melding(m); };

  async function openen(d: Document, opslaan: boolean) {
    if (!(await openBestand(d.id, opslaan))) melding("Dit bestand kon niet worden geopend");
  }

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>ALV-stukken</h1>
          <p className="adm-sub">{items.length} stukken van {alle.length} {alle.length === 1 ? "vergadering" : "vergaderingen"}</p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={() => setVenster({ soort: "stukken", datum: null })}><IconPlus /> Nieuwe vergadering</button>
      </header>

      <div className="adm-toolbar">
        <span />
        <div className="adm-search">
          <IconSearch />
          <input type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Zoek een stuk" aria-label="Zoek in ALV-stukken" />
        </div>
      </div>

      <div className="adm-content">
        {loadError ? (
          <div className="adm-empty"><p className="adm-empty-title">De ALV-stukken konden niet worden geladen</p><p>{loadError}</p></div>
        ) : vergaderingen.length === 0 ? (
          <div className="adm-empty"><p className="adm-empty-title">{zoek ? <>Niets gevonden voor &ldquo;{zoek}&rdquo;</> : "Nog geen ALV-stukken"}</p></div>
        ) : vergaderingen.map((v) => (
          <section key={v.datum} className="adm-blok">
            <div className="adm-blok-kop">
              <h2>{v.datum ? titel(v.datum) : "Zonder datum"} <span className="adm-count">{v.stukken.length}</span></h2>
              {v.datum && (
                <div className="adm-head-actions">
                  <button className="adm-btn adm-btn--ghost adm-btn--small" onClick={() => setVenster({ soort: "vergadering", datum: v.datum })}>Bewerken</button>
                  <button className="adm-btn adm-btn--ghost adm-btn--small" onClick={() => setVenster({ soort: "stukken", datum: v.datum })}><IconPlus /> Stuk toevoegen</button>
                </div>
              )}
            </div>
            <ul className="adm-list">
              {v.stukken.map((d) => (
                <li key={d.id} className="adm-row adm-row--plain" onClick={() => setVenster({ soort: "stuk", id: d.id })}>
                  <div className="adm-main-col">
                    <button className="adm-title" onClick={(e) => { e.stopPropagation(); setVenster({ soort: "stuk", id: d.id }); }}>{d.naam}</button>
                    <div className="adm-meta"><span>{soort(d.ext)}</span></div>
                  </div>
                  <span className="adm-actions" onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="adm-btn adm-btn--ghost adm-btn--small" onClick={() => openen(d, false)}>Openen</button>
                    <button type="button" className="adm-icon-btn" onClick={() => openen(d, true)} title="Downloaden" aria-label={`${d.naam} downloaden`}><IconDownload /></button>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {open?.soort === "stuk" && stuk && (
        <DocumentVenster key={sleutel(open)} categorie="alv" document={stuk} alle={items} sluitend={sluitend} onClose={sluit} onDone={klaar} />
      )}
      {open?.soort === "stukken" && (
        <StukkenVenster key={sleutel(open)} datum={open.datum} sluitend={sluitend} onClose={sluit} onDone={klaar} />
      )}
      {open?.soort === "vergadering" && (
        <VergaderingVenster
          key={sleutel(open)}
          datum={open.datum}
          stukken={items.filter((d) => d.datum === open.datum)}
          sluitend={sluitend}
          onClose={sluit}
          onDone={klaar}
        />
      )}
      {toast}
    </div>
  );
}
