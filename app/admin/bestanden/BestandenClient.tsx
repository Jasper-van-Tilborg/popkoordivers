"use client";

import { useCallback, useMemo, useState } from "react";
import { Drawer, DeleteButton, IconDownload, IconPlus, IconSearch, IconUpload, useToast } from "../_components/ui";
import { uploadNaarR2 } from "../_components/upload";
import { bestandToevoegen, verwijderBestand, wijzigBestand, type BestandInput } from "./actions";

type Stemgroep = NonNullable<BestandInput["stemgroep"]>;

interface Bestand {
  id: number;
  naam: string;
  categorie: string;
  stemgroep: Stemgroep | null;
  created_at: string;
  url: string | null;
}

const CATEGORIEEN: { id: string; label: string; uitleg: string }[] = [
  { id: "liedjes",       label: "Liedjes",       uitleg: "Bladmuziek en oefenbestanden per stemgroep" },
  { id: "nieuwsbrieven", label: "Nieuwsbrieven", uitleg: "Nieuwsbrieven voor de leden" },
  { id: "alv",           label: "ALV-stukken",   uitleg: "Agenda, notulen en jaarstukken van de ledenvergadering" },
  { id: "opnames",       label: "Opnames",       uitleg: "Geluids- en video-opnames om mee te oefenen" },
  { id: "choreo",        label: "Choreografie",  uitleg: "Bewegingen en opstellingen" },
];
const STEMGROEPEN: Stemgroep[] = ["Sopraan", "Mezzo", "Alt", "Tenor", "Bas"];
const labelVan = (id: string) => CATEGORIEEN.find((c) => c.id === id)?.label ?? id;

