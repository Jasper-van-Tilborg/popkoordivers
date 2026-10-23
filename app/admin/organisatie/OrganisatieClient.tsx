"use client";

import { useMemo, useRef, useState } from "react";
import { Drawer, DeleteButton, IconOmhoog, IconOmlaag, IconPlus, IconSearch, IconTrash, useToast } from "../_components/ui";
import { Keuze, Suggestie } from "../_components/velden";
import { Werkblad, kiesMetSchuif } from "../_components/Werkblad";
import { bewaarGroep, verplaatsGroep, verwijderGroep, type GroepInput } from "./actions";

export interface Persoon { id: number; naam: string; functie: string | null }
export interface Groep {
  id: number;
  naam: string;
  soort: "bestuur" | "commissie" | "overig";
  toelichting: string | null;
  contactpersoon_id: number | null;
  leden: Persoon[];
}

// Een regel in het formulier; nieuwe mensen hebben nog geen id, wel een sleutel
type Regel = { sleutel: string; id?: number; naam: string; functie: string };

const FUNCTIES = ["Voorzitter", "Secretaris", "Penningmeester", "Bestuurslid"];
const SOORTEN = [
  { value: "commissie" as const, label: "Commissie" },
  { value: "overig" as const, label: "Overige taken", hint: "Losse taken, zoals materialen of geluid" },
];

let teller = 0;
const sleutel = () => `n${++teller}`;

