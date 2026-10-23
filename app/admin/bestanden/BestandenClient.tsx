"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Drawer, DeleteButton, IconDownload, IconPlus, IconSearch, IconUpload, Tabs, useToast } from "../_components/ui";
import { Keuze } from "../_components/velden";
import { Werkblad, kiesMetSchuif } from "../_components/Werkblad";
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
const datumTekst = (s: string) => new Date(s).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

function BestandDrawer({ bestand, standaardCategorie, onClose, onDone, acties }: {
  bestand: Bestand | null;
  standaardCategorie: string;
  onClose: () => void;
  onDone: (melding: string, id?: number) => void;
  acties?: ReactNode;
}) {
  const [file, setFile]           = useState<File | null>(null);
  const [naam, setNaam]           = useState(bestand?.naam ?? "");
  const [categorie, setCategorie] = useState(bestand?.categorie ?? standaardCategorie);
  const [stemgroep, setStemgroep] = useState<Stemgroep | "">(bestand?.stemgroep ?? "");
  const [voortgang, setVoortgang] = useState<number | null>(null);
  const [fout, setFout]           = useState("");
  const [busy, setBusy]           = useState<"save" | "delete" | null>(null);
  const [drag, setDrag]           = useState(false);

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
        onDone("Wijzigingen opgeslagen", bestand.id);
      } else {
        setVoortgang(0);
        const key = await uploadNaarR2(file!, { soort: "bestand", categorie }, setVoortgang);
        const res = await bestandToevoegen(key, input);
        if (res.error) throw new Error(res.error);
        onDone("Bestand toegevoegd", res.id);
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
      inline
      acties={acties}
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
          <div className="adm-bestand-kaart">
            <span className="adm-actie-icoon"><IconDownload /></span>
            <div>
              <strong>{bestand.naam}</strong>
              <p className="adm-hint" style={{ margin: 0 }}>Toegevoegd op {datumTekst(bestand.created_at)}</p>
            </div>
            {bestand.url && <a className="adm-btn adm-btn--ghost adm-btn--small" href={bestand.url} target="_blank" rel="noopener">Openen</a>}
          </div>
        ) : (
          <>
            <label
              htmlFor="bs-file"
              className="adm-drop"
              data-drag={drag || undefined}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); kies(e.dataTransfer.files[0]); }}
            >
              <IconUpload />
              {file ? <span><strong>{file.name}</strong> ({(file.size / 1_000_000).toFixed(1)} MB)</span> : <span><strong>Kies een bestand</strong> of sleep het hierheen</span>}
              <span className="adm-hint" style={{ margin: 0 }}>{file ? "Klik om een ander bestand te kiezen" : "PDF, muziek, video of document, ook grote bestanden"}</span>
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
            <Keuze id="bs-cat" value={categorie} onChange={setCategorie} opties={CATEGORIEEN.map((c) => ({ value: c.id, label: c.label, hint: c.uitleg }))} />
          </div>
          {categorie === "liedjes" && (
            <div className="adm-field">
              <label htmlFor="bs-stem">Stemgroep</label>
              <Keuze<Stemgroep | "">
                id="bs-stem"
                value={stemgroep}
                onChange={setStemgroep}
                opties={[{ value: "", label: "Alle stemgroepen" }, ...STEMGROEPEN.map((s) => ({ value: s, label: s }))]}
              />
            </div>
          )}
        </div>
      </section>
    </Drawer>
  );
}

