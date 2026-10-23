"use client";

import { useRef, useState, type ReactNode } from "react";
import { Drawer, DeleteButton, Switch, IconUpload, formatDatum, vandaag } from "../_components/ui";
import { uploadNaarR2 } from "../_components/upload";
import { Datum, Suggestie } from "../_components/velden";
import type { BerichtInput } from "./actions";

export interface Bericht {
  id: number;
  slug: string;
  titel: string;
  datum: string;
  categorie: string;
  intro: string;
  inhoud: string;
  afbeelding: string;
  gepubliceerd: boolean;
  created_at: string;
}

interface Props {
  bericht: Bericht | null;
  onClose: () => void;
  onSave: (input: BerichtInput) => Promise<string | null>;
  onDelete?: () => Promise<string | null>;
  acties?: ReactNode;
}

const heeftFoto = (url: string) => /^(https?:\/\/|\/)/.test(url);

export default function NieuwsDrawer({ bericht, onClose, onSave, onDelete, acties }: Props) {
  const [titel, setTitel]   = useState(bericht?.titel ?? "");
  const [datum, setDatum]   = useState(bericht?.created_at.slice(0, 10) ?? vandaag());
  const [categorie, setCategorie] = useState(bericht?.categorie ?? "Nieuws");
  const [intro, setIntro]   = useState(bericht?.intro ?? "");
  const [inhoud, setInhoud] = useState(bericht?.inhoud ?? "");
  const [online, setOnline] = useState(bericht?.gepubliceerd ?? true);

  const [foto, setFoto]         = useState<string | null>(bericht && heeftFoto(bericht.afbeelding) ? bericht.afbeelding : null);
  const [nieuweKey, setNieuweKey] = useState<string | null>(null);
  const [voortgang, setVoortgang] = useState<number | null>(null);
  const [drag, setDrag]           = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors]       = useState<Partial<Record<"titel" | "datum" | "intro", string>>>({});
  const [serverErr, setServerErr] = useState("");
  const [busy, setBusy]           = useState<"save" | "delete" | null>(null);

  async function kiesFoto(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setServerErr("Kies een afbeelding (jpg, png of webp)."); return; }
    setServerErr("");
    setVoortgang(0);
    try {
      const key = await uploadNaarR2(file, { soort: "nieuws" }, setVoortgang);
      setNieuweKey(key);
      setFoto(URL.createObjectURL(file));
    } catch (e) {
      setServerErr(e instanceof Error ? e.message : "Uploaden lukte niet.");
    }
    setVoortgang(null);
  }

  async function save() {
    const errs: typeof errors = {};
    if (!titel.trim()) errs.titel = "Geef het bericht een titel.";
    if (!datum) errs.datum = "Kies een datum.";
    if (!intro.trim()) errs.intro = "Schrijf een korte introductie.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy("save");
    setServerErr("");
    const err = await onSave({
      titel, intro, inhoud, categorie,
      datumIso: datum,
      datum: formatDatum(datum),
      gepubliceerd: online,
      nieuweAfbeeldingKey: nieuweKey,
      afbeeldingWeg: !foto,
    });
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
      inline
      acties={acties}
      title={bericht ? "Bericht bewerken" : "Nieuw bericht"}
      onClose={onClose}
      footer={
        <>
          {serverErr && <p className="adm-server-err" role="alert">{serverErr}</p>}
          <label className="adm-check">
            <Switch checked={online} onChange={() => setOnline(!online)} label="Zichtbaar op de website" />
            <span>{online ? "Zichtbaar op de website" : "Verborgen voor bezoekers"}</span>
          </label>
          <div className="adm-foot-actions">
            {onDelete && <DeleteButton onConfirm={remove} busy={busy === "delete"} />}
            <span className="adm-spacer" />
            <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose}>Annuleren</button>
            <button type="button" className="adm-btn adm-btn--primary" onClick={save} disabled={!!busy || voortgang !== null}>
              {busy === "save" ? "Opslaan…" : bericht ? "Wijzigingen opslaan" : "Bericht plaatsen"}
            </button>
          </div>
        </>
      }
    >
      <section className="adm-fieldset">
        <div className="adm-field">
          <label htmlFor="nw-titel">Titel</label>
          <input id="nw-titel" className="adm-input" value={titel} onChange={(e) => setTitel(e.target.value)} placeholder="bijv. Geslaagd kerstconcert in De Schakel" aria-invalid={!!errors.titel} />
          {errors.titel ? <p className="adm-err">{errors.titel}</p> : bericht && <p className="adm-hint">Adres: /nieuws/{bericht.slug}</p>}
        </div>
        <div className="adm-grid-2">
        <div className="adm-field">
          <label htmlFor="nw-datum">Datum</label>
          <Datum id="nw-datum" value={datum} onChange={setDatum} invalid={!!errors.datum} />
          {errors.datum ? <p className="adm-err">{errors.datum}</p> : <p className="adm-hint">Nieuwste berichten staan bovenaan.</p>}
        </div>
        <div className="adm-field">
          <label htmlFor="nw-categorie">Categorie</label>
          <Suggestie id="nw-categorie" value={categorie} onChange={setCategorie} suggesties={["Nieuws", "Optreden", "Vereniging", "Ledenwerving"]} />
          <p className="adm-hint">Staat boven het bericht op de website.</p>
        </div>
        </div>
      </section>

      <section className="adm-fieldset">
        <h3>Foto</h3>
        <p className="adm-hint" style={{ margin: "0 0 12px" }}>Komt bovenaan het bericht en op de nieuwspagina.</p>
        {foto ? (
          <div className="adm-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={foto} alt="" />
            <div className="adm-preview-actions">
              <button type="button" className="adm-photo-btn" onClick={() => fileRef.current?.click()}>Vervangen</button>
              <button type="button" className="adm-photo-btn" onClick={() => { setFoto(null); setNieuweKey(null); }}>Weghalen</button>
            </div>
          </div>
        ) : voortgang !== null ? (
          <div className="adm-drop">
            <span>Foto uploaden…</span>
            <div className="adm-progress" style={{ width: "60%" }}><div style={{ width: `${Math.round(voortgang * 100)}%` }} /></div>
          </div>
        ) : (
          <label
            htmlFor="nw-foto"
            className="adm-drop"
            data-drag={drag || undefined}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); kiesFoto(e.dataTransfer.files[0]); }}
          >
            <IconUpload />
            <span><strong>Kies een foto</strong> of sleep hem hierheen</span>
          </label>
        )}
        <input id="nw-foto" ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => kiesFoto(e.target.files?.[0])} />
      </section>

      <section className="adm-fieldset">
        <div className="adm-field">
          <label htmlFor="nw-intro">Introductie</label>
          <textarea id="nw-intro" rows={3} className="adm-input" value={intro} onChange={(e) => setIntro(e.target.value)} placeholder="Eén of twee zinnen die op de nieuwspagina onder de titel staan." aria-invalid={!!errors.intro} />
          {errors.intro && <p className="adm-err">{errors.intro}</p>}
        </div>
        <div className="adm-field">
          <label htmlFor="nw-inhoud">Tekst <span className="adm-optional">optioneel</span></label>
          <textarea id="nw-inhoud" rows={10} className="adm-input" value={inhoud} onChange={(e) => setInhoud(e.target.value)} />
          <p className="adm-hint">Laat een witregel tussen alinea&apos;s. Links (bijvoorbeeld naar YouTube) worden vanzelf klikbaar.</p>
        </div>
      </section>
    </Drawer>
  );
}