function GroepDrawer({ groep, bestuur, plek, onClose, onDone }: {
  groep: Groep | null;
  bestuur: Persoon[];
  plek: { eerste: boolean; laatste: boolean };
  onClose: () => void;
  onDone: (melding: string, id?: number) => void;
}) {
  const isBestuur = groep?.soort === "bestuur";
  const [naam, setNaam] = useState(groep?.naam ?? "");
  const [soort, setSoort] = useState<GroepInput["soort"]>(groep?.soort === "overig" ? "overig" : "commissie");
  const [toelichting, setToelichting] = useState(groep?.toelichting ?? "");
  const [contact, setContact] = useState(groep?.contactpersoon_id ? String(groep.contactpersoon_id) : "");
  const [regels, setRegels] = useState<Regel[]>(() => {
    const r = (groep?.leden ?? []).map((l) => ({ sleutel: `p${l.id}`, id: l.id, naam: l.naam, functie: l.functie ?? "" }));
    return r.length ? r : [{ sleutel: sleutel(), naam: "", functie: "" }];
  });
  const [fout, setFout] = useState("");
  const [busy, setBusy] = useState<"save" | "delete" | "plek" | null>(null);
  const lijstRef = useRef<HTMLOListElement>(null);

  const zet = (i: number, veld: "naam" | "functie", v: string) => setRegels((r) => r.map((x, j) => (j === i ? { ...x, [veld]: v } : x)));
  const schuif = (i: number, d: -1 | 1) => setRegels((r) => {
    const n = [...r];
    [n[i], n[i + d]] = [n[i + d], n[i]];
    return n;
  });
  function voegToe() {
    setRegels((r) => [...r, { sleutel: sleutel(), naam: "", functie: "" }]);
    // Na het tekenen: focus op de nieuwe naam
    requestAnimationFrame(() => lijstRef.current?.querySelector<HTMLInputElement>("li:last-child input")?.focus());
  }

  async function save() {
    if (!naam.trim()) { setFout("Geef de groep een naam."); return; }
    setBusy("save");
    setFout("");
    const res = await bewaarGroep(groep?.id ?? null, {
      naam, soort, toelichting,
      contactpersoon_id: contact ? Number(contact) : null,
      leden: regels.map(({ id, naam, functie }) => ({ id, naam, functie })),
    });
    setBusy(null);
    if (res.error) setFout(res.error);
    else onDone(groep ? "Wijzigingen opgeslagen" : `${naam.trim()} is toegevoegd`, res.id);
  }

  async function remove() {
    if (!groep) return;
    setBusy("delete");
    const res = await verwijderGroep(groep.id);
    setBusy(null);
    if (res.error) setFout(`Verwijderen lukte niet: ${res.error}`);
    else onDone(`${groep.naam} is verwijderd`);
  }

  async function verplaats(d: -1 | 1) {
    if (!groep) return;
    setBusy("plek");
    await verplaatsGroep(groep.id, d);
    setBusy(null);
  }

  const functieLabel = isBestuur ? "Functie" : soort === "overig" ? "Taak" : "Toevoeging";

  return (
    <Drawer
      inline
      title={groep ? groep.naam : "Nieuwe commissie"}
      onClose={onClose}
      acties={groep && !isBestuur && (
        <>
          <button className={`adm-icon-btn${plek.eerste ? " adm-icon-btn--off" : ""}`} onClick={() => verplaats(-1)} disabled={plek.eerste || !!busy} title="Eén plek omhoog" aria-label="Eén plek omhoog"><IconOmhoog /></button>
          <button className={`adm-icon-btn${plek.laatste ? " adm-icon-btn--off" : ""}`} onClick={() => verplaats(1)} disabled={plek.laatste || !!busy} title="Eén plek omlaag" aria-label="Eén plek omlaag"><IconOmlaag /></button>
        </>
      )}
      footer={
        <>
          {fout && <p className="adm-server-err" role="alert">{fout}</p>}
          <div className="adm-foot-actions">
            {groep && !isBestuur && <DeleteButton onConfirm={remove} busy={busy === "delete"} />}
            <span className="adm-spacer" />
            <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose}>Annuleren</button>
            <button type="button" className="adm-btn adm-btn--primary" onClick={save} disabled={!!busy}>
              {busy === "save" ? "Opslaan…" : groep ? "Wijzigingen opslaan" : "Toevoegen"}
            </button>
          </div>
        </>
      }
    >
      <section className="adm-fieldset">
        <div className="adm-grid-2">
          <div className="adm-field">
            <label htmlFor="gr-naam">Naam</label>
            <input id="gr-naam" className="adm-input" value={naam} onChange={(e) => setNaam(e.target.value)} placeholder="bijv. Muziekcommissie" />
          </div>
          {!isBestuur && (
            <div className="adm-field">
              <label htmlFor="gr-soort">Soort</label>
              <Keuze id="gr-soort" value={soort} onChange={setSoort} opties={SOORTEN} />
            </div>
          )}
        </div>
        <div className="adm-grid-2">
          <div className="adm-field">
            <label htmlFor="gr-toelichting">Toelichting <span className="adm-optional">optioneel</span></label>
            <input id="gr-toelichting" className="adm-input" value={toelichting} onChange={(e) => setToelichting(e.target.value)} placeholder="bijv. 16 t/m 18 april 2027" />
            <p className="adm-hint">Staat onder de naam in de ledenomgeving.</p>
          </div>
          {!isBestuur && (
            <div className="adm-field">
              <label htmlFor="gr-contact">Contactpersoon in het bestuur</label>
              <Keuze
                id="gr-contact"
                value={contact}
                onChange={setContact}
                opties={[{ value: "", label: "Geen" }, ...bestuur.map((b) => ({ value: String(b.id), label: b.naam, hint: b.functie ?? undefined }))]}
              />
            </div>
          )}
        </div>
      </section>

      <section className="adm-fieldset">
        <h3>{isBestuur ? "Bestuursleden" : "Leden"}</h3>
        <p className="adm-hint" style={{ marginTop: 0 }}>In deze volgorde staan ze in de ledenomgeving. Een lege regel wordt overgeslagen.</p>
        <ol className="adm-personen" ref={lijstRef}>
          {regels.map((r, i) => (
            <li key={r.sleutel}>
              <input className="adm-input" value={r.naam} onChange={(e) => zet(i, "naam", e.target.value)} placeholder="Naam" aria-label={`Naam ${i + 1}`} />
              {isBestuur ? (
                <Suggestie value={r.functie} onChange={(v) => zet(i, "functie", v)} suggesties={FUNCTIES} placeholder="Functie" />
              ) : (
                <input className="adm-input" value={r.functie} onChange={(e) => zet(i, "functie", e.target.value)} placeholder={soort === "overig" ? "bijv. Materialen" : "bijv. dirigent of extern"} aria-label={`${functieLabel} ${i + 1}`} />
              )}
              <span className="adm-personen-knoppen">
                <button type="button" className={`adm-icon-btn${i === 0 ? " adm-icon-btn--off" : ""}`} onClick={() => schuif(i, -1)} disabled={i === 0} aria-label={`${r.naam || "Regel"} omhoog`}><IconOmhoog /></button>
                <button type="button" className={`adm-icon-btn${i === regels.length - 1 ? " adm-icon-btn--off" : ""}`} onClick={() => schuif(i, 1)} disabled={i === regels.length - 1} aria-label={`${r.naam || "Regel"} omlaag`}><IconOmlaag /></button>
                <button type="button" className="adm-icon-btn" onClick={() => setRegels((x) => x.filter((_, j) => j !== i))} aria-label={`${r.naam || "Regel"} weghalen`}><IconTrash /></button>
              </span>
            </li>
          ))}
        </ol>
        <button type="button" className="adm-btn adm-btn--ghost adm-btn--small" onClick={voegToe}><IconPlus /> Persoon toevoegen</button>
      </section>
    </Drawer>
  );
}