export default function BestandenClient({ items, loadError, startNieuw, startId }: {
  items: Bestand[];
  loadError?: string;
  startNieuw?: boolean;
  startId?: string;
}) {
  const [filter, setFilter]   = useState("alles");
  const [zoek, setZoek]       = useState("");
  const [gekozen, setGekozen] = useState<string | null>(startNieuw ? "nieuw" : startId ?? null);
  const [toast, melding]      = useToast();

  const bestand = gekozen && gekozen !== "nieuw" ? items.find((b) => String(b.id) === gekozen) ?? null : null;
  const kies = useCallback((id: string | null) => kiesMetSchuif(gekozen, id, () => setGekozen(id)), [gekozen]);
  const sluit = useCallback(() => kies(null), [kies]);

  const groepen = useMemo(() => {
    const q = zoek.trim().toLowerCase();
    return CATEGORIEEN
      .filter((c) => filter === "alles" || c.id === filter)
      .map((c) => ({ ...c, items: items.filter((b) => b.categorie === c.id && (!q || b.naam.toLowerCase().includes(q))) }))
      .filter((g) => g.items.length > 0);
  }, [items, filter, zoek]);

  const lijst = loadError ? (
    <div className="adm-empty"><p className="adm-empty-title">De bestanden konden niet worden geladen</p><p>{loadError}</p></div>
  ) : (
    <>
      <button className="adm-wb-nieuw" data-id="nieuw" data-gekozen={gekozen === "nieuw" || undefined} onClick={() => kies("nieuw")}>
        <IconPlus /> Bestand toevoegen
      </button>
      {groepen.length === 0 ? (
        <div className="adm-empty">
          <p className="adm-empty-title">{zoek ? <>Niets gevonden voor &ldquo;{zoek}&rdquo;</> : filter === "alles" ? "Nog geen bestanden" : `Nog geen ${labelVan(filter).toLowerCase()}`}</p>
        </div>
      ) : groepen.map((g) => (
        <section key={g.id} className="adm-group">
          {filter === "alles" && <h2 className="adm-group-title">{g.label}</h2>}
          <ul className="adm-list">
            {g.items.map((b) => (
              <li key={b.id} data-id={String(b.id)} data-gekozen={gekozen === String(b.id) || undefined} className="adm-row adm-row--plain" onClick={() => kies(String(b.id))}>
                <div className="adm-main-col">
                  <button className="adm-title" onClick={(e) => { e.stopPropagation(); kies(String(b.id)); }}>{b.naam}</button>
                  <div className="adm-meta">
                    {b.categorie === "liedjes" && <span>{b.stemgroep ?? "Alle stemgroepen"}</span>}
                    <span>{datumTekst(b.created_at)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );

  const blad = gekozen && (gekozen === "nieuw" || bestand) ? (
    <BestandDrawer
      key={gekozen}
      bestand={bestand}
      standaardCategorie={filter === "alles" ? "liedjes" : filter}
      onClose={sluit}
      onDone={(m, id) => { setGekozen(id ? String(id) : null); melding(m); }}
      acties={bestand?.url && (
        <a className="adm-icon-btn" href={bestand.url} target="_blank" rel="noopener" title="Openen" aria-label="Bestand openen"><IconDownload /></a>
      )}
    />
  ) : null;

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Bestanden</h1>
          <p className="adm-sub">Alleen te zien voor ingelogde leden, in de ledenomgeving.</p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={() => kies("nieuw")}><IconPlus /> Bestand toevoegen</button>
      </header>

      <div className="adm-toolbar">
        <Tabs
          label="Categorie"
          value={filter}
          onChange={setFilter}
          items={[
            { id: "alles", label: "Alles", count: items.length },
            ...CATEGORIEEN.map((c) => ({ id: c.id, label: c.label, count: items.filter((b) => b.categorie === c.id).length })),
          ]}
        />
        <div className="adm-search">
          <IconSearch />
          <input type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Zoek op naam" aria-label="Zoek op naam" />
        </div>
      </div>

      <div className="adm-content">
        <Werkblad
          gekozen={gekozen}
          lijst={lijst}
          blad={blad}
          leeg={
            <>
              <p className="adm-empty-title">Kies een bestand</p>
              <p>Bladmuziek, nieuwsbrieven en ALV-stukken die je hier toevoegt, staan meteen in de ledenomgeving.</p>
              <button className="adm-btn adm-btn--primary" onClick={() => kies("nieuw")}><IconPlus /> Bestand toevoegen</button>
            </>
          }
        />
      </div>
      {toast}
    </div>
  );
}
