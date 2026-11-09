"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { bestandDownload, bestandUrl } from "../actions";
import Speler from "./Speler";

// Compleet: de opnames voor het hele koor, net als op de oude site een eigen tabblad
const stemgroepen = ["Sopraan", "Mezzo", "Alt", "Tenor", "Bas", "Compleet"] as const;
type Stemgroep = (typeof stemgroepen)[number];

interface Lied {
  id: number;
  titel: string;
  // Het liednummer uit de map van het koor
  nummer?: number | null;
  ext?: string;
}

const nr = (n?: number | null) => (n ? String(n).padStart(3, "0") : "");

// Standaard de hoogste liednummers (het nieuwste repertoire) bovenaan; zonder nummer onderaan
const SORTERING = {
  "nummer-af": { label: "Nummer hoog–laag", vergelijk: (a: Lied, b: Lied) => (b.nummer ?? 0) - (a.nummer ?? 0) },
  "nummer-op": { label: "Nummer laag–hoog", vergelijk: (a: Lied, b: Lied) => (a.nummer ?? 1000) - (b.nummer ?? 1000) },
  naam: { label: "Naam A–Z", vergelijk: () => 0 },
} as const;
type Sortering = keyof typeof SORTERING;

// Zoeken zonder op hoofdletters of accenten te letten
const gewoon = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Wat de browser kan afspelen, speelt op de pagina af; de rest (pdf, wma) opent als bestand.
const AUDIO = ["mp3", "m4a", "wav", "ogg", "aac"];
const soort = (ext?: string) => ext === "pdf" ? "pdf" : AUDIO.includes(ext ?? "") ? "audio" : ext === "mp4" ? "video" : "anders";
const KNOP = { pdf: "PDF ↓", audio: "Luisteren", video: "Video", anders: "Openen" };
// Op de telefoon staat alleen het icoon in de knop (de hele rij is klikbaar)
const pad = (d: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="lied-knop-icoon">{d === "play" ? <path d="M7 4.6v14.8a1 1 0 0 0 1.5.86l12.2-7.4a1 1 0 0 0 0-1.72L8.5 3.74A1 1 0 0 0 7 4.6z" fill="currentColor" stroke="none" /> : d === "video" ? <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3" /></> : <path d="M12 4v12m0 0-5-5m5 5 5-5M5 20h14" />}</svg>;
const ICOON = { pdf: pad("omlaag"), audio: pad("play"), video: pad("video"), anders: pad("omlaag") };

interface Props {
  liedjes: Record<string, Lied[]>;
  // De stemgroep van het lid zelf; daar opent de lijst mee
  begin?: string | null;
}

export default function StemTabs({ liedjes, begin }: Props) {
  const [active, setActive] = useState<Stemgroep>(stemgroepen.find((s) => s === begin) ?? "Sopraan");
  const [gekozenPagina, setPagina] = useState(0);
  const [perPagina, setPerPagina] = useState(10);
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
  const paginas = Math.ceil(huidigeLiedjes.length / perPagina);
  const pagina = Math.min(gekozenPagina, Math.max(paginas - 1, 0));
  const zichtbaar = huidigeLiedjes.slice(pagina * perPagina, (pagina + 1) * perPagina);
  const lijst = useRef<HTMLDivElement>(null);
  const speler = useRef<HTMLDialogElement>(null);
  const [speelt, setSpeelt] = useState<{ lied: Lied; url: string | null } | null>(null);
  const [fout, setFout] = useState("");

  // Zoveel opnames per pagina dat de hele lijst, met de knoppen eronder, in één
  // scherm past (bovenaan de pagina). Opnieuw bij een andere stem of schermgrootte.
  useLayoutEffect(() => {
    function meet() {
      const blok = lijst.current;
      const rijen = blok?.querySelector(".liedjes");
      if (!blok || !rijen?.children.length) return;
      const rij = rijen.getBoundingClientRect();
      const hoogte = rij.height / rijen.children.length;
      const onder = (blok.parentElement ?? blok).getBoundingClientRect().bottom - rij.bottom;
      const balk = document.querySelector<HTMLElement>(".ln-tabbalk");
      const balkHoogte = balk && getComputedStyle(balk).display !== "none" ? balk.offsetHeight : 0;
      const ruimte = window.innerHeight - (rij.top + window.scrollY) - onder - balkHoogte - 24;
      const per = Math.min(Math.max(Math.floor(ruimte / hoogte), 4), 30);
      setPerPagina((oud) => (oud === per ? oud : per));
    }
    meet();
    // Na het inschuiven van de pagina en het laden van de letters nog een keer
    const laat = setTimeout(meet, 700);
    document.fonts?.ready.then(meet);
    window.addEventListener("resize", meet);
    return () => { clearTimeout(laat); window.removeEventListener("resize", meet); };
  }, [active]);

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

  function kiesStem(stem: Stemgroep) {
    if (stem === active) return;
    setRichting(stemgroepen.indexOf(stem) > stemgroepen.indexOf(active) ? "rechts" : "links");
    setActive(stem);
    setPagina(0);
  }

  function zoekNaar(tekst: string) {
    // Tijdens het typen niet laten schuiven
    setRichting(null);
    setZoek(tekst);
    setPagina(0);
  }

  function sorteer(s: Sortering) {
    setRichting(null);
    setSortering(s);
    setPagina(0);
  }

  function naarPagina(p: number) {
    setRichting(p > pagina ? "rechts" : "links");
    setPagina(p);
    // Bij "Volgende" onderaan: terug naar het begin van de lijst
    const top = lijst.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) lijst.current?.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  // De link is een uur geldig en wordt pas bij openen opgehaald
  async function speel(lied: Lied) {
    setFout("");
    setSpeelt({ lied, url: null });
    speler.current?.showModal();
    const url = await bestandUrl(lied.id);
    if (!url) { speler.current?.close(); setFout("Dit bestand kon niet worden geopend. Log opnieuw in en probeer het nog eens."); return; }
    setSpeelt((s) => (s?.lied.id === lied.id ? { lied, url } : s));
  }

  // De link vraagt de browser het bestand op te slaan; de pagina blijft staan
  async function download(lied: Lied) {
    setFout("");
    const url = await bestandDownload(lied.id);
    if (url) window.location.assign(url);
    else setFout("Dit bestand kon niet worden gedownload. Log opnieuw in en probeer het nog eens.");
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
      <div className="stemtabs-balk">
        <div ref={tabs} role="tablist" className="stemtabs stemtabs--vlak">
          <span ref={vlak} className="stemtab-vlak" aria-hidden="true" />
          {stemgroepen.map((stem) => {
            const aantal = (liedjes[stem] ?? []).filter(past).length;
            return (
              <button key={stem} role="tab" aria-selected={active === stem} onClick={() => kiesStem(stem)} className="stemtab">
                {stem}
                {aantal > 0 && <span className="stemtab-aantal">{aantal}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="liedjes-zoekbalk">
        <div className="liedjes-zoek">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input type="search" value={zoek} onChange={(e) => zoekNaar(e.target.value)} placeholder="Naam of liednummer" aria-label="Zoek op naam of liednummer" />
        </div>
        <select className="liedjes-sorteer" value={sortering} onChange={(e) => sorteer(e.target.value as Sortering)} aria-label="Sorteren">
          {Object.entries(SORTERING).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
        </select>
      </div>

      {fout && <p className="liedjes-fout" role="alert">{fout}</p>}

      {huidigeLiedjes.length === 0 ? (
        <p className="liedjes-leeg">{zoek.trim() ? `Geen opnames gevonden voor "${zoek.trim()}" bij ${active}.` : "Nog geen opnames toegevoegd."}</p>
      ) : (
        <div key={`${active}-${pagina}`} className="liedjes" data-richting={richting ?? undefined}>
          {zichtbaar.map((lied, i) => {
            const s = soort(lied.ext);
            return (
              <div key={lied.id} className="lied" style={{ "--i": i } as React.CSSProperties}>
                <span className="lied-nummer" aria-label={lied.nummer ? `Liednummer ${lied.nummer}` : undefined}>{nr(lied.nummer)}</span>
                <div className="lied-tekst">
                  <p className="lied-titel">{lied.titel}</p>
                </div>
                <div className="lied-knoppen">
                  <button type="button" className="lied-download" aria-label={`Downloaden: ${lied.titel}`} title="Downloaden" onClick={() => download(lied)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14" /></svg>
                  </button>
                  <button type="button" className="lied-pdf" aria-label={`${KNOP[s].replace(" ↓", "")}: ${lied.titel}`} onClick={() => (s === "audio" || s === "video" ? speel(lied) : open(lied))}>
                    {ICOON[s]}<span className="lied-knop-tekst">{KNOP[s]}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {paginas > 1 && (
        <nav className="liedjes-paginas" aria-label="Pagina's">
          <button type="button" className="liedjes-pagina-knop" onClick={() => naarPagina(pagina - 1)} disabled={pagina === 0}>Vorige</button>
          <span className="liedjes-pagina-tekst" aria-live="polite"><span className="liedjes-pagina-woord">Pagina </span>{pagina + 1} van {paginas}</span>
          <button type="button" className="liedjes-pagina-knop" onClick={() => naarPagina(pagina + 1)} disabled={pagina === paginas - 1}>Volgende</button>
        </nav>
      )}

      {/* Sluiten haalt de speler weg, dan stopt het geluid ook */}
      <dialog
        ref={speler}
        className="speler"
        data-video={speelt && soort(speelt.lied.ext) === "video" ? "" : undefined}
        aria-label={speelt?.lied.titel}
        onClose={() => setSpeelt(null)}
        onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }}
      >
        {speelt && (
          <Speler
            key={speelt.lied.id}
            kop={speelt.lied.titel}
            details={speelt.lied.nummer ? `Liednummer ${nr(speelt.lied.nummer)}` : undefined}
            url={speelt.url}
            video={soort(speelt.lied.ext) === "video"}
            onSluit={() => speler.current?.close()}
          />
        )}
      </dialog>
    </div>
  );
}
