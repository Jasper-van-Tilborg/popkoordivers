"use client";

import { useState } from "react";
import { gewoon } from "./naam";

type Smoel = { id: number; naam: string; functie: string | null; foto: string | null; initialen: string };

// Zoeken en filteren pas vanaf zoveel mensen; daaronder zie je iedereen in één oogopslag
const ZOEKEN_VANAF = 12;

export default function Smoelenboek({ leden, stemgroepen }: { leden: Smoel[]; stemgroepen: string[] }) {
  const [zoek, setZoek] = useState("");
  const [stem, setStem] = useState<string | null>(null);

  // Alleen de stemgroepen die er echt in staan, in de vaste volgorde
  const groepen = stemgroepen
    .map((s) => ({ s, aantal: leden.filter((l) => l.functie === s).length }))
    .filter((g) => g.aantal > 0);
  const woorden = gewoon(zoek).split(" ").filter(Boolean);
  const gevonden = leden.filter((l) =>
    (!stem || l.functie === stem) && woorden.every((w) => gewoon(l.naam).includes(w)));
  const filteren = leden.length > ZOEKEN_VANAF;

  return (
    <>
      {filteren && (
        <div className="wiw-filters">
          <div className="liedjes-zoek wiw-zoek">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Zoek op naam" aria-label="Zoek in het smoelenboek op naam" autoComplete="off" enterKeyHint="search" />
          </div>
          {groepen.length > 1 && (
            <div className="fotoalbum-filter wiw-stemmen" role="group" aria-label="Stemgroep">
              <button type="button" aria-pressed={stem === null} onClick={() => setStem(null)}>Iedereen <span>{leden.length}</span></button>
              {groepen.map(({ s, aantal }) => (
                <button key={s} type="button" aria-pressed={stem === s} onClick={() => setStem(stem === s ? null : s)}>{s} <span>{aantal}</span></button>
              ))}
            </div>
          )}
          <p className="leden-verborgen" role="status">{zoek || stem ? `${gevonden.length} gevonden` : ""}</p>
        </div>
      )}

      {gevonden.length === 0 ? (
        <div className="wiw-niemand">
          <p className="leden-leeg">Niemand gevonden{zoek.trim() ? ` met "${zoek.trim()}"` : ""}{stem ? ` bij ${stem}` : ""}.</p>
          <button type="button" className="pijl-link wiw-wis" onClick={() => { setZoek(""); setStem(null); }}>Toon iedereen</button>
        </div>
      ) : (
        <div className="smoelenboek-grid">
          {gevonden.map((l) => (
            <figure key={l.id} className="leden-kaart smoel">
              <div className="smoel-foto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {l.foto ? <img src={l.foto} alt="" loading="lazy" /> : <span className="smoel-initialen">{l.initialen}</span>}
              </div>
              <figcaption className="smoel-tekst">
                <p className="smoel-naam">{l.naam}</p>
                {l.functie && <span className="smoel-functie">{l.functie}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </>
  );
}
