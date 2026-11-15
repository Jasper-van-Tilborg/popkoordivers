"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconBack, IconDownload, IconPlus, useNaijlen, useToast } from "../../../_components/ui";
import { opnameLink, opnamesToevoegen } from "../actions";
import { STEMMEN, kortLabel, leesBestandsnaam, liedHref, naamVoor, naarStemgroep, nr, speelbaar, stemVan, tijd, type Lied, type Stem } from "../liedjes";
import LiedVenster from "../LiedVenster";
import OpnameVenster from "../OpnameVenster";
import { OPNAME_TYPES, sleeptBestanden, uploadReeks } from "../uploaden";

// Een opname die net is gekozen en nog omhoog gaat
type Bezig = { id: string; file: File; naam: string; voortgang: number | null; fout?: string };
type Venster = { soort: "lied" } | { soort: "opname"; id: number };

const Speel = ({ speelt, size = 14 }: { speelt: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    {speelt ? <path d="M6.5 5h4v14h-4zM13.5 5h4v14h-4z" /> : <path d="M7.5 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8a1 1 0 0 0-1.5.86z" />}
  </svg>
);
const Pijl = ({ terug }: { terug?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{terug ? <path d="M6 5h2v14H6zM19 5.8v12.4a.8.8 0 0 1-1.2.7L9 12.7a.8.8 0 0 1 0-1.4l8.8-6.2a.8.8 0 0 1 1.2.7z" /> : <path d="M16 5h2v14h-2zM5 5.8v12.4a.8.8 0 0 0 1.2.7l8.8-6.2a.8.8 0 0 0 0-1.4L6.2 5.1A.8.8 0 0 0 5 5.8z" />}</svg>
);

// De pagina van één lied: per stem de opnames, om te beluisteren, toe te voegen en te bewerken.
export default function LiedClient({ lied, liedjes, startOpname }: { lied: Lied; liedjes: Lied[]; startOpname?: number }) {
  const router = useRouter();
  const [venster, setVenster]   = useState<Venster | null>(startOpname && lied.opnames.some((o) => o.id === startOpname) ? { soort: "opname", id: startOpname } : null);
  const [toonVenster, sluitend] = useNaijlen(venster);
  const [bezig, setBezig]       = useState<Record<string, Bezig[]>>({});
  const [drag, setDrag]         = useState<Stem | null>(null);
  const [toast, melding]        = useToast();
  const kiezer = useRef<HTMLInputElement>(null);
  const kiesVoor = useRef<Stem | null>(null);

  const perStem = (s: Stem) => lied.opnames.filter((o) => stemVan(o) === s);

  // ── Afspelen: één speler onderin; vorige/volgende gaan door dit lied ────────
  const audio = useRef<HTMLAudioElement>(null);
  const huidig = useRef<number | null>(null);
  const [speler, setSpeler] = useState<{ id: number; speelt: boolean; positie: number; duur: number } | null>(null);
  const afspeelbaar = STEMMEN.flatMap((s) => perStem(s).filter((o) => speelbaar(o.ext)));
  const spelend = speler ? lied.opnames.find((o) => o.id === speler.id) : undefined;
  const plek = spelend ? afspeelbaar.indexOf(spelend) : -1;

  async function speel(id: number) {
    const a = audio.current;
    if (!a) return;
    if (speler?.id === id) {
      if (a.paused) a.play().catch(() => {}); else a.pause();
      return;
    }
    a.pause();
    huidig.current = id;
    setSpeler({ id, speelt: true, positie: 0, duur: 0 });
    const url = await opnameLink(id);
    if (huidig.current !== id) return;
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

  // ── Toevoegen bij een stem: meteen omhoog ───────────────────────────────────
  async function upload(stem: Stem, files: File[]) {
    if (!files.length) return;
    const items: Bezig[] = files.map((file) => ({
      id: crypto.randomUUID(), file, voortgang: 0,
      naam: naamVoor(lied.titel, stem, leesBestandsnaam(file.name).rest),
    }));
    const zet = (id: string, wat: Partial<Bezig>) =>
      setBezig((b) => ({ ...b, [stem]: (b[stem] ?? []).map((x) => (x.id === id ? { ...x, ...wat } : x)) }));

    setBezig((b) => ({ ...b, [stem]: [...(b[stem] ?? []), ...items] }));
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
      setBezig((b) => ({ ...b, [stem]: (b[stem] ?? []).filter((x) => !klaar.some((k) => k.x.id === x.id)) }));
      melding(`${klaar.length === 1 ? "Opname" : `${klaar.length} opnames`} toegevoegd bij ${stem}`);
    }
    if (klaar.length < items.length) melding("Niet alles is geüpload");
  }

  function kies(stem: Stem) {
    kiesVoor.current = stem;
    kiezer.current?.click();
  }

  const opnameVenster = toonVenster?.soort === "opname" ? lied.opnames.find((o) => o.id === toonVenster.id) : undefined;

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <Link href="/admin/bestanden/opnames" className="adm-head-back"><IconBack /> Alle opnames</Link>
          <h1>{lied.nummer && <span className="adm-head-nr">{nr(lied.nummer)}</span>}{lied.titel}</h1>
          <p className="adm-sub">{lied.opnames.length} {lied.opnames.length === 1 ? "opname" : "opnames"}</p>
        </div>
        <div className="adm-head-actions">
          <button className="adm-btn adm-btn--ghost" onClick={() => setVenster({ soort: "lied" })}>Lied bewerken</button>
        </div>
      </header>

      <div className="adm-content">
        <ul className="adm-list adm-stemlijst">
          {STEMMEN.map((stem) => {
            const hier = perStem(stem);
            const lopend = bezig[stem] ?? [];
            return (
              <li
                key={stem}
                className="adm-stemrij"
                data-leeg={hier.length + lopend.length === 0 || undefined}
                data-drag={drag === stem || undefined}
                onDragOver={(e) => { if (sleeptBestanden(e)) { e.preventDefault(); setDrag(stem); } }}
                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDrag((d) => (d === stem ? null : d)); }}
                onDrop={(e) => { e.preventDefault(); setDrag(null); upload(stem, [...e.dataTransfer.files]); }}
              >
                <span className="adm-stemrij-stem">{stem}</span>
                <div className="adm-stemrij-opnames">
                  {hier.map((o) => {
                    const actief = speler?.id === o.id;
                    return (
                      <div key={o.id} className="adm-opname" data-speelt={actief || undefined}>
                        <button type="button" className="adm-opname-speel" onClick={() => speel(o.id)} disabled={!speelbaar(o.ext)}
                          aria-label={`${actief && speler?.speelt ? "Pauzeren" : "Afspelen"}: ${o.naam}`}
                          title={speelbaar(o.ext) ? undefined : `${o.ext.toUpperCase()} kan niet in de browser worden afgespeeld`}>
                          <Speel speelt={actief && !!speler?.speelt} size={12} />
                        </button>
                        <button type="button" className="adm-opname-naam" onClick={() => setVenster({ soort: "opname", id: o.id })} title="Bewerken">
                          {kortLabel(o, lied.titel) || o.naam}
                          <span className="adm-opname-ext">{o.ext.toUpperCase()}</span>
                          {!!o.versies?.length && <span className="adm-pill">{o.versies.length + 1} versies</span>}
                        </button>
                        <button type="button" className="adm-icon-btn" onClick={() => download(o.id)} title="Downloaden" aria-label={`Downloaden: ${o.naam}`}><IconDownload /></button>
                      </div>
                    );
                  })}
                  {lopend.map((b) => (
                    <div key={b.id} className="adm-opname" data-bezig={!b.fout || undefined}>
                      <span className="adm-opname-naam adm-opname-naam--bezig">
                        {b.naam}
                        {b.fout
                          ? <span className="adm-err" style={{ margin: 0 }}>{b.fout}</span>
                          : <span className="adm-progress"><span style={{ width: `${Math.round((b.voortgang ?? 0) * 100)}%` }} /></span>}
                      </span>
                      {b.fout && (
                        <button type="button" className="adm-icon-btn" aria-label="Melding weghalen"
                          onClick={() => setBezig((x) => ({ ...x, [stem]: x[stem].filter((y) => y.id !== b.id) }))}>×</button>
                      )}
                    </div>
                  ))}
                  {hier.length + lopend.length === 0 && <span className="adm-stemrij-leeg">Nog geen opname</span>}
                </div>
                <button type="button" className="adm-btn adm-btn--ghost adm-btn--small adm-stemrij-plus" onClick={() => kies(stem)} aria-label={`Opname toevoegen bij ${stem}`}>
                  <IconPlus /> Toevoegen
                </button>
              </li>
            );
          })}
        </ul>

        {spelend && speler && (
          <div className="adm-speler" role="region" aria-label="Speler">
            <div className="adm-speler-knoppen">
              <button type="button" className="adm-icon-btn" onClick={() => speel(afspeelbaar[plek - 1].id)} disabled={plek <= 0} aria-label="Vorige opname"><Pijl terug /></button>
              <button type="button" className="adm-speler-speel" onClick={() => speel(spelend.id)} aria-label={speler.speelt ? "Pauzeren" : "Afspelen"}><Speel speelt={speler.speelt} size={18} /></button>
              <button type="button" className="adm-icon-btn" onClick={() => speel(afspeelbaar[plek + 1].id)} disabled={plek < 0 || plek >= afspeelbaar.length - 1} aria-label="Volgende opname"><Pijl /></button>
            </div>
            <div className="adm-speler-midden">
              <p className="adm-speler-naam">{spelend.naam}</p>
              <div className="adm-speler-tijd">
                <span>{tijd(speler.positie)}</span>
                <input type="range" min={0} max={speler.duur || 0} step={0.1} value={speler.positie} aria-label="Positie"
                  onChange={(e) => { if (audio.current) audio.current.currentTime = Number(e.target.value); tik(); }} />
                <span>{tijd(speler.duur)}</span>
              </div>
            </div>
            <div className="adm-speler-acties">
              <button type="button" className="adm-icon-btn" onClick={() => download(spelend.id)} title="Downloaden" aria-label="Downloaden"><IconDownload /></button>
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
          if (kiesVoor.current && e.target.files) upload(kiesVoor.current, [...e.target.files]);
          e.target.value = "";
        }}
      />
      <audio ref={audio} preload="none" onPlay={tik} onPause={tik} onTimeUpdate={tik} onLoadedMetadata={tik}
        onEnded={() => { tik(); if (plek >= 0 && plek < afspeelbaar.length - 1) speel(afspeelbaar[plek + 1].id); }} />

      {toonVenster?.soort === "lied" && (
        <LiedVenster
          lied={lied}
          liedjes={liedjes}
          sluitend={sluitend}
          onClose={() => setVenster(null)}
          onDone={(m, sleutel) => {
            setVenster(null);
            melding(m);
            if (!sleutel) router.push("/admin/bestanden/opnames");
            else if (sleutel !== lied.sleutel) router.replace(liedHref(sleutel));
          }}
        />
      )}
      {opnameVenster && (
        <OpnameVenster
          key={opnameVenster.id}
          opname={opnameVenster}
          lied={lied}
          liedjes={liedjes}
          sluitend={sluitend}
          onClose={() => setVenster(null)}
          onDone={(m) => { setVenster(null); melding(m); }}
        />
      )}
      {toast}
    </div>
  );
}
