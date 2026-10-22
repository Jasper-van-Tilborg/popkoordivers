"use client";

import { useState } from "react";
import { Drawer, DeleteButton, formatDatum, parseNlDatum } from "../_components/ui";
import type { AlbumInput } from "./actions";

interface Props {
  album: { titel: string; datum: string; totaal: number } | null;
  onClose: () => void;
  onSave: (input: AlbumInput) => Promise<string | null>;
  onDelete?: () => Promise<string | null>;
}

export default function AlbumDrawer({ album, onClose, onSave, onDelete }: Props) {
  const [titel, setTitel] = useState(album?.titel ?? "");
  const [datum, setDatum] = useState(album ? parseNlDatum(album.datum) : "");
  const [errors, setErrors] = useState<Partial<Record<"titel" | "datum", string>>>({});
  const [serverErr, setServerErr] = useState("");
  const [busy, setBusy] = useState<"save" | "delete" | null>(null);

  async function save() {
    const errs: typeof errors = {};
    if (!titel.trim()) errs.titel = "Geef het album een naam.";
    if (!datum && !album) errs.datum = "Kies de datum van het optreden of de activiteit.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy("save");
    setServerErr("");
    const err = await onSave({ titel, datum: datum ? formatDatum(datum) : album!.datum, datumIso: datum });
    setBusy(null);
    if (err) setServerErr(`Opslaan lukte niet: ${err}`);
  }

  async function remove() {
    if (!onDelete) return;
    setBusy("delete");
    const err = await onDelete();
    setBusy(null);
    if (err) setServerErr(`Verwijderen lukte niet: ${err}`);
  }

  return (
    <Drawer
      title={album ? "Album bewerken" : "Nieuw album"}
      onClose={onClose}
      footer={
        <>
          {serverErr && <p className="adm-server-err" role="alert">{serverErr}</p>}
          <div className="adm-foot-actions">
            {onDelete && <DeleteButton onConfirm={remove} busy={busy === "delete"} label={album?.totaal ? `Album en ${album.totaal} foto's verwijderen` : "Album verwijderen"} />}
            <span className="adm-spacer" />
            <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose}>Annuleren</button>
            <button type="button" className="adm-btn adm-btn--primary" onClick={save} disabled={!!busy}>
              {busy === "save" ? "Opslaan…" : album ? "Wijzigingen opslaan" : "Album aanmaken"}
            </button>
          </div>
        </>
      }
    >
      <section className="adm-fieldset">
        <div className="adm-field">
          <label htmlFor="al-titel">Naam</label>
          <input id="al-titel" className="adm-input" value={titel} onChange={(e) => setTitel(e.target.value)} placeholder="bijv. Kerstconcert De Schakel" aria-invalid={!!errors.titel} />
          {errors.titel && <p className="adm-err">{errors.titel}</p>}
        </div>
        <div className="adm-field">
          <label htmlFor="al-datum">Datum</label>
          <input id="al-datum" type="date" className="adm-input" value={datum} onChange={(e) => setDatum(e.target.value)} aria-invalid={!!errors.datum} />
          {errors.datum
            ? <p className="adm-err">{errors.datum}</p>
            : <p className="adm-hint">{datum ? `Op de site: ${formatDatum(datum)}` : album ? `Nu: ${album.datum}` : "De dag van het optreden of de activiteit."}</p>}
        </div>
      </section>
      {!album && (
        <p className="adm-hint">Na het aanmaken kun je meteen foto&apos;s toevoegen. Foto&apos;s zijn eerst alleen voor leden te zien; met de ster zet je ze ook op de openbare website.</p>
      )}
    </Drawer>
  );
}
