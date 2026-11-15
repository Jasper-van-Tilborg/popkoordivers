"use client";

import { useMemo, useRef, useState } from "react";
import { Drawer, DeleteButton, IconOmhoog, IconOmlaag, IconPlus, IconSearch, IconTrash, useNaijlen, useToast } from "../_components/ui";
import { Keuze, Suggestie } from "../_components/velden";
import { uploadNaarR2 } from "../_components/upload";
import { bewaarGroep, verplaatsGroep, verwijderGroep, type GroepInput } from "./actions";

export interface Persoon { id: number; naam: string; functie: string | null; foto_key: string | null; foto: string | null }
export interface Groep {
  id: number;
  naam: string;
  soort: "bestuur" | "smoelenboek" | "commissie" | "overig";
  toelichting: string | null;
  contactpersoon_id: number | null;
  leden: Persoon[];
}

// Een regel in het formulier; nieuwe mensen hebben nog geen id, wel een sleutel
type Regel = { sleutel: string; id?: number; naam: string; functie: string; foto_key: string | null; foto: string | null; uploadt?: boolean };

const FUNCTIES = ["Voorzitter", "Secretaris", "Penningmeester", "Bestuurslid"];
const SOORTEN = [
  { value: "commissie" as const, label: "Commissie" },
  { value: "overig" as const, label: "Overige taken", hint: "Losse taken, zoals materialen of geluid" },
];

let teller = 0;
const sleutel = () => `n${++teller}`;
const leeg = (): Regel => ({ sleutel: sleutel(), naam: "", functie: "", foto_key: null, foto: null });

