"use client";

import { useRef, useState } from "react";

const TEMPO = [0.75, 1, 1.25];

const tijd = (s: number) => {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

function Sprong({ terug }: { terug?: boolean }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={terug ? undefined : { transform: "scaleX(-1)" }}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <polyline points="3 3 3 8 8 8" />
      <text x="12" y="15.5" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="currentColor" stroke="none" style={terug ? undefined : { transform: "scaleX(-1)", transformOrigin: "12px 12px" }}>10</text>
    </svg>
  );
}

// Oefenspeler voor de ledenomgeving: audio met eigen bediening, video met die van de browser.
// Zonder url wordt de link nog opgehaald; de bediening staat dan even uit.
// Een mp4 is soms alleen geluid (zoals de oefenbestanden van Lean On Me): dan meldt de
// speler onGeenBeeld en krijgt het de bediening van een geluidsbestand.
export default function Speler({ kop, details, url, video, onSluit, onGeenBeeld }: {
  kop: string; details?: string; url: string | null; video: boolean; onSluit: () => void; onGeenBeeld?: () => void;
}) {
  const audio = useRef<HTMLAudioElement>(null);
  const [beeld, setBeeld] = useState(false);
  const [speelt, setSpeelt] = useState(false);
  const [positie, setPositie] = useState(0);
  const [duur, setDuur] = useState(0);
  const [tempo, setTempo] = useState(1);

  const a = () => audio.current!;
  const spring = (sec: number) => { a().currentTime = Math.min(Math.max(a().currentTime + sec, 0), duur || 0); };
  const kiesTempo = (t: number) => { setTempo(t); if (audio.current) audio.current.playbackRate = t; };

  return (
    <>
      <div className="speler-kop">
        <div className="speler-koptekst">
          <p className="speler-titel">{kop}</p>
          {details && <p className="speler-details">{details}</p>}
        </div>
        <button type="button" className="speler-sluit" onClick={onSluit} aria-label="Sluiten">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>

      {video ? (
        <>
          {/* Pas tonen en afspelen als vaststaat dat er beeld in zit */}
          {url && (
            <video
              src={url}
              controls
              playsInline
              preload="metadata"
              className="speler-video"
              hidden={!beeld}
              onLoadedMetadata={(e) => {
                if (e.currentTarget.videoWidth === 0) onGeenBeeld?.();
                else { setBeeld(true); e.currentTarget.play().catch(() => {}); }
              }}
            />
          )}
          {!beeld && <div className="speler-video speler-video--laden" />}
        </>
      ) : (
        <div className="speler-body" aria-busy={!url}>
          {url && <audio
            ref={audio}
            src={url}
            autoPlay
            onPlay={() => setSpeelt(true)}
            onPause={() => setSpeelt(false)}
            onTimeUpdate={(e) => setPositie(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => { setDuur(e.currentTarget.duration); e.currentTarget.playbackRate = tempo; }}
          />}

          <input
            type="range"
            className="speler-balk"
            min={0}
            max={duur || 0}
            step={0.1}
            value={positie}
            disabled={!duur}
            onChange={(e) => { a().currentTime = Number(e.target.value); setPositie(Number(e.target.value)); }}
            style={{ "--voortgang": `${duur ? (positie / duur) * 100 : 0}%` } as React.CSSProperties}
            aria-label="Positie in het nummer"
            aria-valuetext={`${tijd(positie)} van ${tijd(duur)}`}
          />
          <div className="speler-tijden">
            <span>{tijd(positie)}</span>
            <span>{tijd(duur)}</span>
          </div>

          <div className="speler-knoppen">
            <button type="button" className="speler-sprong" disabled={!duur} onClick={() => spring(-10)} aria-label="10 seconden terug"><Sprong terug /></button>
            <button type="button" className="speler-speel" disabled={!url} onClick={() => (speelt ? a().pause() : a().play())} aria-label={speelt ? "Pauzeren" : "Afspelen"}>
              {speelt ? (
                <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4.5" width="4" height="15" rx="1.2" /><rect x="14" y="4.5" width="4" height="15" rx="1.2" /></svg>
              ) : (
                <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ marginLeft: 3 }}><path d="M7 4.6v14.8a1 1 0 0 0 1.5.86l12.2-7.4a1 1 0 0 0 0-1.72L8.5 3.74A1 1 0 0 0 7 4.6z" /></svg>
              )}
            </button>
            <button type="button" className="speler-sprong" disabled={!duur} onClick={() => spring(10)} aria-label="10 seconden vooruit"><Sprong /></button>
          </div>

          <div className="speler-tempo">
            <span id="speler-tempo-label">Tempo</span>
            <div role="radiogroup" aria-labelledby="speler-tempo-label" className="stemtabs">
              {TEMPO.map((t) => (
                <button key={t} type="button" role="radio" aria-checked={tempo === t} className="stemtab" onClick={() => kiesTempo(t)}>
                  {String(t).replace(".", ",")}×
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