export default function OrganisatieClient({ groepen, loadError, startNieuw, startId }: {
  groepen: Groep[];
  loadError?: string;
  startNieuw?: boolean;
  startId?: string;
}) {
  const [zoek, setZoek] = useState("");
  const [gekozen, setGekozen] = useState<string | null>(startNieuw ? "nieuw" : startId ?? null);
  const [toast, melding] = useToast();

  const groep = gekozen && gekozen !== "nieuw" ? groepen.find((g) => String(g.id) === gekozen) ?? null : null;
  const bestuur = groepen.find((g) => g.soort === "bestuur")?.leden ?? [];
  const kies = (id: string | null) => kiesMetSchuif(gekozen, id, () => setGekozen(id));
  const sluit = () => kies(null);

  // Zoeken op de naam van de groep of van iemand erin
  const secties = useMemo(() => {
    const q = zoek.trim().toLowerCase();
    const past = (g: Groep) => !q || g.naam.toLowerCase().includes(q) || g.leden.some((l) => l.naam.toLowerCase().includes(q));
    return [
      { titel: "Bestuur", items: groepen.filter((g) => g.soort === "bestuur" && past(g)) },
      { titel: "Commissies", items: groepen.filter((g) => g.soort === "commissie" && past(g)) },
      { titel: "Overige taken", items: groepen.filter((g) => g.soort === "overig" && past(g)) },
    ].filter((s) => s.items.length > 0);
  }, [groepen, zoek]);

  const zelfdeSoort = groep ? groepen.filter((g) => g.soort === groep.soort) : [];
  const plek = { eerste: zelfdeSoort[0]?.id === groep?.id, laatste: zelfdeSoort[zelfdeSoort.length - 1]?.id === groep?.id };
  const contactNaam = (g: Groep) => bestuur.find((b) => b.id === g.contactpersoon_id)?.naam.split(" ")[0];
  const commissies = groepen.filter((g) => g.soort === "commissie").length;
  const mensen = new Set(groepen.flatMap((g) => g.leden.map((l) => l.naam.toLowerCase()))).size;

  const lijst = loadError ? (
    <div className="adm-empty"><p className="adm-empty-title">Bestuur en commissies konden niet worden geladen</p><p>{loadError}</p></div>
  ) : (
    <>
      <button className="adm-wb-nieuw" data-id="nieuw" data-gekozen={gekozen === "nieuw" || undefined} onClick={() => kies("nieuw")}>
        <IconPlus /> Commissie toevoegen
      </button>
      {secties.length === 0 ? (
        <div className="adm-empty"><p className="adm-empty-title">{zoek ? <>Niets gevonden voor &ldquo;{zoek}&rdquo;</> : "Nog geen bestuur of commissies"}</p></div>
      ) : secties.map((s) => (
        <section key={s.titel} className="adm-group">
          <h2 className="adm-group-title">{s.titel}</h2>
          <ul className="adm-list">
            {s.items.map((g) => (
              <li key={g.id} data-id={String(g.id)} data-gekozen={gekozen === String(g.id) || undefined} className="adm-row adm-row--plain" onClick={() => kies(String(g.id))}>
                <div className="adm-main-col">
                  <button className="adm-title" onClick={(e) => { e.stopPropagation(); kies(String(g.id)); }}>{g.naam}</button>
                  <div className="adm-meta">
                    <span>{g.soort === "bestuur" ? g.leden.map((l) => l.naam.split(" ")[0]).join(", ") : `${g.leden.length} ${g.leden.length === 1 ? "persoon" : "personen"}`}</span>
                    {g.toelichting && <span>{g.toelichting}</span>}
                    {contactNaam(g) && <span>Contact: {contactNaam(g)}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );

  const blad = gekozen && (gekozen === "nieuw" || groep) ? (
    <GroepDrawer
      // Na opslaan komen nieuwe mensen terug met een id: dan opnieuw beginnen met de verse gegevens
      key={`${gekozen}:${groep?.leden.map((l) => l.id).join(",") ?? ""}`}
      groep={groep}
      bestuur={bestuur}
      plek={plek}
      onClose={sluit}
      onDone={(m, id) => { setGekozen(id ? String(id) : null); melding(m); }}
    />
  ) : null;

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Bestuur &amp; commissies</h1>
          <p className="adm-sub">{bestuur.length} in het bestuur, {commissies} commissies, {mensen} mensen in totaal. Te zien in de ledenomgeving.</p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={() => kies("nieuw")}><IconPlus /> Commissie toevoegen</button>
      </header>

      <div className="adm-toolbar">
        <span />
        <div className="adm-search">
          <IconSearch />
          <input type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Zoek op commissie of naam" aria-label="Zoek op commissie of naam" />
        </div>
      </div>

      <div className="adm-content">
        <Werkblad
          gekozen={gekozen}
          lijst={lijst}
          blad={blad}
          leeg={
            <>
              <p className="adm-empty-title">Kies het bestuur of een commissie</p>
              <p>Pas namen, functies en de volgorde aan. Leden zien het in de ledenomgeving.</p>
              <button className="adm-btn adm-btn--primary" onClick={() => kies("nieuw")}><IconPlus /> Commissie toevoegen</button>
            </>
          }
        />
      </div>
      {toast}
    </div>
  );
}
