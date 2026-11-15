"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { bestandDownload, bestandTekst, bestandUrl } from "../actions";
import Lezer from "./Lezer";
import Speler from "./Speler";

// Compleet: de opnames voor het hele koor, net als op de oude site een eigen tabblad.
// Andere lijsten (zoals Choreografie) geven hun eigen tabbladen mee.
const stemgroepen = ["Sopraan", "Mezzo", "Alt", "Tenor", "Bas", "Compleet"];

interface Bestand {
  id: number;
  ext: string;
}

interface Lied {
  id: number;
  titel: string;
  // Het liednummer uit de map van het koor
  nummer?: number | null;
  ext?: string;
  // Meer bestanden bij één lied (Choreografie: video en beschrijving), elk een eigen
  // knop op een vaste plek; null laat die plek leeg. Downloaden kan dan in het venster.
  knoppen?: (Bestand | null)[];
}

const nr = (n?: number | null) => (n ? String(n).padStart(3, "0") : "");

// Standaard de hoogste liednummers (het nieuwste repertoire) bovenaan; zonder nummer onderaan
const SORTERING = {
  "nummer-af": { label: "Nummer hoog–laag", vergelijk: (a: Lied, b: Lied) => (b.nummer ?? 0) - (a.nummer ?? 0) },
  "nummer-op": { label: "Nummer laag–hoog", vergelijk: (a: Lied, b: Lied) => (a.nummer ?? 1000) - (b.nummer ?? 1000) },
  naam: { label: "Naam A–Z", vergelijk: () => 0 },
} as const;
type Sortering = keyof typeof SORTERING;

