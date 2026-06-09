"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { btnDanger } from "../../_components/adminStyles";

interface Foto {
  id: string;
  r2_key: string;
  url: string;
  impressies: boolean;
  volgorde: number;
}

interface Album {
  id: string;
  slug: string;
  titel: string;
  datum: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AlbumDetailPage({ params }: PageProps) {
  const [albumId, setAlbumId]     = useState<string | null>(null);
  const [album, setAlbum]         = useState<Album | null>(null);
  const [fotos, setFotos]         = useState<Foto[]>([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState({ done: 0, total: 0 });
  const [dragging, setDragging]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    params.then(({ id }) => setAlbumId(id));
  }, [params]);

  useEffect(() => {
    if (albumId) load(albumId);
  }, [albumId]);

  async function load(id: string) {
    setLoading(true);
    const [albumRes, fotosRes] = await Promise.all([
      fetch(`/api/albums`),
      fetch(`/api/fotos?album_id=${id}`),
    ]);
    const albums = await albumRes.json();
    const fotosData = await fotosRes.json();
    setAlbum(Array.isArray(albums) ? albums.find((a: Album) => a.id === id) ?? null : null);
    setFotos(Array.isArray(fotosData) ? fotosData : []);
    setLoading(false);
  }

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    if (!albumId) return;
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (arr.length === 0) return;
    setUploading(true);
    setProgress({ done: 0, total: arr.length });

    for (let i = 0; i < arr.length; i++) {
      const fd = new FormData();
      fd.append("file", arr[i]);
      fd.append("album_id", albumId);
      await fetch("/api/fotos", { method: "POST", body: fd });
      setProgress({ done: i + 1, total: arr.length });
    }

    setUploading(false);
    load(albumId);
  }, [albumId]);

  async function toggleImpressies(foto: Foto) {
    await fetch("/api/fotos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: foto.id, impressies: !foto.impressies }),
    });
    setFotos((prev) => prev.map((f) => f.id === foto.id ? { ...f, impressies: !f.impressies } : f));
  }

  async function deleteFoto(foto: Foto) {
    if (!confirm("Deze foto verwijderen?")) return;
    await fetch("/api/fotos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: foto.id, r2_key: foto.r2_key }),
    });
    setFotos((prev) => prev.filter((f) => f.id !== foto.id));
  }

  const impressiesCount = fotos.filter((f) => f.impressies).length;

  if (loading) return <div style={{ padding: "40px 32px", color: "#888" }}>Laden…</div>;
  if (!album)  return <div style={{ padding: "40px 32px", color: "#888" }}>Album niet gevonden.</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ padding: "28px 32px 24px", background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <a href="/admin/albums" style={{ fontSize: "12px", color: "#aaa", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "12px" }}>
          ← Albums
        </a>
        <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 800, color: "#111", letterSpacing: "-0.5px" }}>{album.titel}</h1>
        <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>
          {album.datum} · {fotos.length} foto{fotos.length !== 1 ? "'s" : ""} ·{" "}
          <span style={{ color: impressiesCount > 0 ? "var(--primary)" : "#aaa", fontWeight: 600 }}>
            {impressiesCount} op impressies pagina
          </span>
        </p>
      </div>

      {/* Upload zone */}
      <div style={{ margin: "24px 32px 0" }}>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); uploadFiles(e.dataTransfer.files); }}
          onClick={() => !uploading && fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? "var(--primary)" : "rgba(0,0,0,0.15)"}`,
            borderRadius: "16px",
            padding: "40px 24px",
            textAlign: "center",
            cursor: uploading ? "default" : "pointer",
            background: dragging ? "rgba(243,106,42,0.04)" : "#fff",
            transition: "border-color 0.15s, background 0.15s",
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          />
          {uploading ? (
            <>
              <div style={{ width: "100%", maxWidth: "300px", margin: "0 auto 12px", height: "6px", borderRadius: "3px", background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
                <div style={{ height: "100%", background: "var(--primary)", borderRadius: "3px", transition: "width 0.3s ease", width: `${(progress.done / progress.total) * 100}%` }} />
              </div>
              <p style={{ margin: 0, fontSize: "14px", color: "#555", fontWeight: 600 }}>
                Uploaden… {progress.done} / {progress.total}
              </p>
            </>
          ) : (
            <>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>📷</div>
              <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 700, color: "#111" }}>Sleep foto's hierheen</p>
              <p style={{ margin: 0, fontSize: "13px", color: "#aaa" }}>of klik om te selecteren · meerdere tegelijk mogelijk</p>
            </>
          )}
        </div>
      </div>

      {/* Legenda */}
      {fotos.length > 0 && (
        <div style={{ margin: "20px 32px 0", display: "flex", alignItems: "center", gap: "16px", fontSize: "12px", color: "#888" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "16px" }}>⭐</span> Op impressies pagina
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "16px", opacity: 0.25 }}>⭐</span> Alleen ledenomgeving
          </div>
          <div style={{ marginLeft: "auto", fontWeight: 600, color: "#111" }}>
            {impressiesCount} / {fotos.length} geselecteerd voor impressies
          </div>
        </div>
      )}

      {/* Foto grid */}
      <div style={{ margin: "16px 32px 40px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
        {fotos.map((foto) => (
          <div key={foto.id} style={{ position: "relative", borderRadius: "12px", overflow: "hidden", border: foto.impressies ? "2px solid var(--primary)" : "2px solid transparent", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", transition: "border-color 0.15s" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={foto.url} alt="" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />

            {/* Overlay met knoppen */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)", display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "8px" }}>
              <button
                onClick={() => toggleImpressies(foto)}
                title={foto.impressies ? "Verwijder van impressies" : "Zet op impressies pagina"}
                style={{ background: foto.impressies ? "var(--primary)" : "rgba(255,255,255,0.25)", border: "none", borderRadius: "6px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", transition: "background 0.15s", backdropFilter: "blur(4px)" }}
              >
                ⭐
              </button>
              <button
                onClick={() => deleteFoto(foto)}
                title="Verwijderen"
                style={{ background: "rgba(220,38,38,0.8)", border: "none", borderRadius: "6px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "14px", fontWeight: 700, backdropFilter: "blur(4px)" }}
              >
                ×
              </button>
            </div>

            {foto.impressies && (
              <div style={{ position: "absolute", top: "6px", right: "6px", background: "var(--primary)", borderRadius: "4px", padding: "2px 6px", fontSize: "9px", fontWeight: 700, color: "#fff", letterSpacing: "0.05em" }}>
                IMPRESSIES
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
