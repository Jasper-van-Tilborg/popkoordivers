"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconPlus, useNaijlen, useToast } from "../_components/ui";
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

export default function AlbumsClient({ albums, loadError, startNieuw }: { albums: AlbumRij[]; loadError?: string; startNieuw?: boolean }) {
  const router = useRouter();
  const [nieuw, setNieuw] = useState(!!startNieuw);
  const [toast, melding]  = useToast();
  const [toonNieuw, sluitend] = useNaijlen(nieuw ? true : null);
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
    <div className="adm-page">
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
                    <span>{a.totaal === 0 ? "Nog leeg" : `${a.totaal} foto${a.totaal === 1 ? "" : "'s"}`}</span>
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