// Sorteren in de stijl van de site: een knop met een eigen menu (een gewone keuzelijst
// toont het menu van het systeem). Pijltjes, Enter en Escape werken zoals verwacht.
function Sorteer({ waarde, kies }: { waarde: Sortering; kies: (s: Sortering) => void }) {
  const [open, setOpen] = useState(false);
  const blok = useRef<HTMLDivElement>(null);
  const knop = useRef<HTMLButtonElement>(null);
  const opties = Object.keys(SORTERING) as Sortering[];

  useEffect(() => {
    if (!open) return;
    blok.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus();
    const buiten = (e: PointerEvent) => { if (!blok.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", buiten);
    return () => document.removeEventListener("pointerdown", buiten);
  }, [open]);

  function toets(e: React.KeyboardEvent) {
    const items = [...(blok.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])];
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") { setOpen(false); knop.current?.focus(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); items[Math.min(i + 1, items.length - 1)]?.focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); items[Math.max(i - 1, 0)]?.focus(); }
    else if (e.key === "Tab") setOpen(false);
  }

  function neem(s: Sortering) {
    kies(s);
    setOpen(false);
    knop.current?.focus();
  }

  return (
    <div ref={blok} className="sorteer" onKeyDown={toets}>
      <button ref={knop} type="button" className="sorteer-knop" aria-haspopup="listbox" aria-expanded={open} aria-label={`Sorteren: ${SORTERING[waarde].label}`} onClick={() => setOpen(!open)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3" /></svg>
        <span className="sorteer-tekst">{SORTERING[waarde].label}</span>
        <svg className="sorteer-pijl" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {open && (
        <div role="listbox" aria-label="Sorteren" className="sorteer-menu">
          {opties.map((s) => (
            <button key={s} type="button" role="option" aria-selected={s === waarde} className="sorteer-optie" onClick={() => neem(s)}>
              {SORTERING[s].label}
              {s === waarde && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Zoeken zonder op hoofdletters of accenten te letten
const gewoon = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Zoveel mogelijk op de site zelf: geluid en video in de speler, een Word-bestand (docx)
// als tekst in hetzelfde venster. De rest (pdf, wma, oude .doc) opent als bestand.
const AUDIO = ["mp3", "m4a", "wav", "ogg", "aac"];
export const soort = (ext?: string) => ext === "pdf" ? "pdf" : AUDIO.includes(ext ?? "") ? "audio" : ext === "mp4" ? "video" : ext === "docx" ? "word" : "anders";
// Een mp4 kan video zijn of alleen geluid; de speler ziet dat pas bij het openen
export const KNOP = { pdf: "PDF ↓", audio: "Luisteren", video: "Afspelen", word: "Lezen", anders: "Openen" };
// Op de telefoon staat alleen het icoon in de knop (de hele rij is klikbaar)
const pad = (d: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="lied-knop-icoon">{d === "play" ? <path d="M7 4.6v14.8a1 1 0 0 0 1.5.86l12.2-7.4a1 1 0 0 0 0-1.72L8.5 3.74A1 1 0 0 0 7 4.6z" fill="currentColor" stroke="none" /> : d === "lees" ? <path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6" /> : <path d="M12 4v12m0 0-5-5m5 5 5-5M5 20h14" />}</svg>;
export const ICOON = { pdf: pad("omlaag"), audio: pad("play"), video: pad("play"), word: pad("lees"), anders: pad("omlaag") };

interface Props {
  liedjes: Record<string, Lied[]>;
  // De tabbladen, standaard de stemgroepen
  tabs?: readonly string[];
  // Wat er in de lijst staat, voor de tekst als er niets is: "opnames"
  wat?: string;
  // Het tabblad om mee te openen: de eigen stem, of die van de vorige keer
  start?: string | null;
  // Onthoudt het gekozen tabblad in een cookie met deze naam (de server leest hem als start)
  onthoud?: string;
}

// De titel zonder de stem van het tabblad: "Viva La Vida Alt-2" wordt "Viva La Vida",
// met "Alt-2" klein eronder. Staat de stem er niet (of vooraan) in, dan blijft hij heel.
function splits(titel: string, tab: string) {
  // Alleen bij de stemmen en Compleet; de namen zijn gewone woorden
  const m = stemgroepen.includes(tab) ? new RegExp(`\\s${tab}(?![a-z])`, "i").exec(titel) : null;
  return m ? { hoofd: titel.slice(0, m.index).trim(), sub: titel.slice(m.index).trim() } : { hoofd: titel, sub: "" };
}

// Een jaar onthouden, alleen voor de ledenomgeving
function bewaar(naam: string, waarde: string) {
  document.cookie = `${naam}=${encodeURIComponent(waarde)}; path=/leden; max-age=31536000; samesite=lax`;
}

export default function StemTabs({ liedjes, tabs: tabbladen = stemgroepen, wat = "opnames", start, onthoud }: Props) {
  const [active, setActive] = useState(start && tabbladen.includes(start) ? start : tabbladen[0]);
  const [zoek, setZoek] = useState("");
  const [sortering, setSortering] = useState<Sortering>("nummer-af");
  // Waar de nieuwe rijen vandaan komen: rechts bij verder, links bij terug
  const [richting, setRichting] = useState<"rechts" | "links" | null>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const vlak = useRef<HTMLSpanElement>(null);
  const woorden = gewoon(zoek).split(/\s+/).filter(Boolean);
  // Zoeken kan ook op liednummer: "30" en "030" vinden allebei nummer 30
  const past = (l: Lied) => woorden.every((w) => gewoon(`${nr(l.nummer)} ${l.nummer ?? ""} ${l.titel}`).includes(w));
  const huidigeLiedjes = (liedjes[active] ?? [])
    .filter(past)
    .sort((a, b) => SORTERING[sortering].vergelijk(a, b) || a.titel.localeCompare(b.titel, "nl"));
  const lijst = useRef<HTMLDivElement>(null);
  const speler = useRef<HTMLDialogElement>(null);
  const [speelt, setSpeelt] = useState<{ lied: Lied; url: string | null; alleenGeluid?: boolean } | null>(null);
  const toontBeeld = !!speelt && soort(speelt.lied.ext) === "video" && !speelt.alleenGeluid;
  const [leest, setLeest] = useState<{ lied: Lied; html: string | null } | null>(null);
  const [fout, setFout] = useState("");

  // Het witte vlak achter de gekozen stem schuift mee; de eerste keer staat het er meteen
  useLayoutEffect(() => {
    function zet() {
      const el = vlak.current;
      const knop = tabs.current?.querySelector<HTMLElement>('[aria-selected="true"]');
      if (!el || !knop) return;
      Object.assign(el.style, {
        width: `${knop.offsetWidth}px`, height: `${knop.offsetHeight}px`,
        transform: `translate(${knop.offsetLeft}px, ${knop.offsetTop}px)`,
      });
      if (!el.dataset.klaar) requestAnimationFrame(() => { el.dataset.klaar = ""; });
    }
    zet();
    window.addEventListener("resize", zet);
    return () => window.removeEventListener("resize", zet);
  }, [active]);

  function kiesStem(stem: string) {
    if (stem === active) return;
    setRichting(tabbladen.indexOf(stem) > tabbladen.indexOf(active) ? "rechts" : "links");
    setActive(stem);
    if (onthoud) bewaar(onthoud, stem);
    // Ver naar beneden gescrold (de tabbladen blijven op de telefoon staan): de nieuwe lijst van boven
    const top = lijst.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) lijst.current?.scrollIntoView({ block: "start" });
  }

  function zoekNaar(tekst: string) {
    // Tijdens het typen niet laten schuiven
    setRichting(null);
    setZoek(tekst);
  }

  function sorteer(s: Sortering) {
    setRichting(null);
    setSortering(s);
  }

  // De link is een uur geldig en wordt pas bij openen opgehaald
  async function speel(lied: Lied) {
    setFout("");
    setLeest(null);
    setSpeelt({ lied, url: null });
    speler.current?.showModal();
    const url = await bestandUrl(lied.id);
    if (!url) { speler.current?.close(); setFout("Dit bestand kon niet worden geopend. Log opnieuw in en probeer het nog eens."); return; }
    setSpeelt((s) => (s?.lied.id === lied.id ? { lied, url } : s));
  }

  // Het document als tekst op de pagina; lukt dat niet, dan gewoon downloaden
  async function lees(lied: Lied) {
    setFout("");
    setSpeelt(null);
    setLeest({ lied, html: null });
    speler.current?.showModal();
    const html = await bestandTekst(lied.id).catch(() => null);
    if (html === null) { speler.current?.close(); download(lied); return; }
    setLeest((l) => (l?.lied.id === lied.id ? { lied, html } : l));
  }

  // De link vraagt de browser het bestand op te slaan; de pagina blijft staan
  async function download(lied: Lied) {
    setFout("");
    const url = await bestandDownload(lied.id);
    if (url) window.location.assign(url);
    else setFout("Dit bestand kon niet worden gedownload. Log opnieuw in en probeer het nog eens.");
  }

  // Onder de titel in het venster: de stem en versie, en het liednummer
  const details = (lied: Lied) =>
    [splits(lied.titel, active).sub, lied.nummer ? `Liednummer ${nr(lied.nummer)}` : ""].filter(Boolean).join(" · ") || undefined;

  // Wat de knop van een bestand doet: afspelen, lezen of openen
  function actie(lied: Lied) {
    const s = soort(lied.ext);
    if (s === "audio" || s === "video") speel(lied);
    else if (s === "word") lees(lied);
    else open(lied);
  }

  async function open(lied: Lied) {
    setFout("");
    // Het venster meteen openen, anders houdt de browser het tegen
    const venster = window.open("", "_blank");
    const url = await bestandUrl(lied.id);
    if (url && venster) venster.location.href = url;
    else { venster?.close(); setFout("Dit bestand kon niet worden geopend. Log opnieuw in en probeer het nog eens."); }
  }

  return (
    <div ref={lijst} className="stemtabs-blok">
      {tabbladen.length > 1 && <div className="stemtabs-balk">
        <div ref={tabs} role="tablist" className="stemtabs stemtabs--vlak" style={{ "--kolommen": Math.min(tabbladen.length, 3) } as React.CSSProperties}>
          <span ref={vlak} className="stemtab-vlak" aria-hidden="true" />
          {tabbladen.map((stem) => {
            const aantal = (liedjes[stem] ?? []).filter(past).length;
            return (
              <button key={stem} role="tab" aria-selected={active === stem} onClick={() => kiesStem(stem)} className="stemtab">
                {stem}
                {aantal > 0 && <span className="stemtab-aantal">{aantal}</span>}
              </button>
            );
          })}
        </div>
      </div>}

      <div className="liedjes-zoekbalk">
        <div className="liedjes-zoek">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input type="search" value={zoek} onChange={(e) => zoekNaar(e.target.value)} placeholder="Naam of liednummer" aria-label="Zoek op naam of liednummer" />
        </div>
        <Sorteer waarde={sortering} kies={sorteer} />
      </div>

      {fout && <p className="liedjes-fout" role="alert">{fout}</p>}

      {huidigeLiedjes.length === 0 ? (
        <p className="liedjes-leeg">{zoek.trim() ? `Geen ${wat} gevonden voor "${zoek.trim()}"${tabbladen.length > 1 ? ` bij ${active}` : ""}.` : `Nog geen ${wat} toegevoegd.`}</p>
      ) : (
        <div key={active} className="liedjes" data-richting={richting ?? undefined}>
          {huidigeLiedjes.map((lied, i) => {
            const s = soort(lied.ext);
            const { hoofd, sub } = splits(lied.titel, active);
            return (
              <div key={lied.id} className={lied.knoppen ? "lied lied--knoppen" : "lied"} style={{ "--i": i } as React.CSSProperties}>
                <span className="lied-nummer" aria-label={lied.nummer ? `Liednummer ${lied.nummer}` : undefined}>{nr(lied.nummer)}</span>
                <div className="lied-tekst">
                  <p className="lied-titel">{hoofd}</p>
                  {sub && <p className="lied-componist">{sub}</p>}
                </div>
                <div className="lied-knoppen">
                  {lied.knoppen ? (
                    lied.knoppen.map((b, k) => {
                      if (!b) return <span key={k} className="lied-knop-leeg" aria-hidden="true" />;
                      const bs = soort(b.ext);
                      return (
                        <button key={k} type="button" className="lied-pdf" aria-label={`${KNOP[bs].replace(" ↓", "")}: ${lied.titel}`} onClick={() => actie({ ...lied, ...b })}>
                          {ICOON[bs]}<span className="lied-knop-tekst">{KNOP[bs]}</span>
                        </button>
                      );
                    })
                  ) : (
                    <>
                      <button type="button" className="lied-download" aria-label={`Downloaden: ${lied.titel}`} title="Downloaden" onClick={() => download(lied)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14" /></svg>
                      </button>
                      <button type="button" className="lied-pdf" aria-label={`${KNOP[s].replace(" ↓", "")}: ${lied.titel}`} onClick={() => actie(lied)}>
                        {ICOON[s]}<span className="lied-knop-tekst">{KNOP[s]}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sluiten haalt de speler (of het document) weg, dan stopt het geluid ook */}
      <dialog
        ref={speler}
        className="speler"
        data-video={toontBeeld ? "" : undefined}
        data-document={leest ? "" : undefined}
        aria-label={(speelt ?? leest)?.lied.titel}
        onClose={() => { setSpeelt(null); setLeest(null); }}
        onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }}
      >
        {speelt && (
          <Speler
            key={speelt.lied.id}
            kop={splits(speelt.lied.titel, active).hoofd}
            details={details(speelt.lied)}
            url={speelt.url}
            video={toontBeeld}
            onSluit={() => speler.current?.close()}
            onGeenBeeld={() => setSpeelt((s) => (s ? { ...s, alleenGeluid: true } : s))}
            onDownload={speelt.lied.knoppen ? () => download(speelt.lied) : undefined}
          />
        )}
        {leest && (
          <Lezer
            key={leest.lied.id}
            kop={splits(leest.lied.titel, active).hoofd}
            details={details(leest.lied)}
            html={leest.html}
            onSluit={() => speler.current?.close()}
            onDownload={leest.lied.knoppen ? () => download(leest.lied) : undefined}
          />
        )}
      </dialog>
    </div>
  );
}
