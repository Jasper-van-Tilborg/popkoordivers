"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconPlus, IconSearch, Tabs, useNaijlen, useToast } from "../../_components/ui";
import { STEMMEN, groepeer, liedHref, nr, stemVan, type Lied, type Opname } from "./liedjes";
import LiedVenster from "./LiedVenster";
import { sleeptBestanden } from "./uploaden";
import { gewoon } from "../../_components/zoeken";

// De stemmen waar een lied nog geen opname voor heeft (Compleet telt niet mee)
const ontbreekt = (l: Lied) => STEMMEN.filter((s) => s !== "Compleet" && !l.opnames.some((o) => stemVan(o) === s));

type Filter = "alle" | "onvolledig" | "zonder";

const Pijl = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
);

// Alle liedjes onder elkaar; per lied zie je welke stemmen er zijn. Een lied
// openen gaat naar zijn eigen pagina, waar je de opnames beheert.
export default function OpnamesClient({ opnames, loadError, startNieuw }: {
  opnames: Opname[];
  loadError?: string;
  startNieuw?: boolean;
}) {
  const router = useRouter();
  const liedjes = useMemo(() => groepeer(opnames), [opnames]);
  const [filter, setFilter]     = useState<Filter>("alle");
  const [zoek, setZoek]         = useState("");
  const [oplopend, setOplopend] = useState(false);
  const [nieuw, setNieuw]       = useState<{ bestanden: File[] } | null>(startNieuw ? { bestanden: [] } : null);
  const [toonNieuw, sluitend]   = useNaijlen(nieuw);
  const [paginaDrag, setPaginaDrag] = useState(false);
  const [toast, melding]        = useToast();

  const onvolledig = liedjes.filter((l) => l.nummer && ontbreekt(l).length > 0);
  const zonder = liedjes.filter((l) => !l.nummer);
  const woorden = gewoon(zoek).split(/\s+/).filter(Boolean);
  const zichtbaar = (filter === "onvolledig" ? onvolledig : filter === "zonder" ? zonder : liedjes)
    .filter((l) => woorden.every((w) => gewoon(`${nr(l.nummer)} ${l.nummer ?? ""} ${l.titel} ${l.opnames.map((o) => o.naam).join(" ")}`).includes(w)))
    .sort((a, b) => (a.nummer && b.nummer ? (oplopend ? a.nummer - b.nummer : b.nummer - a.nummer) : a.nummer ? -1 : b.nummer ? 1 : a.titel.localeCompare(b.titel, "nl")));

  return (
    <div
      className="adm-page"
      // Bestanden op de pagina slepen: een nieuw lied met die opnames
      onDragOver={(e) => { if (sleeptBestanden(e)) { e.preventDefault(); setPaginaDrag(!nieuw); } }}
      onDragLeave={(e) => { if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget as Node)) setPaginaDrag(false); }}
      onDrop={(e) => {
        e.preventDefault();
        setPaginaDrag(false);
        if (!nieuw && e.dataTransfer.files.length) setNieuw({ bestanden: [...e.dataTransfer.files] });
      }}
    >
      <header className="adm-head">
        <div>
          <h1>Opnames</h1>
          <p className="adm-sub">{liedjes.filter((l) => l.nummer).length} liedjes, {opnames.length} opnames</p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={() => setNieuw({ bestanden: [] })}><IconPlus /> Nieuw lied</button>
      </header>

      <div className="adm-toolbar">
        <Tabs
          label="Liedjes filteren"
          value={filter}
          onChange={setFilter}
          items={[
            { id: "alle", label: "Alle", count: liedjes.length },
            { id: "onvolledig", label: "Onvolledig", count: onvolledig.length },
            { id: "zonder", label: "Zonder nummer", count: zonder.length },
          ]}
        />
        <div className="adm-search">
          <IconSearch />
          <input type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Titel, nummer of opname" aria-label="Zoek op titel, nummer of opname" />
        </div>
      </div>

      <div className="adm-content">
        {loadError ? (
          <div className="adm-empty"><p className="adm-empty-title">De opnames konden niet worden geladen</p><p>{loadError}</p></div>
        ) : zichtbaar.length === 0 ? (
          <div className="adm-empty">
            <p className="adm-empty-title">{zoek ? <>Niets gevonden voor &ldquo;{zoek}&rdquo;</> : filter === "onvolledig" ? "Elk lied heeft alle stemmen" : filter === "zonder" ? "Alle opnames hebben een nummer" : "Nog geen liedjes"}</p>
          </div>
        ) : (
          <>
            <div className="adm-liedkop">
              <button type="button" className="adm-liedkop-sorteer" onClick={() => setOplopend(!oplopend)} aria-label={`Sorteren op nummer, nu ${oplopend ? "laag–hoog" : "hoog–laag"}`}>
                Nr <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" style={{ transform: oplopend ? "rotate(180deg)" : undefined }}><path d="m6 9 6 6 6-6" /></svg>
              </button>
              <span aria-hidden="true">Lied</span>
              <span className="adm-liedkop-stemmen" aria-hidden="true">{STEMMEN.map((s) => <span key={s}>{s}</span>)}</span>
            </div>
            <ul className="adm-list adm-liedlijst">
              {zichtbaar.map((l) => (
                <li key={l.sleutel}>
                  <Link href={liedHref(l.sleutel)} className="adm-liedrij" data-geen-nummer={!l.nummer || undefined}>
                    <span className="adm-liedrij-nr">{l.nummer ? nr(l.nummer) : "–"}</span>
                    <span className="adm-liedrij-titel">
                      {l.titel}
                      <span className="adm-liedrij-sub">{l.opnames.length} {l.opnames.length === 1 ? "opname" : "opnames"}</span>
                    </span>
                    <span className="adm-stemmen" aria-label={`Stemmen: ${STEMMEN.filter((s) => l.opnames.some((o) => stemVan(o) === s)).join(", ") || "nog geen"}`}>
                      {STEMMEN.map((s) => {
                        const aantal = l.opnames.filter((o) => stemVan(o) === s).length;
                        return <i key={s} data-vol={aantal > 0 || undefined} title={`${s}: ${aantal || "nog geen opname"}`}>{s === "Compleet" ? "C" : s[0]}</i>;
                      })}
                    </span>
                    <span className="adm-liedrij-pijl"><Pijl /></span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {paginaDrag && <div className="adm-sleep-laag" aria-hidden="true"><span><IconPlus /> Nieuw lied</span></div>}

      {toonNieuw && (
        <LiedVenster
          lied={null}
          liedjes={liedjes}
          bestanden={toonNieuw.bestanden}
          sluitend={sluitend}
          onClose={() => setNieuw(null)}
          onDone={(m, sleutel) => {
            setNieuw(null);
            melding(m);
            if (sleutel) router.push(liedHref(sleutel));
          }}
        />
      )}
      {toast}
    </div>
  );
}
