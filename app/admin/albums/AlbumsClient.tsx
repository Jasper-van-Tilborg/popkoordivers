"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconPlus, Tabs, useNaijlen, useToast } from "../_components/ui";
import AlbumDrawer from "./AlbumDrawer";
import { maakAlbum, type AlbumInput } from "./actions";
import { VideoLijst, type Video } from "./Videos";

interface AlbumRij {
  id: string;
  slug: string;
  titel: string;
  datum: string;
  totaal: number;
  impressies: number;
  videos: number;
  cover: string | null;
}

const telling = (fotos: number, videos: number) =>
  [fotos ? `${fotos} foto${fotos === 1 ? "" : "'s"}` : null, videos ? `${videos} video${videos === 1 ? "" : "'s"}` : null].filter(Boolean).join(", ") || "Nog leeg";

export default function AlbumsClient({ albums, losseVideos, loadError, startNieuw, startVideo, videoAlbum }: {
  albums: AlbumRij[];
  losseVideos: Video[];
  loadError?: string;
  startNieuw?: boolean;
  startVideo?: string;
  videoAlbum?: string;
}) {
  const router = useRouter();
  const [tab, setTab]     = useState<"albums" | "videos">(startVideo ? "videos" : "albums");
  const [nieuw, setNieuw] = useState(!!startNieuw);
  const [toast, melding]  = useToast();
  const [toonNieuw, sluitend] = useNaijlen(nieuw ? true : null);
  const sluit = useCallback(() => setNieuw(false), []);

  // Een video die bij een album hoort: die staat op de pagina van het album
  useEffect(() => { if (videoAlbum) router.replace(`/admin/albums/${videoAlbum}?tab=videos`); }, [videoAlbum, router]);

  async function maak(input: AlbumInput) {
    const res = await maakAlbum(input);
    if (res.error) return res.error;
    melding("Album aangemaakt");
    router.push(`/admin/albums/${res.id}`);
    return null;
  }

  const totaalFotos = albums.reduce((n, a) => n + a.totaal, 0);
  const albumKeuzes = albums.map(({ id, titel, datum }) => ({ id, titel, datum }));

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Foto&apos;s &amp; video&apos;s</h1>
          <p className="adm-sub">{albums.length} album{albums.length === 1 ? "" : "s"} met {totaalFotos} foto&apos;s, {losseVideos.length} losse video&apos;s</p>
        </div>
        {tab === "albums" && <button className="adm-btn adm-btn--primary" onClick={() => setNieuw(true)}><IconPlus /> Nieuw album</button>}
      </header>

      <div className="adm-toolbar">
        <Tabs label="Albums of losse video's" value={tab} onChange={setTab}
          items={[{ id: "albums", label: "Albums", count: albums.length }, { id: "videos", label: "Losse video's", count: losseVideos.length }]} />
      </div>

      <div className="adm-content">
        {loadError ? (
          <div className="adm-empty"><p className="adm-empty-title">De albums konden niet worden geladen</p><p>{loadError}</p></div>
        ) : tab === "videos" ? (
          <VideoLijst videos={losseVideos} albums={albumKeuzes} startId={startVideo} melding={melding} />
        ) : albums.length === 0 ? (
          <div className="adm-empty">
            <p className="adm-empty-title">Nog geen fotoalbums</p>
            <p>Maak een album per optreden of activiteit en zet de foto&apos;s erin.</p>
            <button className="adm-btn adm-btn--primary" onClick={() => setNieuw(true)}>Nieuw album</button>
          </div>
        ) : (
          <ul className="adm-cards">
            <li>
              <button className="adm-card-nieuw" style={{ width: "100%", height: "100%" }} onClick={() => setNieuw(true)}>
                <IconPlus /> Nieuw album
              </button>
            </li>
            {albums.map((a, i) => (
              <li key={a.id} className="adm-card" style={{ animationDelay: `${Math.min(i, 8) * 30 + 60}ms` }} onClick={() => router.push(`/admin/albums/${a.id}`)}>
                <div className="adm-card-beeld">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {a.cover && <img src={a.cover} alt="" loading="lazy" />}
                </div>
                <div className="adm-card-body">
                  <Link href={`/admin/albums/${a.id}`} className="adm-title" onClick={(e) => e.stopPropagation()}>{a.titel}</Link>
                  <div className="adm-meta" style={{ marginTop: 6 }}>
                    <span>{a.datum}</span>
                    <span>{telling(a.totaal, a.videos)}</span>
                  </div>
                </div>
                <div className="adm-card-foot">
                  {a.impressies > 0
                    ? <span className="adm-pill adm-pill--brand">{a.impressies} op de website</span>
                    : <span className="adm-pill">Alleen leden</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {toonNieuw && <AlbumDrawer album={null} onClose={sluit} onSave={maak} sluitend={sluitend} />}
      {toast}
    </div>
  );
}
