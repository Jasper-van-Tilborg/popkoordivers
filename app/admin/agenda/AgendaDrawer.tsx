"use client";

import { useEffect, useRef, useState } from "react";

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

export type AgendaPayload = Omit<AgendaItem, "id">;

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

// "2026-11-07" → "7 november 2026" (zo staat de datum op de website)
export function formatDatum(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

export function toForm(item?: Partial<AgendaItem>): AgendaForm {
  return {
    titel:         item?.titel ?? "",
    datum_sorteer: item?.datum_sorteer ?? "",
    tijd:          item?.tijd ?? "",
    locatie:       item?.locatie ?? "",
    beschrijving:  item?.beschrijving ?? "",
    link:         item?.link ?? "",
    fotos_url:     item?.fotos_url ?? "",
    gepubliceerd:  item?.gepubliceerd ?? true,
  };
}

interface Props {
  mode: "new" | "edit";
  initial: AgendaForm;
  albums: Album[];
  onClose: () => void;
  onSave: (payload: AgendaPayload) => Promise<string | null>;
  onDelete?: () => Promise<string | null>;
}

export default function AgendaDrawer({ mode, initial, albums, onClose, onSave, onDelete }: Props) {
  const [form, setForm]         = useState(initial);
  const [errors, setErrors]     = useState<Partial<Record<"titel" | "datum" | "link", string>>>({});
  const [serverErr, setServerErr] = useState("");
  const [busy, setBusy]         = useState<"save" | "delete" | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const titelRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

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
      link:         clean(form.link),
      fotos_url:     clean(form.fotos_url),
      gepubliceerd:  form.gepubliceerd,
    });
    setBusy(null);
    if (err) setServerErr(`Opslaan lukte niet: ${err}`);
  }

  async function remove() {
    if (!onDelete) return;
    if (!confirmDel) { setConfirmDel(true); return; }
    setBusy("delete");
    setServerErr("");
    const err = await onDelete();
    setBusy(null);
    if (err) { setServerErr(`Verwijderen lukte niet: ${err}`); setConfirmDel(false); }
  }

  const albumUrls = albums.map((a) => `/media/${a.slug}`);
  const eigenFotoLink = form.fotos_url && !albumUrls.includes(form.fotos_url);

  return (
    <>
      <div className="ag-overlay" onClick={onClose} />
      <aside className="ag-drawer" role="dialog" aria-modal="true" aria-labelledby="ag-drawer-titel">
        <header className="ag-drawer-head">
          <h2 id="ag-drawer-titel">{mode === "edit" ? "Optreden bewerken" : "Nieuw optreden"}</h2>
          <button className="ag-icon-btn" onClick={onClose} aria-label="Sluiten">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="ag-drawer-body">
          <section className="ag-fieldset">
            <div className="ag-field">
              <label htmlFor="ag-titel">Titel</label>
              <input id="ag-titel" ref={titelRef} className="ag-input" value={form.titel} onChange={(e) => set("titel", e.target.value)} placeholder="bijv. Kerstconcert in De Schakel" aria-invalid={!!errors.titel} />
              {errors.titel && <p className="ag-err">{errors.titel}</p>}
            </div>

            <div className="ag-grid-2">
              <div className="ag-field">
                <label htmlFor="ag-datum">Datum</label>
                <input id="ag-datum" type="date" className="ag-input" value={form.datum_sorteer} onChange={(e) => set("datum_sorteer", e.target.value)} aria-invalid={!!errors.datum} />
                {errors.datum
                  ? <p className="ag-err">{errors.datum}</p>
                  : form.datum_sorteer && <p className="ag-hint">Op de site: {formatDatum(form.datum_sorteer)}</p>}
              </div>
              <div className="ag-field">
                <label htmlFor="ag-tijd">Tijd <span className="ag-optional">optioneel</span></label>
                <input id="ag-tijd" className="ag-input" value={form.tijd} onChange={(e) => set("tijd", e.target.value)} placeholder="bijv. 20:00" />
              </div>
            </div>

            <div className="ag-field">
              <label htmlFor="ag-locatie">Locatie <span className="ag-optional">optioneel</span></label>
              <input id="ag-locatie" className="ag-input" value={form.locatie} onChange={(e) => set("locatie", e.target.value)} placeholder="bijv. De Schakel, Gilze" />
            </div>

            <div className="ag-field">
              <label htmlFor="ag-beschrijving">Beschrijving <span className="ag-optional">optioneel</span></label>
              <textarea id="ag-beschrijving" rows={4} className="ag-input" value={form.beschrijving} onChange={(e) => set("beschrijving", e.target.value)} placeholder="Waar treden we op, met wie, en wat kunnen bezoekers verwachten?" />
            </div>
          </section>

          <section className="ag-fieldset">
            <h3>Links</h3>
            <div className="ag-field">
              <label htmlFor="ag-link">Kaartjes of meer info <span className="ag-optional">optioneel</span></label>
              <input id="ag-link" type="url" className="ag-input" value={form.link} onChange={(e) => set("link", e.target.value)} placeholder="https://" aria-invalid={!!errors.link} />
              {errors.link && <p className="ag-err">{errors.link}</p>}
            </div>
            <div className="ag-field">
              <label htmlFor="ag-fotos">Fotoalbum <span className="ag-optional">optioneel</span></label>
              <select id="ag-fotos" className="ag-input" value={form.fotos_url} onChange={(e) => set("fotos_url", e.target.value)}>
                <option value="">Geen album</option>
                {albums.map((a) => <option key={a.slug} value={`/media/${a.slug}`}>{a.titel}</option>)}
                {eigenFotoLink && <option value={form.fotos_url}>Eigen link: {form.fotos_url}</option>}
              </select>
              <p className="ag-hint">Zonder album zien bezoekers bij een afgelopen optreden een link naar de ledenomgeving.</p>
            </div>
          </section>
        </div>

        <footer className="ag-drawer-foot">
          {serverErr && <p className="ag-server-err" role="alert">{serverErr}</p>}
          <label className="ag-publish">
            <button type="button" role="switch" aria-checked={form.gepubliceerd} className="ag-switch" onClick={() => set("gepubliceerd", !form.gepubliceerd)}>
              <span className="ag-switch-knob" />
            </button>
            <span>{form.gepubliceerd ? "Zichtbaar op de website" : "Verborgen voor bezoekers"}</span>
          </label>
          <div className="ag-foot-actions">
            {onDelete && (
              <button type="button" className={confirmDel ? "ag-btn ag-btn--danger-solid" : "ag-btn ag-btn--danger"} onClick={remove} disabled={!!busy} onBlur={() => setConfirmDel(false)}>
                {busy === "delete" ? "Verwijderen…" : confirmDel ? "Ja, verwijderen" : "Verwijderen"}
              </button>
            )}
            <span style={{ flex: 1 }} />
            <button type="button" className="ag-btn ag-btn--ghost" onClick={onClose}>Annuleren</button>
            <button type="button" className="ag-btn ag-btn--primary" onClick={save} disabled={!!busy}>
              {busy === "save" ? "Opslaan…" : mode === "edit" ? "Wijzigingen opslaan" : "Optreden toevoegen"}
            </button>
          </div>
        </footer>
      </aside>
    </>
  );
}
