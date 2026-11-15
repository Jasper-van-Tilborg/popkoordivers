"use client";

import { Fragment, useLayoutEffect, useRef, useState } from "react";
import { bestandDownload, bestandTekst, bestandUrl } from "../actions";
import Lezer from "./Lezer";
import { ICOON, KNOP, soort } from "./StemTabs";

export interface Document {
  id: number;
  naam: string;
  // "2026-05-03": wanneer de nieuwsbrief uitkwam, of de datum van de ALV
  datum: string;
  ext: string;
}

const TABS = ["Nieuwsbrieven", "ALV-stukken"] as const;
type Tab = (typeof TABS)[number];

const datumTekst = (iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("nl-NL", opts);

// Zoeken zonder op hoofdletters of accenten te letten
const gewoon = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Nieuwsbrieven per jaar, ALV-stukken per vergadering; de lijst is al op datum gesorteerd
function groepeer(tab: Tab, docs: Document[]) {
  const titel = (d: Document) => (tab === "ALV-stukken" ? `ALV ${datumTekst(d.datum)}` : d.datum.slice(0, 4));
  const per = new Map<string, Document[]>();
  for (const d of docs) per.set(titel(d), [...(per.get(titel(d)) ?? []), d]);
  return [...per];
}

export default function Documenten({ nieuwsbrieven, alv }: { nieuwsbrieven: Document[]; alv: Document[] }) {
  const lijsten: Record<Tab, Document[]> = { Nieuwsbrieven: nieuwsbrieven, "ALV-stukken": alv };
  const [active, setActive] = useState<Tab>(TABS[0]);
  const [zoek, setZoek] = useState("");
  const [leest, setLeest] = useState<{ doc: Document; html: string | null } | null>(null);
  // Een fout hoort bij de rij die je aantikte
  const [fout, setFout] = useState<{ id: number; tekst: string } | null>(null);
  // Welk document nu wordt opgehaald om te downloaden
  const [bezig, setBezig] = useState<number | null>(null);
  // Bij een andere tab schuiven de rijen van die kant binnen (net als bij Opnames)
  const [richting, setRichting] = useState<"rechts" | "links" | null>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const vlak = useRef<HTMLSpanElement>(null);
  const venster = useRef<HTMLDialogElement>(null);

  const woorden = gewoon(zoek).split(/\s+/).filter(Boolean);
  const past = (d: Document) => woorden.every((w) => gewoon(`${d.naam} ${datumTekst(d.datum)}`).includes(w));
  const groepen = groepeer(active, lijsten[active].filter(past));

  // Het witte vlak achter het gekozen tabblad schuift mee; de eerste keer staat het er meteen
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

  // Een Word-bestand als tekst op de pagina; lukt dat niet, dan gewoon downloaden
  async function lees(doc: Document) {
    setFout(null);
    setLeest({ doc, html: null });
    venster.current?.showModal();
    const html = await bestandTekst(doc.id).catch(() => null);
    if (html === null) { venster.current?.close(); download(doc); return; }
    setLeest((l) => (l?.doc.id === doc.id ? { doc, html } : l));
  }

  async function download(doc: Document) {
    if (bezig !== null) return;
    setFout(null);
    setBezig(doc.id);
    const url = await bestandDownload(doc.id).catch(() => null);
    if (url) {
      window.location.assign(url);
      // De browser begint de download zelf; het rondje draait nog even tot die er is
      setTimeout(() => setBezig(null), 1200);
    } else {
      setBezig(null);
      setFout({ id: doc.id, tekst: "Dit bestand kon niet worden gedownload. Log opnieuw in en probeer het nog eens." });
    }
  }

  // Een PDF opent de browser zelf, in een nieuw tabblad
  async function open(doc: Document) {
    setFout(null);
    // Het tabblad meteen openen, anders houdt de browser het tegen
    const tab = window.open("", "_blank");
    const url = await bestandUrl(doc.id);
    if (url && tab) tab.location.href = url;
    else { tab?.close(); setFout({ id: doc.id, tekst: "Dit bestand kon niet worden geopend. Log opnieuw in en probeer het nog eens." }); }
  }

  return (
    <div className="stemtabs-blok">
      <div className="stemtabs-balk">
        <div ref={tabs} role="tablist" className="stemtabs stemtabs--vlak" style={{ "--kolommen": TABS.length } as React.CSSProperties}>
          <span ref={vlak} className="stemtab-vlak" aria-hidden="true" />
          {TABS.map((t) => {
            const aantal = lijsten[t].filter(past).length;
            return (
              <button key={t} role="tab" aria-selected={active === t} onClick={() => {
                if (t === active) return;
                setRichting(TABS.indexOf(t) > TABS.indexOf(active) ? "rechts" : "links");
                setActive(t);
              }} className="stemtab">
                {t}
                {aantal > 0 && <span className="stemtab-aantal">{aantal}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="liedjes-zoekbalk">
        <div className="liedjes-zoek">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input type="search" value={zoek} onChange={(e) => { setRichting(null); setZoek(e.target.value); }} placeholder="Zoek op nummer, maand of jaar" aria-label="Zoek op nummer, maand of jaar" />
        </div>
      </div>

      {groepen.length === 0 ? (
        <p className="liedjes-leeg">{zoek.trim() ? `Niets gevonden voor "${zoek.trim()}".` : "Binnenkort beschikbaar."}</p>
      ) : (
        <div key={active} className="docs">
          {groepen.map(([titel, docs], g) => (
            <section key={titel} className="docs-groep">
              <h2 className="docs-groep-titel">{titel}</h2>
              <div className="liedjes" data-richting={richting ?? undefined}>
                {docs.map((doc, i) => {
                  const s = soort(doc.ext);
                  // Doorlopend over de groepen heen, maar niet eindeloos na elkaar
                  const volgorde = Math.min(groepen.slice(0, g).reduce((n, [, d]) => n + d.length, 0) + i, 10);
                  return (
                    <Fragment key={doc.id}>
                    <div className="lied" style={{ "--i": volgorde } as React.CSSProperties}>
                      <div className="lied-tekst">
                        <p className="lied-titel">{doc.naam}</p>
                        {active === "Nieuwsbrieven" && <p className="lied-componist">{datumTekst(doc.datum)}</p>}
                      </div>
                      <div className="lied-knoppen">
                        <button type="button" className="lied-download" aria-label={`Downloaden: ${doc.naam}`} aria-busy={bezig === doc.id} title="Downloaden" onClick={() => download(doc)}>
                          {bezig === doc.id ? <span className="docs-draai" aria-hidden="true" /> : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14" /></svg>
                          )}
                        </button>
                        <button type="button" className="lied-pdf" aria-label={`${s === "word" ? "Lezen" : "Openen"}: ${doc.naam}`} onClick={() => (s === "word" ? lees(doc) : s === "pdf" ? open(doc) : download(doc))}>
                          {s === "pdf" ? ICOON.word : ICOON[s]}<span className="lied-knop-tekst">{s === "pdf" ? "Openen" : KNOP[s]}</span>
                        </button>
                      </div>
                    </div>
                    {fout?.id === doc.id && <p className="liedjes-fout docs-fout" role="alert">{fout.tekst}</p>}
                    </Fragment>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <dialog
        ref={venster}
        className="speler"
        data-document=""
        aria-label={leest?.doc.naam}
        onClose={() => setLeest(null)}
        onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }}
      >
        {leest && (
          <Lezer
            key={leest.doc.id}
            kop={leest.doc.naam}
            details={datumTekst(leest.doc.datum)}
            html={leest.html}
            onSluit={() => venster.current?.close()}
            onDownload={() => download(leest.doc)}
          />
        )}
      </dialog>
    </div>
  );
}
