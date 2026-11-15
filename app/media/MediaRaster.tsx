"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";
import VideoSpeler from "@/components/VideoSpeler";
import { ALBUM_SOORTEN } from "@/lib/albumsoorten";
import AlbumCard from "./AlbumCard";

export type MediaAlbum = { id: string; slug: string; titel: string; datum: string; soort: string; omslag: string; fotos: number };
export type MediaVideo = { id: string; titel: string; datum: string | null; youtubeId: string | null; src: string | null };

const datumTekst = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

// Albums en video's, te filteren op soort of alleen video's. Filteren gebeurt hier
// direct (zonder serverronde); de keuze staat in de URL, zodat de links vanaf Over ons
// (?soort=optreden) werken en hij er nog is als je terugkomt uit een album.
export default function MediaRaster({ albums, videos, soort: begin }: { albums: MediaAlbum[]; videos: MediaVideo[]; soort: string | null }) {
  const soorten = ALBUM_SOORTEN.filter((s) => albums.some((a) => a.soort === s.value));
  const knoppen = [
    { value: null, meervoud: "Alles", aantal: albums.length + videos.length },
    ...soorten.map((s) => ({ value: s.value as string, meervoud: s.meervoud as string, aantal: albums.filter((a) => a.soort === s.value).length })),
    ...(videos.length > 0 && albums.length > 0 ? [{ value: "video", meervoud: "Video's", aantal: videos.length }] : []),
  ];
  const [keuze, setKeuze] = useState(knoppen.some((k) => k.value && k.value === begin) ? begin : null);
  // Na de eerste wissel geen binnenkomst per kaart meer, maar één korte fade van het geheel
  const [gewisseld, setGewisseld] = useState(false);

  function kies(k: string | null) {
    if (k === keuze) return;
    setKeuze(k);
    setGewisseld(true);
    window.history.replaceState(null, "", k ? `?soort=${k}` : window.location.pathname);
  }

  const zichtbareAlbums = keuze === "video" ? [] : keuze ? albums.filter((a) => a.soort === keuze) : albums;
  const toonVideos = keuze === null || keuze === "video";

  const vak = (key: string, i: number, inhoud: React.ReactNode) =>
    gewisseld ? <div key={key}>{inhoud}</div> : <Reveal key={key} delay={Math.min(i % 3, 2) * 60}>{inhoud}</Reveal>;

  return (
    <>
      {knoppen.length > 2 && (
        <div className="media-filter" role="group" aria-label="Soort">
          {knoppen.map((k) => (
            <button key={k.value ?? "alles"} type="button" className="druk" aria-pressed={keuze === k.value} onClick={() => kies(k.value)}>
              {k.meervoud}
              <span>{k.aantal}</span>
            </button>
          ))}
        </div>
      )}
      <div key={keuze ?? "alles"} className={gewisseld ? "media-wissel" : undefined}>
        {zichtbareAlbums.length > 0 && (
          <div className="media-grid">
            {zichtbareAlbums.map((a, i) => vak(a.id, i,
              <AlbumCard slug={a.slug} title={a.titel} datum={a.datum} omslag={a.omslag} fotos={a.fotos} lazy={i >= 3} />
            ))}
          </div>
        )}
        {toonVideos && videos.length > 0 && (
          <>
            {zichtbareAlbums.length > 0 && <h2 id="videos" className="media-kop">Video&apos;s</h2>}
            <div className="media-grid">
              {videos.map((v, i) => vak(v.id, i,
                <div className="media-video">
                  <VideoSpeler titel={v.titel} youtubeId={v.youtubeId} src={v.src} />
                  <div style={{ padding: "14px 16px" }}>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#111", lineHeight: 1.3 }}>{v.titel}</p>
                    {v.datum && <p className="media-datum">{datumTekst(v.datum)}</p>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
