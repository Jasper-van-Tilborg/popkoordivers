"use client";

import { useState } from "react";
import { Drawer, DeleteButton, IconUpload } from "../../_components/ui";
import { uploadNaarR2 } from "../../_components/upload";
import { bestandToevoegen, verwijderBestanden, wijzigChoreoLied } from "../actions";
import { nr } from "../documenten";
import { choreoSleutel, type ChoreoLied } from "./liedjes";

// Een nieuw choreolied (nummer, titel, video en/of beschrijving) of een bestaand
// lied een ander nummer of een andere titel geven. onDone krijgt de sleutel van
// het lied mee, of null als het weg is.
export default function ChoreoLiedVenster({ lied, liedjes, sluitend, onClose, onDone }: {
  lied: ChoreoLied | null;
  liedjes: ChoreoLied[];
  sluitend?: boolean;
  onClose: () => void;
  onDone: (melding: string, sleutel: string | null) => void;
}) {
  const [nummer, setNummer] = useState(nr(lied?.nummer));
  const [titel, setTitel]   = useState(lied?.titel ?? "");
  const [video, setVideo]   = useState<File | null>(null);
  const [tekst, setTekst]   = useState<File | null>(null);
  const [voortgang, setVoortgang] = useState<number | null>(null);
  const [busy, setBusy]     = useState<"save" | "delete" | null>(null);
  const [fout, setFout]     = useState("");

  const n = nummer.trim() ? Number(nummer) : null;
  const anders = n ? liedjes.find((l) => l.nummer === n && l.sleutel !== lied?.sleutel) : undefined;
  const ids = lied ? [...lied.videos, ...lied.beschrijvingen].map((d) => d.id) : [];

  async function save() {
    if (!titel.trim()) return setFout("Geef het lied een titel.");
    if (!lied && !video && !tekst) return setFout("Kies een video of een beschrijving.");
    setBusy("save");
    setFout("");
    try {
      if (lied) {
        const res = await wijzigChoreoLied(ids, { liednummer: n, naam: titel });
        if (res.error) throw new Error(res.error);
        onDone("Wijzigingen opgeslagen", choreoSleutel(n, titel));
      } else {
        const files = [video, tekst].filter((f): f is File => !!f);
        for (const [i, f] of files.entries()) {
          setVoortgang(i / files.length);
          const key = await uploadNaarR2(f, { soort: "bestand", categorie: "choreo" }, (v) => setVoortgang((i + v) / files.length));
          const res = await bestandToevoegen(key, { naam: titel, categorie: "choreo", stemgroep: null, liednummer: n, datum: null });
          if (res.error) throw new Error(res.error);
        }
        onDone(`${titel.trim()} is toegevoegd`, choreoSleutel(n, titel));
      }
    } catch (e) {
      setFout(e instanceof Error ? e.message : "Opslaan lukte niet.");
    }
    setBusy(null);
    setVoortgang(null);
  }

  async function remove() {
    if (!lied) return;
    setBusy("delete");
    const res = await verwijderBestanden(ids, lied.titel);
    setBusy(null);
    if (res.error) setFout(`Verwijderen lukte niet: ${res.error}`);
    else onDone(`${lied.titel} is verwijderd`, null);
  }

  const kiezer = (wat: "video" | "tekst") => {
    const f = wat === "video" ? video : tekst;
    return (
      <label className="adm-lied-drop" data-disabled={!!busy || undefined}>
        <IconUpload />
        <span>{f ? <><strong>{f.name}</strong> ({(f.size / 1_000_000).toFixed(1)} MB)</> : <><strong>{wat === "video" ? "Video" : "Beschrijving"}</strong> kiezen</>}</span>
        <input type="file" hidden disabled={!!busy} accept={wat === "video" ? "video/*" : ".docx,.doc,.pdf"}
          onChange={(e) => { const x = e.target.files?.[0] ?? null; if (wat === "video") setVideo(x); else setTekst(x); }} />
      </label>
    );
  };

  return (
    <Drawer
      sluitend={sluitend}
      title={lied ? "Lied bewerken" : "Nieuw lied"}
      onClose={busy ? () => {} : onClose}
      footer={
        <>
          {fout && <p className="adm-server-err" role="alert">{fout}</p>}
          <div className="adm-foot-actions">
            {lied && <DeleteButton onConfirm={remove} busy={busy === "delete"} label="Lied verwijderen" />}
            <span className="adm-spacer" />
            <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose} disabled={!!busy}>Annuleren</button>
            <button type="button" className="adm-btn adm-btn--primary" onClick={save} disabled={!!busy}>
              {busy === "save" ? (voortgang !== null ? `Uploaden… ${Math.round(voortgang * 100)}%` : "Opslaan…") : lied ? "Wijzigingen opslaan" : "Toevoegen"}
            </button>
          </div>
        </>
      }
    >
      <section className="adm-fieldset">
        <div className="adm-lied-velden">
          <div className="adm-field">
            <label htmlFor="ch-nr">Liednummer</label>
            <input id="ch-nr" className="adm-input adm-input--nummer" inputMode="numeric" value={nummer}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 3);
                setNummer(v);
                const l = v ? liedjes.find((x) => x.nummer === Number(v) && x.sleutel !== lied?.sleutel) : undefined;
                if (l && !lied) setTitel(l.titel);
              }} />
          </div>
          <div className="adm-field">
            <label htmlFor="ch-titel">Titel</label>
            <input id="ch-titel" className="adm-input" value={titel} onChange={(e) => setTitel(e.target.value)} />
          </div>
        </div>
        {anders && <p className="adm-hint">Komt bij {nr(anders.nummer)} {anders.titel}</p>}
      </section>
      {!lied && (
        <section className="adm-fieldset adm-choreo-kiezers">
          {kiezer("video")}
          {kiezer("tekst")}
          {voortgang !== null && <div className="adm-progress"><div style={{ width: `${Math.round(voortgang * 100)}%` }} /></div>}
        </section>
      )}
    </Drawer>
  );
}
