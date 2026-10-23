"use client";

import { useState, type ReactNode } from "react";
import { Drawer, DeleteButton, Switch, formatDatum } from "../_components/ui";
import { Datum, Keuze } from "../_components/velden";
import type { AgendaInput } from "./actions";

export interface AgendaItem {
  id: number;
  titel: string;
  datum: string;
  datum_sorteer: string | null;
  tijd: string | null;
  locatie: string | null;
  beschrijving: string | null;
  link: string | null;
  fotos_url: string | null;
  gepubliceerd: boolean;
}

export interface Album {
  slug: string;
  titel: string;
}

export interface AgendaForm {
  titel: string;
  datum_sorteer: string;
  tijd: string;
  locatie: string;
  beschrijving: string;
  link: string;
  fotos_url: string;
  gepubliceerd: boolean;
}

export function toForm(item?: Partial<AgendaItem>): AgendaForm {
  return {
    titel:         item?.titel ?? "",
    datum_sorteer: item?.datum_sorteer ?? "",
    tijd:          item?.tijd ?? "",
    locatie:       item?.locatie ?? "",
    beschrijving:  item?.beschrijving ?? "",
    link:          item?.link ?? "",
    fotos_url:     item?.fotos_url ?? "",
    gepubliceerd:  item?.gepubliceerd ?? true,
  };
}

interface Props {
  mode: "new" | "edit";
  initial: AgendaForm;
  albums: Album[];
  onClose: () => void;
  onSave: (input: AgendaInput) => Promise<string | null>;
  onDelete?: () => Promise<string | null>;
  acties?: ReactNode;
}

export default function AgendaDrawer({ mode, initial, albums, onClose, onSave, onDelete, acties }: Props) {
  const [form, setForm]           = useState(initial);
  const [errors, setErrors]       = useState<Partial<Record<"titel" | "datum" | "link", string>>>({});
  const [serverErr, setServerErr] = useState("");
  const [busy, setBusy]           = useState<"save" | "delete" | null>(null);

  const set = <K extends keyof AgendaForm>(k: K, v: AgendaForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    const errs: typeof errors = {};
    if (!form.titel.trim()) errs.titel = "Geef het optreden een titel.";
    if (!form.datum_sorteer) errs.datum = "Kies de datum van het optreden.";
    if (form.link.trim() && !/^https?:\/\//.test(form.link.trim())) errs.link = "Begin de link met https://";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const clean = (v: string) => v.trim() || null;
    setBusy("save");
    setServerErr("");
    const err = await onSave({
      titel:         form.titel.trim(),
      datum_sorteer: form.datum_sorteer,
      datum:         formatDatum(form.datum_sorteer),
      tijd:          clean(form.tijd),
      locatie:       clean(form.locatie),
      beschrijving:  clean(form.beschrijving),
      link:          clean(form.link),
      fotos_url:     clean(form.fotos_url),
      gepubliceerd:  form.gepubliceerd,
    });
    setBusy(null);
    if (err) setServerErr(`Opslaan lukte niet: ${err}`);
  }

  async function remove() {
    if (!onDelete) return;
    setBusy("delete");
    setServerErr("");
    const err = await onDelete();
    setBusy(null);
    if (err) setServerErr(`Verwijderen lukte niet: ${err}`);
  }

  const albumUrls = albums.map((a) => `/media/${a.slug}`);
  const eigenFotoLink = form.fotos_url && !albumUrls.includes(form.fotos_url);

  return (
    <Drawer
      inline
      acties={acties}
      title={mode === "edit" ? "Optreden bewerken" : "Nieuw optreden"}
      onClose={onClose}
      footer={
        <>
          {serverErr && <p className="adm-server-err" role="alert">{serverErr}</p>}
          <label className="adm-check">
            <Switch checked={form.gepubliceerd} onChange={() => set("gepubliceerd", !form.gepubliceerd)} label="Zichtbaar op de website" />
            <span>{form.gepubliceerd ? "Zichtbaar op de website" : "Verborgen voor bezoekers"}</span>
          </label>
          <div className="adm-foot-actions">
            {onDelete && <DeleteButton onConfirm={remove} busy={busy === "delete"} />}
            <span className="adm-spacer" />
            <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose}>Annuleren</button>
            <button type="button" className="adm-btn adm-btn--primary" onClick={save} disabled={!!busy}>
              {busy === "save" ? "Opslaan…" : mode === "edit" ? "Wijzigingen opslaan" : "Optreden toevoegen"}
            </button>
          </div>
        </>
      }
    >
      <section className="adm-fieldset">
        <div className="adm-field">
          <label htmlFor="ag-titel">Titel</label>
          <input id="ag-titel" className="adm-input" value={form.titel} onChange={(e) => set("titel", e.target.value)} placeholder="bijv. Kerstconcert in De Schakel" aria-invalid={!!errors.titel} />
          {errors.titel && <p className="adm-err">{errors.titel}</p>}
        </div>

        <div className="adm-grid-2">
          <div className="adm-field">
            <label htmlFor="ag-datum">Datum</label>
            <Datum id="ag-datum" value={form.datum_sorteer} onChange={(v) => set("datum_sorteer", v)} invalid={!!errors.datum} />
            {errors.datum
              ? <p className="adm-err">{errors.datum}</p>
              : form.datum_sorteer && <p className="adm-hint">Op de site: {formatDatum(form.datum_sorteer)}</p>}
          </div>
          <div className="adm-field">
            <label htmlFor="ag-tijd">Tijd <span className="adm-optional">optioneel</span></label>
            <input id="ag-tijd" className="adm-input" value={form.tijd} onChange={(e) => set("tijd", e.target.value)} placeholder="bijv. 20:00" />
          </div>
        </div>

        <div className="adm-field">
          <label htmlFor="ag-locatie">Locatie <span className="adm-optional">optioneel</span></label>
          <input id="ag-locatie" className="adm-input" value={form.locatie} onChange={(e) => set("locatie", e.target.value)} placeholder="bijv. De Schakel, Gilze" />
        </div>

        <div className="adm-field">
          <label htmlFor="ag-beschrijving">Beschrijving <span className="adm-optional">optioneel</span></label>
          <textarea id="ag-beschrijving" rows={4} className="adm-input" value={form.beschrijving} onChange={(e) => set("beschrijving", e.target.value)} placeholder="Waar treden we op, met wie, en wat kunnen bezoekers verwachten?" />
        </div>
      </section>

      <section className="adm-fieldset">
        <h3>Links</h3>
        <div className="adm-field">
          <label htmlFor="ag-link">Kaartjes of meer info <span className="adm-optional">optioneel</span></label>
          <input id="ag-link" type="url" className="adm-input" value={form.link} onChange={(e) => set("link", e.target.value)} placeholder="https://" aria-invalid={!!errors.link} />
          {errors.link && <p className="adm-err">{errors.link}</p>}
        </div>
        <div className="adm-field">
          <label htmlFor="ag-fotos">Fotoalbum <span className="adm-optional">optioneel</span></label>
          <Keuze
            id="ag-fotos"
            value={form.fotos_url}
            onChange={(v) => set("fotos_url", v)}
            opties={[
              { value: "", label: "Geen album" },
              ...albums.map((a) => ({ value: `/media/${a.slug}`, label: a.titel })),
              ...(eigenFotoLink ? [{ value: form.fotos_url, label: "Eigen link", hint: form.fotos_url }] : []),
            ]}
          />
          <p className="adm-hint">Zonder album zien bezoekers bij een afgelopen optreden een link naar de ledenomgeving.</p>
        </div>
      </section>
    </Drawer>
  );
}
