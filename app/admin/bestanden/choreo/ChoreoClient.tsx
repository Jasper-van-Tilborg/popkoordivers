"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconPlus, IconSearch, Tabs, useNaijlen, useToast } from "../../_components/ui";
import { gewoon, nr } from "../documenten";
import ChoreoLiedVenster from "./ChoreoLiedVenster";
import { choreoHref, type ChoreoLied } from "./liedjes";

type Filter = "alle" | "zonder-video" | "zonder-tekst";

const Pijl = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
);

// Alle liedjes met choreografie; per lied zie je of er een video en een
// beschrijving is. Een lied openen gaat naar zijn eigen pagina.
export default function ChoreoClient({ liedjes, aantal, loadError, startNieuw }: {
  liedjes: ChoreoLied[];
  aantal: number;
  loadError?: string;
  startNieuw?: boolean;
}) {
  const router = useRouter();
  const [filter, setFilter]     = useState<Filter>("alle");
  const [zoek, setZoek]         = useState("");
  const [oplopend, setOplopend] = useState(false);
  const [nieuw, setNieuw]       = useState<true | null>(startNieuw || null);
  const [toonNieuw, sluitend]   = useNaijlen(nieuw);
  const [toast, melding]        = useToast();

  const zonderVideo = liedjes.filter((l) => l.videos.length === 0);
  const zonderTekst = liedjes.filter((l) => l.beschrijvingen.length === 0);
  const woorden = gewoon(zoek).split(/\s+/).filter(Boolean);
  const zichtbaar = (filter === "zonder-video" ? zonderVideo : filter === "zonder-tekst" ? zonderTekst : liedjes)
    .filter((l) => woorden.every((w) => gewoon(`${nr(l.nummer)} ${l.nummer ?? ""} ${l.titel}`).includes(w)))
    .sort((a, b) => (a.nummer && b.nummer ? (oplopend ? a.nummer - b.nummer : b.nummer - a.nummer) : a.nummer ? -1 : b.nummer ? 1 : a.titel.localeCompare(b.titel, "nl")));

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Choreografie</h1>
          <p className="adm-sub">{liedjes.length} liedjes, {aantal} bestanden</p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={() => setNieuw(true)}><IconPlus /> Nieuw lied</button>
      </header>

      <div className="adm-toolbar">
        <Tabs
          label="Liedjes filteren"
          value={filter}
          onChange={setFilter}
          items={[
            { id: "alle", label: "Alle", count: liedjes.length },
            { id: "zonder-video", label: "Zonder video", count: zonderVideo.length },
            { id: "zonder-tekst", label: "Zonder beschrijving", count: zonderTekst.length },
          ]}
        />
        <div className="adm-search">
          <IconSearch />
          <input type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Titel of nummer" aria-label="Zoek op titel of nummer" />
        </div>
      </div>

      <div className="adm-content">
        {loadError ? (
          <div className="adm-empty"><p className="adm-empty-title">De choreografie kon niet worden geladen</p><p>{loadError}</p></div>
        ) : zichtbaar.length === 0 ? (
          <div className="adm-empty">
            <p className="adm-empty-title">{zoek ? <>Niets gevonden voor &ldquo;{zoek}&rdquo;</> : filter === "zonder-video" ? "Elk lied heeft een video" : filter === "zonder-tekst" ? "Elk lied heeft een beschrijving" : "Nog geen choreografie"}</p>
          </div>
        ) : (
          <>
            <div className="adm-liedkop">
              <button type="button" className="adm-liedkop-sorteer" onClick={() => setOplopend(!oplopend)} aria-label={`Sorteren op nummer, nu ${oplopend ? "laag–hoog" : "hoog–laag"}`}>
                Nr <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" style={{ transform: oplopend ? "rotate(180deg)" : undefined }}><path d="m6 9 6 6 6-6" /></svg>
              </button>
              <span aria-hidden="true">Lied</span>
              <span />
            </div>
            <ul className="adm-list adm-liedlijst">
              {zichtbaar.map((l) => (
                <li key={l.sleutel}>
                  <Link href={choreoHref(l.sleutel)} className="adm-liedrij" data-geen-nummer={!l.nummer || undefined}>
                    <span className="adm-liedrij-nr">{l.nummer ? nr(l.nummer) : "–"}</span>
                    <span className="adm-liedrij-titel">{l.titel}</span>
                    <span className="adm-soorten">
                      <i data-vol={l.videos.length > 0 || undefined}>Video</i>
                      <i data-vol={l.beschrijvingen.length > 0 || undefined}>Beschrijving</i>
                    </span>
                    <span className="adm-liedrij-pijl"><Pijl /></span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {toonNieuw && (
        <ChoreoLiedVenster
          lied={null}
          liedjes={liedjes}
          sluitend={sluitend}
          onClose={() => setNieuw(null)}
          onDone={(m, sleutel) => {
            setNieuw(null);
            melding(m);
            if (sleutel) router.push(choreoHref(sleutel));
          }}
        />
      )}
      {toast}
    </div>
  );
}
