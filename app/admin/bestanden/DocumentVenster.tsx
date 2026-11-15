"use client";

import { useState } from "react";
import { Drawer, DeleteButton, IconDownload, IconUpload, formatDatum, vandaag } from "../_components/ui";
import { Datum } from "../_components/velden";
import { uploadNaarR2 } from "../_components/upload";
import { bestandToevoegen, verwijderBestand, vervangBestand, wijzigBestand } from "./actions";
import { openBestand, soort, type Document } from "./documenten";

// Eén nieuwsbrief of één ALV-stuk toevoegen of bewerken.
export default function DocumentVenster({ categorie, document, alle, startDatum, sluitend, onClose, onDone }: {
  categorie: "nieuwsbrieven" | "alv";
  document: Document | null;
  alle: Document[];
  startDatum?: string;
  sluitend?: boolean;
  onClose: () => void;
  onDone: (melding: string) => void;
}) {
  const brief = categorie === "nieuwsbrieven";
  // Voorstellen bij iets nieuws: de volgende nieuwsbrief, de laatste vergadering
  const volgendeBrief = Math.max(0, ...alle.map((d) => Number(d.naam.match(/nieuwsbrief\D{0,3}(\d+)/i)?.[1]) || 0)) + 1;
  const laatsteAlv = alle.map((d) => d.datum).filter(Boolean).sort().at(-1) ?? "";

  const [file, setFile]           = useState<File | null>(null);
  const [naam, setNaam]           = useState(document?.naam ?? (brief ? `Nieuwsbrief ${volgendeBrief}` : ""));
  const [datum, setDatum]         = useState(document?.datum ?? startDatum ?? (brief ? vandaag() : laatsteAlv));
  const [voortgang, setVoortgang] = useState<number | null>(null);
  const [fout, setFout]           = useState("");
  const [busy, setBusy]           = useState<"save" | "delete" | "vervang" | null>(null);
  const [drag, setDrag]           = useState(false);

  const alvDatums = brief ? [] : [...new Set(alle.map((d) => d.datum).filter((d): d is string => !!d))].sort().reverse().slice(0, 4);

  function kies(f: File | undefined) {
    if (!f) return;
    setFile(f);
    if (!naam.trim() || (!brief && !document)) setNaam(f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
  }

  async function save() {
    if (!document && !file) return setFout("Kies een bestand.");
    if (!naam.trim()) return setFout("Geef het een naam.");
    if (!datum) return setFout(brief ? "Kies de datum waarop de nieuwsbrief uitkwam." : "Kies de datum van de vergadering.");
    const input = { naam, categorie, stemgroep: null, liednummer: null, datum };
    setBusy("save");
    setFout("");
    try {
      if (document) {
        const res = await wijzigBestand(document.id, input);
        if (res.error) throw new Error(res.error);
        onDone("Wijzigingen opgeslagen");
      } else {
        setVoortgang(0);
        const key = await uploadNaarR2(file!, { soort: "bestand", categorie }, setVoortgang);
        const res = await bestandToevoegen(key, input);
        if (res.error) throw new Error(res.error);
        onDone(brief ? "Nieuwsbrief toegevoegd" : "Stuk toegevoegd");
      }
    } catch (e) {
      setFout(e instanceof Error ? e.message : "Opslaan lukte niet.");
    }
    setBusy(null);
    setVoortgang(null);
  }

  async function vervang(f: File | undefined) {
    if (!f || !document) return;
    setFout("");
    setBusy("vervang");
    setVoortgang(0);
    try {
      const key = await uploadNaarR2(f, { soort: "bestand", categorie }, setVoortgang);
      const res = await vervangBestand(document.id, key);
      if (res.error) throw new Error(res.error);
      onDone("Bestand vervangen");
    } catch (e) {
      setFout(e instanceof Error ? e.message : "Vervangen lukte niet.");
    }
    setBusy(null);
    setVoortgang(null);
  }

  async function open(opslaan: boolean) {
    if (document && !(await openBestand(document.id, opslaan))) setFout("Dit bestand kon niet worden geopend.");
  }

  async function remove() {
    if (!document) return;
    setBusy("delete");
    const res = await verwijderBestand(document.id);
    setBusy(null);
    if (res.error) setFout(`Verwijderen lukte niet: ${res.error}`);
    else onDone(`${document.naam} is verwijderd`);
  }

  return (
    <Drawer
      sluitend={sluitend}
      title={document ? document.naam : brief ? "Nieuwsbrief toevoegen" : "Stuk toevoegen"}
      onClose={busy ? () => {} : onClose}
      acties={document && <button type="button" className="adm-icon-btn" onClick={() => open(true)} title="Downloaden" aria-label="Downloaden"><IconDownload /></button>}
      footer={
        <>
          {fout && <p className="adm-server-err" role="alert">{fout}</p>}
          <div className="adm-foot-actions">
            {document && <DeleteButton onConfirm={remove} busy={busy === "delete"} />}
            <span className="adm-spacer" />
            <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose} disabled={!!busy}>Annuleren</button>
            <button type="button" className="adm-btn adm-btn--primary" onClick={save} disabled={!!busy}>
              {busy === "save" ? (voortgang !== null ? `Uploaden… ${Math.round(voortgang * 100)}%` : "Opslaan…") : document ? "Wijzigingen opslaan" : "Toevoegen"}
            </button>
          </div>
        </>
      }
    >
      <section className="adm-fieldset">
        {document ? (
          <>
            <div className="adm-bestand-kaart">
              <span className="adm-actie-icoon"><IconDownload /></span>
              <div>
                <strong>{soort(document.ext)}</strong>
                <p className="adm-hint" style={{ margin: 0 }}>Toegevoegd op {formatDatum(document.created_at.slice(0, 10))}</p>
              </div>
              <button type="button" className="adm-btn adm-btn--ghost adm-btn--small" onClick={() => open(false)}>Openen</button>
            </div>
            <label className="adm-lied-drop" data-disabled={!!busy || undefined} style={{ marginTop: 12 }}>
              <IconUpload />
              <span>{busy === "vervang" ? `Uploaden… ${Math.round((voortgang ?? 0) * 100)}%` : <><strong>Bestand vervangen</strong> door een nieuwe versie</>}</span>
              <input type="file" hidden disabled={!!busy} onChange={(e) => { vervang(e.target.files?.[0]); e.target.value = ""; }} />
            </label>
          </>
        ) : (
          <>
            <label
              className="adm-drop"
              data-drag={drag || undefined}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); kies(e.dataTransfer.files[0]); }}
            >
              <IconUpload />
              {file ? <span><strong>{file.name}</strong> ({(file.size / 1_000_000).toFixed(1)} MB)</span> : <span><strong>Kies een bestand</strong> of sleep het hierheen</span>}
              <input type="file" onChange={(e) => kies(e.target.files?.[0])} />
            </label>
            {voortgang !== null && <div className="adm-progress" style={{ marginTop: 12 }}><div style={{ width: `${Math.round(voortgang * 100)}%` }} /></div>}
          </>
        )}
      </section>

      <section className="adm-fieldset">
        <div className="adm-field">
          <label htmlFor="doc-naam">Naam</label>
          <input id="doc-naam" className="adm-input" value={naam} onChange={(e) => setNaam(e.target.value)} />
        </div>
        <div className="adm-field">
          <label htmlFor="doc-datum">{brief ? "Verschenen op" : "Datum van de vergadering"}</label>
          <Datum id="doc-datum" value={datum} onChange={setDatum} />
          {alvDatums.length > 0 && (
            <div className="adm-snelkeuze">
              {alvDatums.map((d) => (
                <button key={d} type="button" className="adm-pill" aria-pressed={d === datum} onClick={() => setDatum(d)}>{formatDatum(d)}</button>
              ))}
            </div>
          )}
        </div>
      </section>
    </Drawer>
  );
}
