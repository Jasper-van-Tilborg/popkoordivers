"use client";

import { useState } from "react";
import { Drawer, DeleteButton, IconDownload, IconUpload } from "../../_components/ui";
import { Keuze } from "../../_components/velden";
import { uploadNaarR2 } from "../../_components/upload";
import { opnameLink, vervangOpname, verwijderOpnames, wijzigOpname } from "./actions";
import { STEMMEN, naarStemgroep, nr, stemVan, type Lied, type Opname, type Stem } from "./liedjes";
import { OPNAME_TYPES, foutTekst } from "./uploaden";

const STEM_OPTIES = STEMMEN.map((s) => ({ value: s, label: s }));

// Eén opname: naam, stem, ander lied, vervangen, downloaden of verwijderen
export default function OpnameVenster({ opname, lied, liedjes, sluitend, onClose, onDone }: {
  opname: Opname;
  lied: Lied;
  liedjes: Lied[];
  sluitend?: boolean;
  onClose: () => void;
  onDone: (melding: string) => void;
}) {
  const [naam, setNaam]           = useState(opname.naam);
  const [stem, setStem]           = useState<Stem>(stemVan(opname));
  const [nummer, setNummer]       = useState(nr(opname.liednummer));
  const [busy, setBusy]           = useState<"save" | "delete" | "vervang" | null>(null);
  const [voortgang, setVoortgang] = useState<number | null>(null);
  const [fout, setFout]           = useState("");

  const n = nummer.trim() ? Number(nummer) : null;
  const ander = n && n !== lied.nummer ? liedjes.find((l) => l.nummer === n) : undefined;
  const gewijzigd = naam.trim() !== opname.naam || stem !== stemVan(opname) || n !== opname.liednummer;

  async function opslaan() {
    setFout("");
    if (!naam.trim()) return setFout("Geef de opname een naam.");
    setBusy("save");
    const res = await wijzigOpname(opname.id, { naam, stemgroep: naarStemgroep(stem), liednummer: n });
    setBusy(null);
    if (res.error) return setFout(res.error);
    onDone(n === lied.nummer ? "Opname opgeslagen" : ander ? `Verplaatst naar ${nr(ander.nummer)} ${ander.titel}` : "Opname verplaatst");
  }

  async function vervang(file: File | undefined) {
    if (!file) return;
    setFout("");
    setBusy("vervang");
    setVoortgang(0);
    try {
      const key = await uploadNaarR2(file, { soort: "bestand", categorie: "opnames" }, setVoortgang);
      const res = await vervangOpname(opname.id, key);
      if (res.error) throw new Error(res.error);
      onDone("Bestand vervangen");
    } catch (e) {
      setFout(foutTekst(e));
    }
    setBusy(null);
    setVoortgang(null);
  }

  async function download() {
    const url = await opnameLink(opname.id, true);
    if (url) window.location.assign(url);
    else setFout("Deze opname kon niet worden gedownload.");
  }

  async function verwijder() {
    setBusy("delete");
    const res = await verwijderOpnames([opname.id]);
    setBusy(null);
    if (res.error) setFout(`Verwijderen lukte niet: ${res.error}`);
    else onDone("Opname verwijderd");
  }

  return (
    <Drawer
      title={opname.naam}
      onClose={busy ? () => {} : onClose}
      sluitend={sluitend}
      acties={<button type="button" className="adm-icon-btn" title="Downloaden" aria-label="Downloaden" onClick={download}><IconDownload /></button>}
      footer={
        <>
          {fout && <p className="adm-server-err" role="alert">{fout}</p>}
          <div className="adm-foot-actions">
            <DeleteButton onConfirm={verwijder} busy={busy === "delete"} />
            <span className="adm-spacer" />
            <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose} disabled={!!busy}>Annuleren</button>
            <button type="button" className="adm-btn adm-btn--primary" onClick={opslaan} disabled={!!busy || !gewijzigd}>{busy === "save" ? "Opslaan…" : "Opslaan"}</button>
          </div>
        </>
      }
    >
      <section className="adm-fieldset">
        <div className="adm-field">
          <label htmlFor="op-naam">Naam</label>
          <input id="op-naam" className="adm-input" value={naam} onChange={(e) => setNaam(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") opslaan(); }} />
        </div>
        <div className="adm-grid-2">
          <div className="adm-field">
            <label htmlFor="op-stem">Stem</label>
            <Keuze<Stem> id="op-stem" value={stem} onChange={setStem} opties={STEM_OPTIES} />
          </div>
          <div className="adm-field">
            <label htmlFor="op-nr">Liednummer</label>
            <input id="op-nr" className="adm-input adm-input--nummer" inputMode="numeric" value={nummer} onChange={(e) => setNummer(e.target.value.replace(/\D/g, "").slice(0, 3))} />
            {n !== lied.nummer && <p className="adm-hint">{ander ? `Naar ${nr(ander.nummer)} ${ander.titel}` : n ? "Wordt een nieuw lied" : "Naar zonder nummer"}</p>}
          </div>
        </div>
      </section>

      <section className="adm-fieldset">
        <label className="adm-lied-drop" data-disabled={!!busy || undefined}>
          <IconUpload />
          <span>{busy === "vervang" ? "Uploaden…" : <><strong>Bestand vervangen</strong> {opname.ext.toUpperCase()}</>}</span>
          <input type="file" hidden accept={OPNAME_TYPES} disabled={!!busy} onChange={(e) => { vervang(e.target.files?.[0]); e.target.value = ""; }} />
        </label>
        {voortgang !== null && <div className="adm-progress" style={{ marginTop: 12 }}><div style={{ width: `${Math.round(voortgang * 100)}%` }} /></div>}
      </section>
    </Drawer>
  );
}
