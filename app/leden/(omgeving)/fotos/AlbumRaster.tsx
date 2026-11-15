"use client";

import { useState } from "react";
import Link from "next/link";
import { ALBUM_SOORTEN } from "@/lib/albumsoorten";
import { IconCamera, IconPlay } from "@/components/icons";

export type AlbumKaart = {
  slug: string;
  titel: string;
  datum: string;
  soort: string;
  fotos: number;
  videos: number;
  omslag: string[];
};

const meervoud = (n: number, een: string, meer: string) => `${n} ${n === 1 ? een : meer}`;

// De albums als kaarten met een collage van de eerste foto's, te filteren op soort.
// De gekozen soort staat in de URL, zodat hij er nog is als je terugkomt uit een album.
export default function AlbumRaster({ albums, soort: begin }: { albums: AlbumKaart[]; soort: string | null }) {
  const soorten = ALBUM_SOORTEN.filter((s) => albums.some((a) => a.soort === s.value));
  const [soort, setSoort] = useState(soorten.some((s) => s.value === begin) ? begin : null);
  const zichtbaar = soort ? albums.filter((a) => a.soort === soort) : albums;

  function kies(s: string | null) {
    setSoort(s);
    window.history.replaceState(null, "", s ? `?soort=${s}` : window.location.pathname);
  }

  return (
    <>
      {soorten.length > 1 && (
        <div className="fotoalbum-filter" role="group" aria-label="Soort album">
          {[{ value: null, meervoud: "Alles" }, ...soorten].map((s) => (
            <button key={s.value ?? "alles"} type="button" aria-pressed={soort === s.value} onClick={() => kies(s.value)}>
              {s.meervoud}
              <span>{s.value ? albums.filter((a) => a.soort === s.value).length : albums.length}</span>
            </button>
          ))}
        </div>
      )}
      <div className="fotoalbum-raster">
        {zichtbaar.map((a) => (
          <Link key={a.slug} href={`/leden/fotos/${a.slug}`} className="fotoalbum">
            <div className="fotoalbum-beeld" data-aantal={a.omslag.length}>
              {a.omslag.length === 0 ? (
                <span className="fotoalbum-leeg"><IconCamera size={28} /></span>
              ) : a.omslag.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt="" loading="lazy" />
              ))}
              {a.videos > 0 && (
                <span className="fotoalbum-video"><IconPlay size={12} strokeWidth={2.6} />{meervoud(a.videos, "video", "video's")}</span>
              )}
            </div>
            <div className="fotoalbum-tekst">
              <p className="fotoalbum-titel">{a.titel}</p>
              <p className="fotoalbum-meta">
                <span>{a.datum}</span>
                {a.fotos > 0 && <span>{meervoud(a.fotos, "foto", "foto's")}</span>}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