function BestandDrawer({ bestand, standaardCategorie, onClose, onDone }: {
  bestand: Bestand | null;
  standaardCategorie: string;
  onClose: () => void;
  onDone: (melding: string) => void;
}) {
  const [file, setFile]           = useState<File | null>(null);
  const [naam, setNaam]           = useState(bestand?.naam ?? "");
  const [categorie, setCategorie] = useState(bestand?.categorie ?? standaardCategorie);
  const [stemgroep, setStemgroep] = useState<Stemgroep | "">(bestand?.stemgroep ?? "");
  const [voortgang, setVoortgang] = useState<number | null>(null);
  const [fout, setFout]           = useState("");
  const [busy, setBusy]           = useState<"save" | "delete" | null>(null);

  function kies(f: File | undefined) {
    if (!f) return;
    setFile(f);
    if (!naam.trim()) setNaam(f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
  }

  async function save() {
    if (!bestand && !file) { setFout("Kies een bestand."); return; }
    if (!naam.trim()) { setFout("Geef het bestand een naam."); return; }
    const input: BestandInput = { naam, categorie, stemgroep: stemgroep || null };

    setBusy("save");
    setFout("");
    try {
      if (bestand) {
        const res = await wijzigBestand(bestand.id, input);
        if (res.error) throw new Error(res.error);
        onDone("Wijzigingen opgeslagen");
      } else {
        setVoortgang(0);
        const key = await uploadNaarR2(file!, { soort: "bestand", categorie }, setVoortgang);
        const res = await bestandToevoegen(key, input);
        if (res.error) throw new Error(res.error);
        onDone("Bestand toegevoegd");
      }
    } catch (e) {
      setFout(e instanceof Error ? e.message : "Opslaan lukte niet.");
    }
    setBusy(null);
    setVoortgang(null);
  }

  async function remove() {
    if (!bestand) return;
    setBusy("delete");
    const res = await verwijderBestand(bestand.id);
    setBusy(null);
    if (res.error) setFout(`Verwijderen lukte niet: ${res.error}`);
    else onDone("Bestand verwijderd");
  }

  return (
    <Drawer
      title={bestand ? "Bestand bewerken" : "Bestand toevoegen"}
      onClose={onClose}
      footer={
        <>
          {fout && <p className="adm-server-err" role="alert">{fout}</p>}
          <div className="adm-foot-actions">
            {bestand && <DeleteButton onConfirm={remove} busy={busy === "delete"} />}
            <span className="adm-spacer" />
            <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose}>Annuleren</button>
            <button type="button" className="adm-btn adm-btn--primary" onClick={save} disabled={!!busy}>
              {busy === "save" ? (voortgang !== null ? `Uploaden… ${Math.round(voortgang * 100)}%` : "Opslaan…") : bestand ? "Wijzigingen opslaan" : "Toevoegen"}
            </button>
          </div>
        </>
      }
    >
      <section className="adm-fieldset">
        {bestand ? (
          bestand.url && <a className="adm-btn adm-btn--ghost adm-btn--small" href={bestand.url} target="_blank" rel="noopener"><IconDownload /> Bestand openen</a>
        ) : (
          <>
            <label htmlFor="bs-file" className="adm-drop" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); kies(e.dataTransfer.files[0]); }}>
              <IconUpload />
              {file ? <span><strong>{file.name}</strong> ({(file.size / 1_000_000).toFixed(1)} MB)</span> : <span><strong>Kies een bestand</strong> of sleep het hierheen</span>}
              {file && <span className="adm-hint" style={{ margin: 0 }}>Klik om een ander bestand te kiezen</span>}
            </label>
            <input id="bs-file" type="file" hidden onChange={(e) => kies(e.target.files?.[0])} />
            {voortgang !== null && <div className="adm-progress" style={{ marginTop: 12 }}><div style={{ width: `${Math.round(voortgang * 100)}%` }} /></div>}
          </>
        )}
      </section>

      <section className="adm-fieldset">
        <div className="adm-field">
          <label htmlFor="bs-naam">Naam</label>
          <input id="bs-naam" className="adm-input" value={naam} onChange={(e) => setNaam(e.target.value)} placeholder="bijv. Nieuwsbrief herfst 2026" />
          <p className="adm-hint">Zo staat het in de ledenomgeving.</p>
        </div>
        <div className="adm-grid-2">
          <div className="adm-field">
            <label htmlFor="bs-cat">Categorie</label>
            <select id="bs-cat" className="adm-input" value={categorie} onChange={(e) => setCategorie(e.target.value)}>
              {CATEGORIEEN.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          {categorie === "liedjes" && (
            <div className="adm-field">
              <label htmlFor="bs-stem">Stemgroep</label>
              <select id="bs-stem" className="adm-input" value={stemgroep} onChange={(e) => setStemgroep(e.target.value as Stemgroep | "")}>
                <option value="">Alle stemgroepen</option>
                {STEMGROEPEN.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>
        <p className="adm-hint">{CATEGORIEEN.find((c) => c.id === categorie)?.uitleg}.</p>
      </section>
    </Drawer>
  );
}

export default function BestandenClient({ items, loadError }: { items: Bestand[]; loadError?: string }) {
  const [filter, setFilter] = useState("alles");
  const [zoek, setZoek]     = useState("");
  const [drawer, setDrawer] = useState<{ bestand: Bestand | null } | null>(null);
  const [toast, melding]    = useToast();
  const sluit = useCallback(() => setDrawer(null), []);

  const groepen = useMemo(() => {
    const q = zoek.trim().toLowerCase();
    return CATEGORIEEN
      .filter((c) => filter === "alles" || c.id === filter)
      .map((c) => ({ ...c, items: items.filter((b) => b.categorie === c.id && (!q || b.naam.toLowerCase().includes(q))) }))
      .filter((g) => g.items.length > 0);
  }, [items, filter, zoek]);

  return (
    <div>
      <header className="adm-head">
        <div>
          <h1>Bestanden</h1>
          <p className="adm-sub">Alleen te zien voor ingelogde leden, in de ledenomgeving.</p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={() => setDrawer({ bestand: null })}><IconPlus /> Bestand toevoegen</button>
      </header>

      <div className="adm-toolbar">
        <div className="adm-tabs" role="tablist" aria-label="Categorie">
          <button role="tab" aria-selected={filter === "alles"} onClick={() => setFilter("alles")}>Alles <span className="adm-count">{items.length}</span></button>
          {CATEGORIEEN.map((c) => (
            <button key={c.id} role="tab" aria-selected={filter === c.id} onClick={() => setFilter(c.id)}>
              {c.label} <span className="adm-count">{items.filter((b) => b.categorie === c.id).length}</span>
            </button>
          ))}
        </div>
        <div className="adm-search">
          <IconSearch />
          <input type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Zoek op naam" aria-label="Zoek op naam" />
        </div>
      </div>

      <div className="adm-content">
        {loadError ? (
          <div className="adm-empty"><p className="adm-empty-title">De bestanden konden niet worden geladen</p><p>{loadError}</p></div>
        ) : groepen.length === 0 ? (
          <div className="adm-empty">
            {zoek ? <p className="adm-empty-title">Niets gevonden voor &ldquo;{zoek}&rdquo;</p> : (
              <>
                <p className="adm-empty-title">{filter === "alles" ? "Nog geen bestanden" : `Nog geen ${labelVan(filter).toLowerCase()}`}</p>
                <p>Bladmuziek, nieuwsbrieven en ALV-stukken die je hier toevoegt, staan meteen in de ledenomgeving.</p>
                <button className="adm-btn adm-btn--primary" onClick={() => setDrawer({ bestand: null })}>Bestand toevoegen</button>
              </>
            )}
          </div>
        ) : (
          groepen.map((g) => (
            <section key={g.id} className="adm-group">
              {filter === "alles" && <h2 className="adm-group-title">{g.label}</h2>}
              <ul className="adm-list">
                {g.items.map((b) => (
                  <li key={b.id} className="adm-row adm-row--plain" onClick={() => setDrawer({ bestand: b })}>
                    <div className="adm-main-col">
                      <button className="adm-title" onClick={(e) => { e.stopPropagation(); setDrawer({ bestand: b }); }}>{b.naam}</button>
                      <div className="adm-meta">
                        {b.categorie === "liedjes" && <span>{b.stemgroep ?? "Alle stemgroepen"}</span>}
                        <span>Toegevoegd {new Date(b.created_at).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}</span>
                      </div>
                    </div>
                    <div className="adm-actions" onClick={(e) => e.stopPropagation()}>
                      {b.url && <a className="adm-icon-btn" href={b.url} target="_blank" rel="noopener" title="Openen" aria-label={`${b.naam} openen`}><IconDownload /></a>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>

      {drawer && (
        <BestandDrawer
          key={drawer.bestand?.id ?? "new"}
          bestand={drawer.bestand}
          standaardCategorie={filter === "alles" ? "liedjes" : filter}
          onClose={sluit}
          onDone={(m) => { setDrawer(null); melding(m); }}
        />
      )}
      {toast}
    </div>
  );
}
