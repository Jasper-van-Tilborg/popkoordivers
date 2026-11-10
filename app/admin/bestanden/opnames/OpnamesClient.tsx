"use client";

import { useMemo, useRef, useState } from "react";
import { IconDownload, IconPlus, IconSearch, Tabs, useNaijlen, useToast } from "../../_components/ui";
import { opnameLink, opnamesToevoegen, wijzigOpname } from "./actions";
import { STEMMEN, groepeer, kortLabel, leesBestandsnaam, naamVoor, naarStemgroep, nr, speelbaar, stemVan, tijd, titelVan, type Lied, type Opname, type Stem } from "./liedjes";
import LiedVenster from "./LiedVenster";
import OpnameVenster from "./OpnameVenster";
import { OPNAME_TYPES, sleeptBestanden, uploadReeks } from "./uploaden";
import { useSleep } from "./useSleep";

// Zoeken zonder op hoofdletters of accenten te letten
const gewoon = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
// De stemmen waar een lied nog geen opname voor heeft (Compleet telt niet mee)
const ontbreekt = (l: Lied) => STEMMEN.filter((s) => s !== "Compleet" && !l.opnames.some((o) => stemVan(o) === s));

type Filter = "alle" | "onvolledig" | "zonder";
type Venster = { soort: "lied"; lied: Lied | null; bestanden?: File[] } | { soort: "opname"; id: number };
// Een opname die net in een vakje is gesleept en nog omhoog gaat
type Bezig = { id: string; file: File; naam: string; voortgang: number | null; fout?: string };

