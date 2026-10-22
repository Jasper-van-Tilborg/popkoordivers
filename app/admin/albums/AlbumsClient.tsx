"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconPlus, useToast } from "../_components/ui";
import AlbumDrawer from "./AlbumDrawer";
import { maakAlbum, type AlbumInput } from "./actions";

interface AlbumRij {
  id: string;
  slug: string;
  titel: string;
  datum: string;
  totaal: number;
  impressies: number;
  cover: string | null;
}

export default function AlbumsClient({ albums, loadError }: { albums: AlbumRij[]; loadError?: string }) {
  const router = useRouter();
  const [nieuw, setNieuw] = useState(false);
  const [toast, melding]  = useToast();
  const sluit = useCallback(() => setNieuw(false), []);

  async function maak(input: AlbumInput) {
    const res = await maakAlbum(input);
    if (res.error) return res.error;
    melding("Album aangemaakt");
    router.push(`/admin/albums/${res.id}`);
    return null;
  }

  const totaalFotos = albums.reduce((n, a) => n + a.totaal, 0);

  return (
    <div>
      <header className="adm-head">
        <div>
          <h1>Media</h1>
          <p className="adm-sub">{albums.length} album{albums.length === 1 ? "" : "s"} met {totaalFotos} foto&apos;s. Leden zien alle foto&apos;s; foto&apos;s met een ster staan ook op de openbare website.</p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={() => setNieuw(true)}><IconPlus /> Nieuw album</button>
      </header>

      <div className="adm-content">
        {loadError ? (
          <div className="adm-empty"><p className="adm-empty-title">De albums konden niet worden geladen</p><p>{loadError}</p></div>
        ) : albums.length === 0 ? (
          <div className="adm-empty">
            <p className="adm-empty-title">Nog geen fotoalbums</p>
            <p>Maak een album per optreden of activiteit en zet de foto&apos;s erin.</p>
            <button className="adm-btn adm-btn--primary" onClick={() => setNieuw(true)}>Nieuw album</button>
          </div>
        ) : (
          <ul className="adm-list">
            {albums.map((a) => (
              <li key={a.id} className="adm-row adm-row--thumb" onClick={() => router.push(`/admin/albums/${a.id}`)}>
                <span className="adm-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {a.cover && <img src={a.cover} alt="" loading="lazy" />}
                </span>
                <div className="adm-main-col">
                  <Link href={`/admin/albums/${a.id}`} className="adm-title" onClick={(e) => e.stopPropagation()}>{a.titel}</Link>
                  <div className="adm-meta">
                    <span>{a.datum}</span>
                    <span>{a.totaal === 0 ? "Nog leeg" : `${a.totaal} foto${a.totaal === 1 ? "" : "'s"}`}</span>
                  </div>
                </div>
                <div className="adm-actions">
                  {a.impressies > 0
                    ? <span className="adm-pill adm-pill--brand">{a.impressies} op de website</span>
                    : <span className="adm-pill">Alleen leden</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {nieuw && <AlbumDrawer album={null} onClose={sluit} onSave={maak} />}
      {toast}
    </div>
  );
}