function GroepDrawer({ groep, nieuwSoort, bestuur, plek, sluitend, onClose, onDone }: {
  groep: Groep | null;
  nieuwSoort: GroepInput["soort"];
  bestuur: Persoon[];
  plek: { eerste: boolean; laatste: boolean };
  sluitend?: boolean;
  onClose: () => void;
  onDone: (melding: string) => void;
}) {
  const isBestuur = groep?.soort === "bestuur";
  const isSmoelenboek = groep?.soort === "smoelenboek";
  // Vaste groepen: geen soort, contactpersoon of plek in de lijst, en niet te verwijderen
  const isVast = isBestuur || isSmoelenboek;
  const [naam, setNaam] = useState(groep?.naam ?? "");
  const [soort, setSoort] = useState<GroepInput["soort"]>(groep ? (groep.soort === "overig" ? "overig" : "commissie") : nieuwSoort);
  const [toelichting, setToelichting] = useState(groep?.toelichting ?? "");
  const [contact, setContact] = useState(groep?.contactpersoon_id ? String(groep.contactpersoon_id) : "");
  const [regels, setRegels] = useState<Regel[]>(() => {
    const r = (groep?.leden ?? []).map((l) => ({ sleutel: `p${l.id}`, id: l.id, naam: l.naam, functie: l.functie ?? "", foto_key: l.foto_key, foto: l.foto }));
    return r.length ? r : [leeg()];
  });
  const [fout, setFout] = useState("");
  const [busy, setBusy] = useState<"save" | "delete" | "plek" | null>(null);
  const lijstRef = useRef<HTMLOListElement>(null);

  const zet = (i: number, veld: "naam" | "functie", v: string) => setRegels((r) => r.map((x, j) => (j === i ? { ...x, [veld]: v } : x)));
  const werkBij = (s: string, wat: Partial<Regel>) => setRegels((r) => r.map((x) => (x.sleutel === s ? { ...x, ...wat } : x)));

  // Een portret kiezen: meteen omhoog, opgeslagen wordt het met de rest
  async function kiesFoto(s: string, file: File | undefined) {
    if (!file) return;
    setFout("");
    werkBij(s, { uploadt: true, foto: URL.createObjectURL(file) });
    try {
      werkBij(s, { foto_key: await uploadNaarR2(file, { soort: "smoel" }), uploadt: false });
    } catch (e) {
      werkBij(s, { uploadt: false, foto: groep?.leden.find((l) => `p${l.id}` === s)?.foto ?? null });
      setFout(e instanceof Error ? e.message : "De foto kon niet worden geüpload.");
    }
  }
  const schuif = (i: number, d: -1 | 1) => setRegels((r) => {
    const n = [...r];
    [n[i], n[i + d]] = [n[i + d], n[i]];
    return n;
  });
  function voegToe() {
    setRegels((r) => [...r, leeg()]);
    // Na het tekenen: focus op de nieuwe naam
    requestAnimationFrame(() => lijstRef.current?.querySelector<HTMLInputElement>("li:last-child input")?.focus());
  }

  async function save() {
    if (!naam.trim()) { setFout("Geef de groep een naam."); return; }
    if (regels.some((r) => r.uploadt)) { setFout("Wacht tot de foto's zijn geüpload."); return; }
    setBusy("save");
    setFout("");
    const res = await bewaarGroep(groep?.id ?? null, {
      naam, soort, toelichting,
      contactpersoon_id: contact ? Number(contact) : null,
      leden: regels.map(({ id, naam, functie, foto_key }) => ({ id, naam, functie, foto_key })),
    });
    setBusy(null);
    if (res.error) setFout(res.error);
    else onDone(groep ? "Wijzigingen opgeslagen" : `${naam.trim()} is toegevoegd`);
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
      sluitend={sluitend}
      title={groep ? groep.naam : nieuwSoort === "overig" ? "Nieuwe taak" : "Nieuwe commissie"}
      onClose={onClose}
      acties={groep && !isVast && (
        <>
          <button className={`adm-icon-btn${plek.eerste ? " adm-icon-btn--off" : ""}`} onClick={() => verplaats(-1)} disabled={plek.eerste || !!busy} title="Eén plek omhoog" aria-label="Eén plek omhoog"><IconOmhoog /></button>
          <button className={`adm-icon-btn${plek.laatste ? " adm-icon-btn--off" : ""}`} onClick={() => verplaats(1)} disabled={plek.laatste || !!busy} title="Eén plek omlaag" aria-label="Eén plek omlaag"><IconOmlaag /></button>
        </>
      )}
      footer={
        <>
          {fout && <p className="adm-server-err" role="alert">{fout}</p>}
          <div className="adm-foot-actions">
            {groep && !isVast && <DeleteButton onConfirm={remove} busy={busy === "delete"} />}
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
          {!isVast && (
            <div className="adm-field">
              <label htmlFor="gr-soort">Soort</label>
              <Keuze id="gr-soort" value={soort} onChange={setSoort} opties={SOORTEN} />
            </div>
          )}
        </div>
        {!isSmoelenboek && <div className="adm-grid-2">
          <div className="adm-field">
            <label htmlFor="gr-toelichting">Toelichting <span className="adm-optional">optioneel</span></label>
            <input id="gr-toelichting" className="adm-input" value={toelichting} onChange={(e) => setToelichting(e.target.value)} placeholder="bijv. 16 t/m 18 april 2027" />
            <p className="adm-hint">Staat onder de naam in de ledenomgeving.</p>
          </div>
          {!isVast && (
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
        </div>}
      </section>

      <section className="adm-fieldset">
        <h3>{isBestuur ? "Bestuursleden" : "Leden"}</h3>
        <p className="adm-hint" style={{ marginTop: 0 }}>{isSmoelenboek ? "In de ledenomgeving staan ze op alfabet." : "In deze volgorde staan ze in de ledenomgeving."} Een lege regel wordt overgeslagen.</p>
        <ol className={`adm-personen${isSmoelenboek ? " adm-personen--foto" : ""}`} ref={lijstRef}>
          {regels.map((r, i) => (
            <li key={r.sleutel}>
              {isSmoelenboek && (
                <label className="adm-avatar adm-avatar--kies" data-bezig={r.uploadt || undefined} title={r.foto ? "Andere foto kiezen" : "Foto kiezen"}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {r.foto ? <img src={r.foto} alt="" /> : initialen(r.naam || "?")}
                  <input type="file" hidden accept="image/*" aria-label={`Foto van ${r.naam || `persoon ${i + 1}`}`}
                    onChange={(e) => { kiesFoto(r.sleutel, e.target.files?.[0]); e.target.value = ""; }} />
                </label>
              )}
              <input className="adm-input" value={r.naam} onChange={(e) => zet(i, "naam", e.target.value)} placeholder="Naam" aria-label={`Naam ${i + 1}`} />
              {isBestuur ? (
                <Suggestie value={r.functie} onChange={(v) => zet(i, "functie", v)} suggesties={FUNCTIES} placeholder="Functie" />
              ) : (
                <input className="adm-input" value={r.functie} onChange={(e) => zet(i, "functie", e.target.value)} placeholder={isSmoelenboek ? "bijv. Alt of dirigent" : soort === "overig" ? "bijv. Materialen" : "bijv. dirigent of extern"} aria-label={`${functieLabel} ${i + 1}`} />
              )}
              <span className="adm-personen-knoppen">
                {!isSmoelenboek && <>
                  <button type="button" className={`adm-icon-btn${i === 0 ? " adm-icon-btn--off" : ""}`} onClick={() => schuif(i, -1)} disabled={i === 0} aria-label={`${r.naam || "Regel"} omhoog`}><IconOmhoog /></button>
                  <button type="button" className={`adm-icon-btn${i === regels.length - 1 ? " adm-icon-btn--off" : ""}`} onClick={() => schuif(i, 1)} disabled={i === regels.length - 1} aria-label={`${r.naam || "Regel"} omlaag`}><IconOmlaag /></button>
                </>}
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

const initialen = (naam: string) => naam.split(/\s+/).filter((w) => w && w[0] === w[0].toUpperCase()).map((w) => w[0]).join("").slice(0, 2) || naam.slice(0, 2).toUpperCase();

export default function OrganisatieClient({ groepen, loadError, startNieuw, startId }: {
  groepen: Groep[];
  loadError?: string;
  startNieuw?: boolean;
  startId?: string;
}) {
  const [zoek, setZoek] = useState("");
  // Een id, of "nieuw:commissie" / "nieuw:overig"
  const [gekozen, setGekozen] = useState<string | null>(startNieuw ? "nieuw:commissie" : startId ?? null);
  const [open, sluitend] = useNaijlen(gekozen);
  const [toast, melding] = useToast();

  const nieuw = open?.startsWith("nieuw:") ? (open.slice(6) as GroepInput["soort"]) : null;
  const groep = open && !nieuw ? groepen.find((g) => String(g.id) === open) ?? null : null;
  const bestuurGroep = groepen.find((g) => g.soort === "bestuur");
  const bestuur = bestuurGroep?.leden ?? [];
  const smoelenboekGroep = groepen.find((g) => g.soort === "smoelenboek");

  // Zoeken op de naam van de groep of van iemand erin
  const q = zoek.trim().toLowerCase();
  const past = (g: Groep) => !q || g.naam.toLowerCase().includes(q) || g.leden.some((l) => l.naam.toLowerCase().includes(q));
  const commissies = useMemo(() => groepen.filter((g) => g.soort === "commissie"), [groepen]);
  const overig = useMemo(() => groepen.filter((g) => g.soort === "overig"), [groepen]);

  const zelfdeSoort = groep ? groepen.filter((g) => g.soort === groep.soort) : [];
  const plek = { eerste: zelfdeSoort[0]?.id === groep?.id, laatste: zelfdeSoort[zelfdeSoort.length - 1]?.id === groep?.id };
  const contactNaam = (g: Groep) => bestuur.find((b) => b.id === g.contactpersoon_id)?.naam;

  const kaarten = (titel: string, soort: GroepInput["soort"], items: Groep[]) => {
    const zichtbaar = items.filter(past);
    if (q && zichtbaar.length === 0) return null;
    return (
      <section className="adm-group">
        <h2 className="adm-group-title">{titel} <span className="adm-count">{items.length}</span></h2>
        <ul className="adm-cards adm-cards--groep">
          {zichtbaar.map((g, i) => (
            <li key={g.id} className="adm-card" style={{ animationDelay: `${Math.min(i, 8) * 30 + 60}ms` }} onClick={() => setGekozen(String(g.id))}>
              <div className="adm-card-body">
                <button className="adm-title" onClick={(e) => { e.stopPropagation(); setGekozen(String(g.id)); }}>{g.naam}</button>
                {g.toelichting && <p className="adm-card-tekst">{g.toelichting}</p>}
                {g.leden.length > 0 ? (
                  <ul className="adm-groep-namen">
                    {g.leden.map((l) => <li key={l.id}>{l.naam}{l.functie && <span>{l.functie}</span>}</li>)}
                  </ul>
                ) : <p className="adm-card-tekst adm-missing">Nog niemand</p>}
              </div>
              <div className="adm-card-foot">
                <span className="adm-pill">{g.leden.length} {g.leden.length === 1 ? "persoon" : "personen"}</span>
                {contactNaam(g) && <span className="adm-groep-contact">Contact: {contactNaam(g)}</span>}
              </div>
            </li>
          ))}
          {!q && (
            <li>
              <button className="adm-card-nieuw" style={{ width: "100%", height: "100%" }} onClick={() => setGekozen(`nieuw:${soort}`)}>
                <IconPlus /> {soort === "overig" ? "Taak toevoegen" : "Commissie toevoegen"}
              </button>
            </li>
          )}
        </ul>
      </section>
    );
  };

  const inhoud = loadError ? (
    <div className="adm-empty"><p className="adm-empty-title">Wie is wie kon niet worden geladen</p><p>{loadError}</p></div>
  ) : (
    <>
      {bestuurGroep && past(bestuurGroep) && (
        <section className="adm-blok adm-blok--bestuur">
          <div className="adm-blok-kop">
            <h2>{bestuurGroep.naam}</h2>
            <button className="adm-btn adm-btn--ghost adm-btn--small" onClick={() => setGekozen(String(bestuurGroep.id))}>Bewerken</button>
          </div>
          {bestuurGroep.toelichting && <p className="adm-blok-tekst">{bestuurGroep.toelichting}</p>}
          {bestuur.length > 0 ? (
            <ul className="adm-bestuur">
              {bestuur.map((p) => (
                <li key={p.id}>
                  <span className="adm-avatar" aria-hidden="true">{initialen(p.naam)}</span>
                  <span className="adm-bestuur-naam">{p.naam}</span>
                  {p.functie && <span className="adm-bestuur-functie">{p.functie}</span>}
                </li>
              ))}
            </ul>
          ) : <p className="adm-blok-leeg">Nog niemand in het bestuur</p>}
        </section>
      )}
      {smoelenboekGroep && past(smoelenboekGroep) && (
        <section className="adm-blok adm-blok--smoelenboek">
          <div className="adm-blok-kop">
            <h2>{smoelenboekGroep.naam} <span className="adm-count">{smoelenboekGroep.leden.length}</span></h2>
            <button className="adm-btn adm-btn--ghost adm-btn--small" onClick={() => setGekozen(String(smoelenboekGroep.id))}>Bewerken</button>
          </div>
          {smoelenboekGroep.leden.length > 0 ? (
            <ul className="adm-bestuur">
              {smoelenboekGroep.leden.filter((l) => !q || l.naam.toLowerCase().includes(q) || smoelenboekGroep.naam.toLowerCase().includes(q)).map((p) => (
                <li key={p.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <span className="adm-avatar" aria-hidden="true">{p.foto ? <img src={p.foto} alt="" loading="lazy" /> : initialen(p.naam)}</span>
                  <span className="adm-bestuur-naam">{p.naam}</span>
                  {p.functie && <span className="adm-bestuur-functie">{p.functie}</span>}
                </li>
              ))}
            </ul>
          ) : <p className="adm-blok-leeg">Nog niemand in het smoelenboek</p>}
        </section>
      )}
      {kaarten("Commissies", "commissie", commissies)}
      {kaarten("Overige taken", "overig", overig)}
      {q && !groepen.some(past) && (
        <div className="adm-empty"><p className="adm-empty-title">Niets gevonden voor &ldquo;{zoek}&rdquo;</p></div>
      )}
    </>
  );

  const venster = open && (nieuw || groep) ? (
    <GroepDrawer
      key={open}
      groep={groep}
      nieuwSoort={nieuw ?? "commissie"}
      bestuur={bestuur}
      plek={plek}
      sluitend={sluitend}
      onClose={() => setGekozen(null)}
      onDone={(m) => { setGekozen(null); melding(m); }}
    />
  ) : null;

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Wie is wie</h1>
          <p className="adm-sub">{bestuur.length} in het bestuur, {commissies.length} commissies, {smoelenboekGroep?.leden.length ?? 0} in het smoelenboek.</p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={() => setGekozen("nieuw:commissie")}><IconPlus /> Commissie toevoegen</button>
      </header>

      <div className="adm-toolbar">
        <span />
        <div className="adm-search">
          <IconSearch />
          <input type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Zoek op commissie of naam" aria-label="Zoek op commissie of naam" />
        </div>
      </div>

      <div className="adm-content">{inhoud}</div>
      {venster}
      {toast}
    </div>
  );
}
