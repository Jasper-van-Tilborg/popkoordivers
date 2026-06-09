"use client";

import { useState, useEffect } from "react";
import { btnPrimary, btnDanger, inputStyle, labelStyle } from "../_components/adminStyles";

interface Album {
  id: string;
  slug: string;
  titel: string;
  datum: string;
  volgorde: number;
  totaal_fotos: number;
  impressies_fotos: number;
}

export default function AlbumsPage() {
  const [albums, setAlbums]     = useState<Album[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [err, setErr]           = useState("");
  const [form, setForm]         = useState({ titel: "", datum: "" });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/albums");
    const data = await res.json();
    setAlbums(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titel.trim() || !form.datum.trim()) { setErr("Vul titel en datum in."); return; }
    setErr(""); setSaving(true);
    const res = await fetch("/api/albums", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Mislukt" }));
      setErr(error || "Aanmaken mislukt"); setSaving(false); return;
    }
    setForm({ titel: "", datum: "" });
    setSaving(false);
    load();
  }

  async function remove(album: Album) {
    if (!confirm(`Album "${album.titel}" en alle ${album.totaal_fotos} foto's verwijderen?`)) return;
    await fetch("/api/albums", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: album.id }),
    });
    load();
  }

  return (
    <div>
      <div style={{ padding: "28px 32px 24px", background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#111", letterSpacing: "-0.5px" }}>Albums</h1>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>{albums.length} album{albums.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Nieuw album form */}
      <div style={{ margin: "24px 32px 0", background: "#fff", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: "24px" }}>
        <p style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 700, color: "#111" }}>Nieuw album aanmaken</p>
        <form onSubmit={create} style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: "12px", alignItems: "flex-end" }}>
          <div>
            <label style={labelStyle}>Titel *</label>
            <input style={inputStyle} placeholder="bijv. Zomerconcert 2026" value={form.titel}
              onChange={(e) => setForm((f) => ({ ...f, titel: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Datum *</label>
            <input style={inputStyle} placeholder="bijv. Juni 2026" value={form.datum}
              onChange={(e) => setForm((f) => ({ ...f, datum: e.target.value }))} />
          </div>
          <button type="submit" style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }} disabled={saving}>
            {saving ? "Aanmaken…" : "Aanmaken"}
          </button>
        </form>
        {err && <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#dc2626" }}>{err}</p>}
      </div>

      {/* Albums lijst */}
      <div style={{ margin: "16px 32px 32px", background: "#fff", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden" }}>
        {loading ? (
          <p style={{ padding: "32px", color: "#888", fontSize: "14px" }}>Laden…</p>
        ) : albums.length === 0 ? (
          <p style={{ padding: "32px", color: "#aaa", fontSize: "14px" }}>Nog geen albums.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Titel", "Datum", "Foto's", "Op impressies", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", fontSize: "11px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "left", borderBottom: "1px solid rgba(0,0,0,0.08)", background: "#FAFAFA", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {albums.map((album) => (
                <tr key={album.id}>
                  <td style={{ padding: "14px 16px", fontSize: "14px", color: "#111", fontWeight: 600, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    <a href={`/admin/albums/${album.id}`} style={{ color: "inherit", textDecoration: "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#111")}
                    >
                      {album.titel}
                    </a>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "14px", color: "#555", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>{album.datum}</td>
                  <td style={{ padding: "14px 16px", fontSize: "14px", color: "#555", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>{album.totaal_fotos}</td>
                  <td style={{ padding: "14px 16px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, background: album.impressies_fotos > 0 ? "rgba(243,106,42,0.1)" : "rgba(0,0,0,0.05)", color: album.impressies_fotos > 0 ? "var(--primary)" : "#888", padding: "3px 10px", borderRadius: "100px" }}>
                      {album.impressies_fotos} foto{album.impressies_fotos !== 1 ? "'s" : ""}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <a href={`/admin/albums/${album.id}`} style={{ ...btnPrimary, textDecoration: "none", fontSize: "12px", padding: "6px 14px" }}>
                        Beheren →
                      </a>
                      <button style={btnDanger} onClick={() => remove(album)}>Verwijderen</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