const Speel = ({ speelt, size = 14 }: { speelt: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    {speelt ? <path d="M6.5 5h4v14h-4zM13.5 5h4v14h-4z" /> : <path d="M7.5 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8a1 1 0 0 0-1.5.86z" />}
  </svg>
);
const Pijl = ({ terug }: { terug?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{terug ? <path d="M6 5h2v14H6zM19 5.8v12.4a.8.8 0 0 1-1.2.7L9 12.7a.8.8 0 0 1 0-1.4l8.8-6.2a.8.8 0 0 1 1.2.7z" /> : <path d="M16 5h2v14h-2zM5 5.8v12.4a.8.8 0 0 0 1.2.7l8.8-6.2a.8.8 0 0 0 0-1.4L6.2 5.1A.8.8 0 0 0 5 5.8z" />}</svg>
);

export default function OpnamesClient({ opnames, loadError, startNieuw, startId }: {
  opnames: Opname[];
  loadError?: string;
  startNieuw?: boolean;
  startId?: number;
}) {
  const liedjes = useMemo(() => groepeer(opnames), [opnames]);
  const [filter, setFilter]     = useState<Filter>("alle");
  const [zoek, setZoek]         = useState("");
  const [oplopend, setOplopend] = useState(false);
  const [venster, setVenster]   = useState<Venster | null>(startNieuw ? { soort: "lied", lied: null } : startId ? { soort: "opname", id: startId } : null);
  const [toonVenster, sluitend] = useNaijlen(venster);
  const [bezig, setBezig]       = useState<Record<string, Bezig[]>>({});
  const [vakDrag, setVakDrag]   = useState<string | null>(null);
  const [paginaDrag, setPaginaDrag] = useState(false);
  // Op een telefoon: welk lied is opengeklapt
  const [open, setOpen]         = useState<string | null>(null);
  const [toast, melding]        = useToast();
  // Opnames die net zijn versleept: al op hun nieuwe plek tonen tot de server klaar is
  const [onderweg, setOnderweg] = useState<Record<number, { vak: string; naam: string }>>({});
  const kiezer = useRef<HTMLInputElement>(null);
  const kiesVoor = useRef<{ lied: Lied; stem: Stem } | null>(null);

  const onvolledig = liedjes.filter((l) => l.nummer && ontbreekt(l).length > 0);
  const zonder = liedjes.filter((l) => !l.nummer);
  const woorden = gewoon(zoek).split(/\s+/).filter(Boolean);
  const zichtbaar = (filter === "onvolledig" ? onvolledig : filter === "zonder" ? zonder : liedjes)
    .filter((l) => woorden.every((w) => gewoon(`${nr(l.nummer)} ${l.nummer ?? ""} ${l.titel} ${l.opnames.map((o) => o.naam).join(" ")}`).includes(w)))
    .sort((a, b) => (a.nummer && b.nummer ? (oplopend ? a.nummer - b.nummer : b.nummer - a.nummer) : a.nummer ? -1 : b.nummer ? 1 : 0));

  // ── Afspelen: één speler onderin; vorige/volgende gaan door de tabel ────────
  const audio = useRef<HTMLAudioElement>(null);
  const huidig = useRef<number | null>(null);
  const [speler, setSpeler] = useState<{ id: number; speelt: boolean; positie: number; duur: number } | null>(null);
  const afspeelbaar = zichtbaar.flatMap((l) => STEMMEN.flatMap((s) => l.opnames.filter((o) => stemVan(o) === s && speelbaar(o.ext))));
  const spelend = speler ? opnames.find((o) => o.id === speler.id) : undefined;
  const spelendLied = spelend ? liedjes.find((l) => l.opnames.includes(spelend)) : undefined;
  const plek = spelend ? afspeelbaar.indexOf(spelend) : -1;

  async function speel(o: Opname) {
    const a = audio.current;
    if (!a) return;
    if (speler?.id === o.id) {
      if (a.paused) a.play().catch(() => {}); else a.pause();
      return;
    }
    a.pause();
    huidig.current = o.id;
    setSpeler({ id: o.id, speelt: true, positie: 0, duur: 0 });
    const url = await opnameLink(o.id);
    if (huidig.current !== o.id) return;
    if (!url) { setSpeler(null); melding("Deze opname kon niet worden geopend"); return; }
    a.src = url;
    a.play().catch(() => {});
  }

  function stop() {
    audio.current?.pause();
    huidig.current = null;
    setSpeler(null);
  }

  const tik = () => {
    const a = audio.current;
    if (a) setSpeler((s) => s && { ...s, speelt: !a.paused, positie: a.currentTime, duur: a.duration || 0 });
  };

  async function download(id: number) {
    const url = await opnameLink(id, true);
    if (url) window.location.assign(url);
    else melding("Deze opname kon niet worden gedownload");
  }

  // ── Uploaden in een vakje: meteen omhoog, bij dat lied en die stem ──────────
  async function uploadInVak(lied: Lied, stem: Stem, files: File[]) {
    if (!files.length) return;
    const vak = `${lied.sleutel}|${stem}`;
    const items: Bezig[] = files.map((file) => ({
      id: crypto.randomUUID(), file, voortgang: 0,
      naam: naamVoor(lied.titel, stem, leesBestandsnaam(file.name).rest),
    }));
    const zet = (id: string, wat: Partial<Bezig>) =>
      setBezig((b) => ({ ...b, [vak]: (b[vak] ?? []).map((x) => (x.id === id ? { ...x, ...wat } : x)) }));
    const weg = (ids: string[]) => setBezig((b) => ({ ...b, [vak]: (b[vak] ?? []).filter((x) => !ids.includes(x.id)) }));

    setBezig((b) => ({ ...b, [vak]: [...(b[vak] ?? []), ...items] }));
    const klaar = await uploadReeks(items, (x, voortgang, fout) => zet(x.id, { voortgang, fout }));
    if (klaar.length) {
      const res = await opnamesToevoegen(
        klaar.map(({ x, key }) => ({ key, naam: x.naam, stemgroep: naarStemgroep(stem), liednummer: lied.nummer })),
        lied.titel,
      );
      if (res.error) {
        klaar.forEach(({ x }) => zet(x.id, { voortgang: null, fout: res.error }));
        melding(`Opslaan lukte niet: ${res.error}`);
        return;
      }
      weg(klaar.map(({ x }) => x.id));
      melding(`${klaar.length === 1 ? "Opname" : `${klaar.length} opnames`} toegevoegd bij ${stem}`);
    }
    if (klaar.length < items.length) melding("Niet alles is geüpload");
  }

  // Op de titel van een lied: de stem uit de bestandsnaam; lukt dat niet, dan eerst kiezen
  function uploadInLied(lied: Lied, files: File[]) {
    const stemmen = files.map((f) => leesBestandsnaam(f.name).stem);
    if (stemmen.some((s) => !s)) return setVenster({ soort: "lied", lied, bestanden: files });
    for (const stem of STEMMEN) uploadInVak(lied, stem, files.filter((_, i) => stemmen[i] === stem));
  }

  // Een opname naar een ander vakje ("lied|stem") of op een liedtitel ("lied|": stem blijft).
  // De naam gaat mee: "Viva La Vida Bas" naar Alt wordt "Viva La Vida Alt".
  async function verplaats(id: number, doel: string) {
    const o = opnames.find((x) => x.id === id);
    const [sleutel, stemDeel] = doel.split("|");
    const naar = liedjes.find((l) => l.sleutel === sleutel);
    const van = o && liedjes.find((l) => l.opnames.includes(o));
    if (!o || !naar || !van) return;
    const stem = (stemDeel || stemVan(o)) as Stem;
    if (naar === van && stem === stemVan(o)) return;

    const naam = naamVoor(naar.titel, stem, kortLabel(o, titelVan(o.naam)));
    setOnderweg((m) => ({ ...m, [id]: { vak: `${naar.sleutel}|${stem}`, naam } }));
    const res = await wijzigOpname(id, { naam, stemgroep: naarStemgroep(stem), liednummer: naar.nummer });
    setOnderweg((m) => Object.fromEntries(Object.entries(m).filter(([k]) => Number(k) !== id)));
    if (res.error) return melding(`Verplaatsen lukte niet: ${res.error}`);
    melding(naar === van ? `Verplaatst naar ${stem}` : `Verplaatst naar ${[nr(naar.nummer), naar.titel].filter(Boolean).join(" ")} · ${stem}`);
  }
  const { sleep, start: pakOp, netGesleept } = useSleep(verplaats);

  function kiesBestanden(lied: Lied, stem: Stem) {
    kiesVoor.current = { lied, stem };
    kiezer.current?.click();
  }

  // Slepen: een vakje of liedtitel vangt het zelf; elders op de pagina wordt het een nieuw lied
  const sleepOp = (id: string) => ({
    onDragOver: (e: React.DragEvent) => { if (!sleeptBestanden(e)) return; e.preventDefault(); e.stopPropagation(); setVakDrag(id); setPaginaDrag(false); },
    onDragLeave: (e: React.DragEvent) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setVakDrag((v) => (v === id ? null : v)); },
  });

  function sluit() { setVenster(null); }
  function klaar(m: string) { setVenster(null); melding(m); }

  const opnameVenster = toonVenster?.soort === "opname" ? opnames.find((o) => o.id === toonVenster.id) : undefined;
  const opnameLied = opnameVenster ? liedjes.find((l) => l.opnames.includes(opnameVenster)) : undefined;

  return (
    <div
      className="adm-page"
      // Altijd opvangen: anders opent de browser het bestand zelf
      onDragOver={(e) => { if (sleeptBestanden(e)) { e.preventDefault(); setPaginaDrag(!venster); setVakDrag(null); } }}
      onDragLeave={(e) => { if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget as Node)) setPaginaDrag(false); }}
      onDrop={(e) => {
        e.preventDefault();
        setPaginaDrag(false);
        setVakDrag(null);
        if (!venster && e.dataTransfer.files.length) setVenster({ soort: "lied", lied: null, bestanden: [...e.dataTransfer.files] });
      }}
    >
      <header className="adm-head">
        <div>
          <h1>Opnames</h1>
          <p className="adm-sub">{liedjes.filter((l) => l.nummer).length} liedjes, {opnames.length} opnames</p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={() => setVenster({ soort: "lied", lied: null })}><IconPlus /> Nieuw lied</button>
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
          <div className="adm-matrix-houder">
            <div className="adm-matrix" role="table" aria-label="Opnames per lied en stem">
              <div className="adm-matrix-kop" role="row">
                <span role="columnheader">
                  <button type="button" className="adm-matrix-sorteer" onClick={() => setOplopend(!oplopend)} aria-label={`Nummer ${oplopend ? "laag–hoog" : "hoog–laag"}`}>
                    Nr <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" style={{ transform: oplopend ? "rotate(180deg)" : undefined }}><path d="m6 9 6 6 6-6" /></svg>
                  </button>
                </span>
                <span role="columnheader">Lied</span>
                {STEMMEN.map((s) => <span key={s} role="columnheader">{s}</span>)}
              </div>

              {zichtbaar.map((l) => (
                <div key={l.sleutel} role="row" className="adm-matrix-rij" data-geen-nummer={!l.nummer || undefined} data-open={open === l.sleutel || undefined}>
                  <div role="cell" className="adm-matrix-nr">{l.nummer ? nr(l.nummer) : "–"}</div>
                  <div
                    role="cell"
                    className="adm-matrix-lied"
                    data-doel={`${l.sleutel}|`}
                    data-drag={vakDrag === l.sleutel || sleep?.doel === `${l.sleutel}|` || undefined}
                    {...sleepOp(l.sleutel)}
                    onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setVakDrag(null); uploadInLied(l, [...e.dataTransfer.files]); }}
                  >
                    <button type="button" className="adm-matrix-titel" onClick={() => setVenster({ soort: "lied", lied: l })}>
                      <span className="adm-matrix-mobielnr">{l.nummer ? nr(l.nummer) : "–"}</span>
                      {l.titel}
                    </button>
                    {/* Telefoon: een regel om open te klappen, met per stem een bolletje */}
                    <button type="button" className="adm-matrix-uitklap" aria-expanded={open === l.sleutel} onClick={() => setOpen(open === l.sleutel ? null : l.sleutel)}>
                      <span className="adm-matrix-uitklap-nr">{l.nummer ? nr(l.nummer) : "–"}</span>
                      <span className="adm-matrix-uitklap-titel">{l.titel}</span>
                      <span className="adm-stippen" aria-hidden="true">
                        {STEMMEN.map((s) => <i key={s} data-vol={l.opnames.some((o) => stemVan(o) === s) || undefined}>{s[0]}</i>)}
                      </span>
                      <svg className="adm-matrix-pijl" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                    </button>
                  </div>

                  {STEMMEN.map((stem) => {
                    const vak = `${l.sleutel}|${stem}`;
                    const hier = [
                      ...l.opnames.filter((o) => stemVan(o) === stem && !onderweg[o.id]),
                      ...opnames.filter((o) => onderweg[o.id]?.vak === vak),
                    ];
                    const lopend = bezig[vak] ?? [];
                    const leeg = hier.length + lopend.length === 0;
                    return (
                      <div
                        key={stem}
                        role="cell"
                        className="adm-vak"
                        data-stem={stem}
                        data-leeg={leeg || undefined}
                        data-doel={vak}
                        data-drag={vakDrag === vak || (sleep && sleep.doel === vak) || undefined}
                        {...sleepOp(vak)}
                        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setVakDrag(null); uploadInVak(l, stem, [...e.dataTransfer.files]); }}
                      >
                        {hier.map((o) => {
                          const speelt = speler?.id === o.id && speler.speelt;
                          return (
                            <div
                              key={o.id}
                              className="adm-chip"
                              data-speelt={speler?.id === o.id || undefined}
                              data-gesleept={sleep?.id === o.id || undefined}
                              data-onderweg={onderweg[o.id] ? "" : undefined}
                              onPointerDown={(e) => pakOp(e, o.id)}
                            >
                              <button type="button" className="adm-chip-speel" onClick={() => { if (!netGesleept()) speel(o); }} disabled={!speelbaar(o.ext)}
                                aria-label={`${speelt ? "Pauzeren" : "Afspelen"}: ${o.naam}`} title={speelbaar(o.ext) ? undefined : `${o.ext.toUpperCase()} kan niet in de browser worden afgespeeld`}>
                                <Speel speelt={speelt} size={11} />
                              </button>
                              <button type="button" className="adm-chip-label" onClick={() => { if (!netGesleept()) setVenster({ soort: "opname", id: o.id }); }} title={o.naam} aria-label={`Bewerken: ${o.naam}`}>
                                {kortLabel(onderweg[o.id] ? { ...o, naam: onderweg[o.id].naam, stemgroep: naarStemgroep(stem) } : o, l.titel) || "Opname"}
                              </button>
                            </div>
                          );
                        })}
                        {lopend.map((b) => (
                          <div key={b.id} className="adm-chip" data-bezig={b.fout ? undefined : ""} data-fout={b.fout ? "" : undefined} title={b.fout ?? b.file.name}>
                            {b.fout ? (
                              <button type="button" className="adm-chip-label" onClick={() => setBezig((x) => ({ ...x, [vak]: x[vak].filter((y) => y.id !== b.id) }))} aria-label={`Melding weghalen: ${b.fout}`}>
                                Mislukt ×
                              </button>
                            ) : (
                              <span className="adm-chip-label">
                                <span className="adm-chip-balk"><span style={{ width: `${Math.round((b.voortgang ?? 0) * 100)}%` }} /></span>
                              </span>
                            )}
                          </div>
                        ))}
                        <button type="button" className="adm-vak-plus" onClick={() => kiesBestanden(l, stem)} aria-label={`Opname toevoegen: ${l.titel}, ${stem}`} title={`Toevoegen bij ${stem}`}>
                          <IconPlus />
                        </button>
                      </div>
                    );
                  })}
                  <div role="cell" className="adm-matrix-meer">
                    <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setVenster({ soort: "lied", lied: l })}>Lied bewerken</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {spelend && speler && (
          <div className="adm-speler" role="region" aria-label="Speler">
            <div className="adm-speler-knoppen">
              <button type="button" className="adm-icon-btn" onClick={() => speel(afspeelbaar[plek - 1])} disabled={plek <= 0} aria-label="Vorige opname"><Pijl terug /></button>
              <button type="button" className="adm-speler-speel" onClick={() => speel(spelend)} aria-label={speler.speelt ? "Pauzeren" : "Afspelen"}><Speel speelt={speler.speelt} size={18} /></button>
              <button type="button" className="adm-icon-btn" onClick={() => speel(afspeelbaar[plek + 1])} disabled={plek < 0 || plek >= afspeelbaar.length - 1} aria-label="Volgende opname"><Pijl /></button>
            </div>
            <div className="adm-speler-midden">
              <p className="adm-speler-naam">
                {spelendLied?.nummer && <span>{nr(spelendLied.nummer)}</span>}
                {spelend.naam}
              </p>
              <div className="adm-speler-tijd">
                <span>{tijd(speler.positie)}</span>
                <input type="range" min={0} max={speler.duur || 0} step={0.1} value={speler.positie} aria-label="Positie"
                  onChange={(e) => { if (audio.current) audio.current.currentTime = Number(e.target.value); tik(); }} />
                <span>{tijd(speler.duur)}</span>
              </div>
            </div>
            <div className="adm-speler-acties">
              <button type="button" className="adm-icon-btn" onClick={() => download(spelend.id)} title="Downloaden" aria-label="Downloaden"><IconDownload /></button>
              <button type="button" className="adm-btn adm-btn--ghost adm-btn--small" onClick={() => setVenster({ soort: "opname", id: spelend.id })}>Bewerken</button>
              <button type="button" className="adm-icon-btn" onClick={stop} aria-label="Speler sluiten">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      <input
        ref={kiezer}
        type="file"
        multiple
        accept={OPNAME_TYPES}
        hidden
        onChange={(e) => {
          const doel = kiesVoor.current;
          if (doel && e.target.files) uploadInVak(doel.lied, doel.stem, [...e.target.files]);
          e.target.value = "";
        }}
      />
      <audio ref={audio} preload="none" onPlay={tik} onPause={tik} onTimeUpdate={tik} onLoadedMetadata={tik}
        onEnded={() => { tik(); if (plek >= 0 && plek < afspeelbaar.length - 1) speel(afspeelbaar[plek + 1]); }} />

      {/* Wat je versleept, onder je muis of vinger */}
      {sleep && (() => {
        const o = opnames.find((x) => x.id === sleep.id);
        const [sleutel, stemDeel] = (sleep.doel ?? "").split("|");
        const naar = liedjes.find((l) => l.sleutel === sleutel);
        return o ? (
          <div className="adm-sleep-chip" style={{ transform: `translate(${sleep.x}px, ${sleep.y}px)` }} aria-hidden="true">
            <strong>{o.naam}</strong>
            {naar && <span>→ {[nr(naar.nummer), naar.titel].filter(Boolean).join(" ")} · {stemDeel || stemVan(o)}</span>}
          </div>
        ) : null;
      })()}

      {paginaDrag && <div className="adm-sleep-laag" aria-hidden="true"><span><IconPlus /> Nieuw lied</span></div>}

      {toonVenster?.soort === "lied" && (
        <LiedVenster
          key={toonVenster.lied?.sleutel ?? "nieuw"}
          lied={toonVenster.lied ? liedjes.find((l) => l.sleutel === toonVenster.lied!.sleutel) ?? toonVenster.lied : null}
          liedjes={liedjes}
          bestanden={toonVenster.bestanden}
          sluitend={sluitend}
          onClose={sluit}
          onDone={klaar}
        />
      )}
      {opnameVenster && opnameLied && (
        <OpnameVenster key={opnameVenster.id} opname={opnameVenster} lied={opnameLied} liedjes={liedjes} sluitend={sluitend} onClose={sluit} onDone={klaar} />
      )}
      {toast}
    </div>
  );
}
