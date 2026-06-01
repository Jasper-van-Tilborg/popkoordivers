"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { btnPrimary, btnDanger, inputStyle, labelStyle, thStyle, tdStyle } from "../_components/adminStyles";
import { IconPlay } from "@/components/icons";

interface MediaItem {
  id: number;
  type: "foto" | "video";
  url: string | null;
  r2_key: string | null;
  label: string;
  datum: string | null;
  volgorde: number;
}

function r2Url(key: string) {
  return `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL ?? ""}/${key}`;
}

function fotoSrc(item: MediaItem): string | null {
  if (item.r2_key) return r2Url(item.r2_key);
  if (item.url) return item.url;
  return null;
}

function youtubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m?.[1] ?? null;
}

export default function MediaAdminPage() {
  const supabase = createClient();
  const fileRef  = useRef<HTMLInputElement>(null);

  const [items, setItems]         = useState<MediaItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState<"foto" | "video">("foto");
  const [uploading, setUploading] = useState(false);
  const [err, setErr]             = useState("");

  const [fotoForm, setFotoForm] = useState({ label: "", datum: "" });
  const [vidForm, setVidForm]   = useState({ url: "", label: "", datum: "" });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("media")
      .select("id, type, url, r2_key, label, datum, volgorde")
      .order("volgorde")
      .order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }

  async function uploadFoto() {
    const file = fileRef.current?.files?.[0];
    if (!file) { setErr("Selecteer een afbeelding."); return; }
    if (!fotoForm.label) { setErr("Geef een label op."); return; }
    setErr(""); setUploading(true);

    const key = `media/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("key", key);

    const res = await fetch("/api/r2", { method: "POST", body: fd });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Upload mislukt" }));
      setErr(error || "Upload mislukt");
      setUploading(false);
      return;
    }

    const maxVolgorde = items.length ? Math.max(...items.map((i) => i.volgorde)) + 1 : 0;
    await supabase.from("media").insert({
      type: "foto",
      r2_key: key,
      url: null,
      label: fotoForm.label,
      datum: fotoForm.datum || null,
      volgorde: maxVolgorde,
    });

    setFotoForm({ label: "", datum: "" });
    if (fileRef.current) fileRef.current.value = "";
    setUploading(false);
    load();
  }

  async function addVideo() {
    if (!vidForm.url) { setErr("Voer een YouTube URL in."); return; }
    if (!vidForm.label) { setErr("Geef een label op."); return; }
    if (!youtubeId(vidForm.url)) { setErr("Ongeldige YouTube URL."); return; }
    setErr(""); setUploading(true);

    const maxVolgorde = items.length ? Math.max(...items.map((i) => i.volgorde)) + 1 : 0;
    await supabase.from("media").insert({
      type: "video",
      url: vidForm.url,
      r2_key: null,
      label: vidForm.label,
      datum: vidForm.datum || null,
      volgorde: maxVolgorde,
    });

    setVidForm({ url: "", label: "", datum: "" });
    setUploading(false);
    load();
  }

  async function moveUp(item: MediaItem) {
    const above = items.filter((i) => i.volgorde < item.volgorde).sort((a, b) => b.volgorde - a.volgorde)[0];
    if (!above) return;
    await supabase.from("media").update({ volgorde: above.volgorde }).eq("id", item.id);
    await supabase.from("media").update({ volgorde: item.volgorde }).eq("id", above.id);
    load();
  }

  async function moveDown(item: MediaItem) {
    const below = items.filter((i) => i.volgorde > item.volgorde).sort((a, b) => a.volgorde - b.volgorde)[0];
    if (!below) return;
    await supabase.from("media").update({ volgorde: below.volgorde }).eq("id", item.id);
    await supabase.from("media").update({ volgorde: item.volgorde }).eq("id", below.id);
    load();
  }

  async function remove(item: MediaItem) {
    if (!confirm("Verwijder dit item?")) return;
    if (item.type === "foto" && item.r2_key) {
      await fetch("/api/r2", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: item.r2_key }),
      });
    }
    await supabase.from("media").delete().eq("id", item.id);
    load();
  }

  const tabBtn = (t: "foto" | "video") => ({
    padding: "7px 18px", fontSize: "13px", fontWeight: 600, borderRadius: "35px", border: "1.5px solid",
    cursor: "pointer" as const, background: tab === t ? "var(--primary)" : "#fff",
    color: tab === t ? "#fff" : "#555", borderColor: tab === t ? "var(--primary)" : "rgba(0,0,0,0.15)",
  });

  return (
    <div>
      <div style={{ padding: "28px 32px 24px", background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#111", letterSpacing: "-0.5px" }}>Media</h1>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>{items.length} item{items.length !== 1 ? "s" : ""}</p>
      </div>

      <div style={{ margin: "24px 32px 0", background: "#fff", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: "24px" }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <button style={tabBtn("foto")} onClick={() => { setTab("foto"); setErr(""); }}>Foto uploaden</button>
          <button style={tabBtn("video")} onClick={() => { setTab("video"); setErr(""); }}>YouTube video</button>
        </div>

        {tab === "foto" ? (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={labelStyle}>Label *</label>
                <input type="text" placeholder="bijv. Najaarsconcert 2025" value={fotoForm.label}
                  onChange={(e) => setFotoForm((f) => ({ ...f, label: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Datum</label>
                <input type="text" placeholder="bijv. November 2025" value={fotoForm.datum}
                  onChange={(e) => setFotoForm((f) => ({ ...f, datum: e.target.value }))} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <input ref={fileRef} type="file" accept="image/*" style={{ fontSize: "13px", color: "#555" }} />
              <button style={{ ...btnPrimary, opacity: uploading ? 0.6 : 1 }} onClick={uploadFoto} disabled={uploading}>
                {uploading ? "Uploaden…" : "Foto uploaden"}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={labelStyle}>YouTube URL *</label>
                <input type="url" placeholder="https://www.youtube.com/watch?v=…" value={vidForm.url}
                  onChange={(e) => setVidForm((f) => ({ ...f, url: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Label *</label>
                <input type="text" placeholder="bijv. VÓLkoren Festival 2025" value={vidForm.label}
                  onChange={(e) => setVidForm((f) => ({ ...f, label: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Datum</label>
                <input type="text" placeholder="bijv. Juni 2025" value={vidForm.datum}
                  onChange={(e) => setVidForm((f) => ({ ...f, datum: e.target.value }))} style={inputStyle} />
              </div>
            </div>
            <button style={{ ...btnPrimary, opacity: uploading ? 0.6 : 1 }} onClick={addVideo} disabled={uploading}>
              {uploading ? "Opslaan…" : "Video toevoegen"}
            </button>
          </div>
        )}

        {err && <p style={{ margin: "12px 0 0", fontSize: "12px", color: "#dc2626" }}>{err}</p>}
      </div>

      <div style={{ margin: "16px 32px 32px", background: "#fff", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden" }}>
        {loading ? (
          <p style={{ padding: "32px", color: "#888", fontSize: "14px" }}>Laden…</p>
        ) : items.length === 0 ? (
          <p style={{ padding: "32px", color: "#aaa", fontSize: "14px" }}>Nog geen media toegevoegd.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["Preview", "Label", "Type", "Datum", "Volgorde", "Acties"].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const vid = item.type === "video" && item.url ? youtubeId(item.url) : null;
                const src = fotoSrc(item);
                return (
                  <tr key={item.id}>
                    <td style={{ ...tdStyle, width: "80px" }}>
                      {item.type === "foto" ? (
                        <div style={{ width: "64px", height: "48px", borderRadius: "6px", overflow: "hidden", background: "rgba(243,106,42,0.1)", flexShrink: 0 }}>
                          {src && <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                        </div>
                      ) : vid ? (
                        <img src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`} alt=""
                          style={{ width: "64px", height: "48px", objectFit: "cover", borderRadius: "6px" }} />
                      ) : (
                        <div style={{ width: "64px", height: "48px", borderRadius: "6px", background: "rgba(243,106,42,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                          <IconPlay size={16} />
                        </div>
                      )}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{item.label}</td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: "11px", fontWeight: 700, background: item.type === "video" ? "rgba(99,102,241,0.1)" : "rgba(243,106,42,0.1)", color: item.type === "video" ? "#6366f1" : "var(--primary)", padding: "2px 8px", borderRadius: "100px" }}>
                        {item.type === "foto" ? "Foto" : "Video"}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: "#888" }}>{item.datum ?? "—"}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button onClick={() => moveUp(item)} style={{ padding: "4px 8px", fontSize: "12px", cursor: "pointer", background: "none", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "4px" }}>↑</button>
                        <button onClick={() => moveDown(item)} style={{ padding: "4px 8px", fontSize: "12px", cursor: "pointer", background: "none", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "4px" }}>↓</button>
                      </div>
                    </td>
                    <td style={tdStyle}><button style={btnDanger} onClick={() => remove(item)}>Verwijderen</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
