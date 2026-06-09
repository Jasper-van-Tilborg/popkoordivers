"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { btnPrimary, btnDanger, inputStyle, labelStyle, thStyle, tdStyle } from "../_components/adminStyles";

/* ── Types ── */
interface Bestand {
  id: number;
  naam: string;
  categorie: string;
  stemgroep: string | null;
  r2_key: string;
  created_at: string;
}

interface Foto {
  id: string;
  r2_key: string;
  url: string;
  impressies: boolean;
}

interface Album {
  id: string;
  slug: string;
  titel: string;
  datum: string;
  totaal_fotos: number;
  impressies_fotos: number;
}

/* ── Constants ── */
const cats = ["liedjes", "nieuwsbrieven", "opnames", "choreo", "oude_optredens"];
const stemgroepen = ["Alt", "Mezzo", "Sopraan", "Tenor", "Bas"];
const catLabel: Record<string, string> = {
  liedjes: "Liedjes", nieuwsbrieven: "Nieuwsbrieven",
  opnames: "Opnames", choreo: "Choreo", oude_optredens: "Oude optredens",
};

function r2Url(key: string) {
  return `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL ?? ""}/${key}`;
}

/* ══════════════════════════════════════════
   BESTANDEN TAB
══════════════════════════════════════════ */
function BestandenTab() {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems]         = useState<Bestand[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("all");
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [form, setForm]           = useState({ naam: "", categorie: "nieuwsbrieven", stemgroep: "" });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("bestanden").select("id, naam, categorie, stemgroep, r2_key, created_at").order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function buildKey(categorie: string, stemgroep: string, fileName: string) {
    const ts = Date.now();
    const safe = fileName.replace(/\s+/g, "-");
    if (categorie === "liedjes" && stemgroep) return `liedjes/${stemgroep.toLowerCase()}/${ts}-${safe}`;
    return `${categorie.replace("_", "-")}/${ts}-${safe}`;
  }

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) { setUploadErr("Selecteer een bestand."); return; }
    if (!form.naam) { setUploadErr("Geef een weergavenaam op."); return; }
    setUploadErr(""); setUploading(true);
    const key = buildKey(form.categorie, form.stemgroep, file.name);
    const fd = new FormData(); fd.append("file", file); fd.append("key", key);
    const res = await fetch("/api/r2", { method: "POST", body: fd });
    if (!res.ok) { const { error } = await res.json().catch(() => ({ error: "Upload mislukt" })); setUploadErr(error || "Upload mislukt"); setUploading(false); return; }
    await supabase.from("bestanden").insert({ naam: form.naam, categorie: form.categorie, stemgroep: form.categorie === "liedjes" && form.stemgroep ? form.stemgroep : null, r2_key: key });
    setForm({ naam: "", categorie: form.categorie, stemgroep: "" });
    if (fileRef.current) fileRef.current.value = "";
    setUploading(false); load();
  }

  async function remove(item: Bestand) {
    if (!confirm("Bestand verwijderen?")) return;
    await fetch("/api/r2", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: item.r2_key }) });
    await supabase.from("bestanden").delete().eq("id", item.id);
    load();
  }

  const filtered = filter === "all" ? items : items.filter((i) => i.categorie === filter);

  return (
    <div>
      {/* Upload form */}
      <div style={{ margin: "24px 32px 0", background: "#fff", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: "24px" }}>
        <h2 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700, color: "#111" }}>Bestand uploaden</h2>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "16px", alignItems: "end" }}>
          <div>
            <label style={labelStyle}>Weergavenaam *</label>
            <input type="text" placeholder="bijv. Nieuwsbrief herfst 2026" value={form.naam} onChange={(e) => set("naam", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Categorie</label>
            <select value={form.categorie} onChange={(e) => set("categorie", e.target.value)} style={inputStyle}>
              {cats.map((c) => <option key={c} value={c}>{catLabel[c]}</option>)}
            </select>
          </div>
          {form.categorie === "liedjes" && (
            <div>
              <label style={labelStyle}>Stemgroep</label>
              <select value={form.stemgroep} onChange={(e) => set("stemgroep", e.target.value)} style={inputStyle}>
                <option value="">Alle stemgroepen</option>
                {stemgroepen.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>
        <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <input ref={fileRef} type="file" style={{ fontSize: "13px", color: "#555" }} />
          <button style={{ ...btnPrimary, opacity: uploading ? 0.6 : 1 }} onClick={upload} disabled={uploading}>
            {uploading ? "Uploaden…" : "Uploaden"}
          </button>
        </div>
        {uploadErr && <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#dc2626" }}>{uploadErr}</p>}
      </div>

      {/* Filter tabs */}
      <div style={{ margin: "24px 32px 0", display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {[["all", "Alles"], ...cats.map((c) => [c, catLabel[c]])].map(([val, lbl]) => (
          <button key={val} onClick={() => setFilter(val)}
            style={{ padding: "6px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "35px", border: "1.5px solid", cursor: "pointer", background: filter === val ? "var(--primary)" : "#fff", color: filter === val ? "#fff" : "#555", borderColor: filter === val ? "var(--primary)" : "rgba(0,0,0,0.15)" }}>
            {lbl}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ margin: "16px 32px 32px", background: "#fff", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden" }}>
        {loading ? <p style={{ padding: "32px", color: "#888", fontSize: "14px" }}>Laden…</p>
          : filtered.length === 0 ? <p style={{ padding: "32px", color: "#aaa", fontSize: "14px" }}>Geen bestanden.</p>
          : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["Naam", "Categorie", "Stemgroep", "Acties"].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>
                      <a href={r2Url(item.r2_key)} target="_blank" rel="noopener" style={{ color: "var(--primary)", textDecoration: "none" }}>{item.naam}</a>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: "11px", fontWeight: 700, background: "rgba(243,106,42,0.10)", color: "var(--primary)", padding: "2px 8px", borderRadius: "100px" }}>{catLabel[item.categorie] || item.categorie}</span>
                    </td>
                    <td style={tdStyle}>{item.stemgroep || "—"}</td>
                    <td style={tdStyle}><button style={btnDanger} onClick={() => remove(item)}>Verwijderen</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   FOTO ALBUMS TAB
══════════════════════════════════════════ */
function FotoAlbumsTab() {
  const [albums, setAlbums]         = useState<Album[]>([]);
  const [loading, setLoading]       = useState(true);
  const [openAlbumId, setOpenAlbumId] = useState<string | null>(null);
  const [newForm, setNewForm]       = useState({ titel: "", datum: "" });
  const [creating, setCreating]     = useState(false);
  const [createErr, setCreateErr]   = useState("");

  useEffect(() => { loadAlbums(); }, []);

  async function loadAlbums() {
    setLoading(true);
    const res = await fetch("/api/albums");
    const data = await res.json();
    setAlbums(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function createAlbum(e: React.FormEvent) {
    e.preventDefault();
    if (!newForm.titel.trim() || !newForm.datum.trim()) { setCreateErr("Titel en datum zijn verplicht."); return; }
    setCreateErr(""); setCreating(true);
    const res = await fetch("/api/albums", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newForm) });
    if (!res.ok) { const { error } = await res.json().catch(() => ({ error: "Mislukt" })); setCreateErr(error || "Aanmaken mislukt"); setCreating(false); return; }
    const created = await res.json();
    setNewForm({ titel: "", datum: "" });
    setCreating(false);
    await loadAlbums();
    setOpenAlbumId(created.id);
  }

  async function deleteAlbum(album: Album) {
    if (!confirm(`Album "${album.titel}" en alle ${album.totaal_fotos} foto's verwijderen?`)) return;
    await fetch("/api/albums", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: album.id }) });
    if (openAlbumId === album.id) setOpenAlbumId(null);
    loadAlbums();
  }

  return (
    <div>
      {/* Nieuw album */}
      <div style={{ margin: "24px 32px 0", background: "#fff", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: "24px" }}>
        <h2 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: "#111" }}>Nieuw album aanmaken</h2>
        <form onSubmit={createAlbum} style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: "12px", alignItems: "flex-end" }}>
          <div>
            <label style={labelStyle}>Titel *</label>
            <input style={inputStyle} placeholder="bijv. Zomerconcert 2026" value={newForm.titel} onChange={(e) => setNewForm((f) => ({ ...f, titel: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Datum *</label>
            <input style={inputStyle} placeholder="bijv. Juni 2026" value={newForm.datum} onChange={(e) => setNewForm((f) => ({ ...f, datum: e.target.value }))} />
          </div>
          <button type="submit" style={{ ...btnPrimary, opacity: creating ? 0.6 : 1 }} disabled={creating}>{creating ? "Aanmaken…" : "Aanmaken"}</button>
        </form>
        {createErr && <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#dc2626" }}>{createErr}</p>}
      </div>

      {/* Albums lijst */}
      <div style={{ margin: "16px 32px 32px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {loading ? <p style={{ color: "#888", fontSize: "14px" }}>Laden…</p>
          : albums.length === 0 ? <p style={{ color: "#aaa", fontSize: "14px", padding: "16px 0" }}>Nog geen albums.</p>
          : albums.map((album) => (
            <AlbumRow
              key={album.id}
              album={album}
              isOpen={openAlbumId === album.id}
              onToggle={() => setOpenAlbumId(openAlbumId === album.id ? null : album.id)}
              onDelete={() => deleteAlbum(album)}
              onRefresh={loadAlbums}
            />
          ))}
      </div>
    </div>
  );
}

function AlbumRow({ album, isOpen, onToggle, onDelete, onRefresh }: {
  album: Album;
  isOpen: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}) {
  const [fotos, setFotos]             = useState<Foto[]>([]);
  const [fotosLoaded, setFotosLoaded] = useState(false);
  const [uploading, setUploading]     = useState(false);
  const [progress, setProgress]       = useState({ done: 0, total: 0 });
  const [dragging, setDragging]       = useState(false);
  const [selected, setSelected]       = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (isOpen && !fotosLoaded) loadFotos(); }, [isOpen]);

  async function loadFotos() {
    const res = await fetch(`/api/fotos?album_id=${album.id}`);
    const data = await res.json();
    setFotos(Array.isArray(data) ? data : []);
    setFotosLoaded(true);
    setSelected(new Set());
  }

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!arr.length) return;
    setUploading(true);
    setProgress({ done: 0, total: arr.length });
    for (let i = 0; i < arr.length; i++) {
      const fd = new FormData(); fd.append("file", arr[i]); fd.append("album_id", album.id);
      await fetch("/api/fotos", { method: "POST", body: fd });
      setProgress({ done: i + 1, total: arr.length });
    }
    setUploading(false);
    setFotosLoaded(false);
    await loadFotos();
    onRefresh();
  }, [album.id]);

  function toggleSelect(id: string) {
    setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }

  function selectAll() {
    setSelected(selected.size === fotos.length ? new Set() : new Set(fotos.map((f) => f.id)));
  }

  async function bulkSetImpressies(value: boolean) {
    await Promise.all(
      [...selected].map((id) =>
        fetch("/api/fotos", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, impressies: value }) })
      )
    );
    setFotos((prev) => prev.map((f) => selected.has(f.id) ? { ...f, impressies: value } : f));
    setSelected(new Set());
    onRefresh();
  }

  async function bulkDelete() {
    if (!confirm(`${selected.size} foto${selected.size !== 1 ? "'s" : ""} verwijderen?`)) return;
    const toDelete = fotos.filter((f) => selected.has(f.id));
    await Promise.all(
      toDelete.map((f) =>
        fetch("/api/fotos", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: f.id, r2_key: f.r2_key }) })
      )
    );
    setFotos((prev) => prev.filter((f) => !selected.has(f.id)));
    setSelected(new Set());
    onRefresh();
  }

  const impressiesCount = fotos.filter((f) => f.impressies).length;
  const allSelected = fotos.length > 0 && selected.size === fotos.length;

  return (
    <div style={{ background: "#fff", borderRadius: "12px", border: isOpen ? "1.5px solid rgba(243,106,42,0.3)" : "1px solid rgba(0,0,0,0.08)", overflow: "hidden", transition: "border-color 0.15s" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", cursor: "pointer", gap: "16px" }} onClick={onToggle}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#111" }}>{album.titel}</p>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#888" }}>
            {album.datum} · {album.totaal_fotos} foto{album.totaal_fotos !== 1 ? "'s" : ""} ·{" "}
            <span style={{ color: album.impressies_fotos > 0 ? "var(--primary)" : "#aaa", fontWeight: 600 }}>{album.impressies_fotos} op impressies pagina</span>
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button style={btnDanger} onClick={(e) => { e.stopPropagation(); onDelete(); }}>Verwijderen</button>
          <svg width="14" height="14" fill="none" stroke="#aaa" strokeWidth={2} viewBox="0 0 24 24" style={{ transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)", padding: "20px" }}>

          {/* Upload zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); uploadFiles(e.dataTransfer.files); }}
            onClick={() => !uploading && fileRef.current?.click()}
            style={{ border: `2px dashed ${dragging ? "var(--primary)" : "rgba(0,0,0,0.12)"}`, borderRadius: "10px", padding: "24px", textAlign: "center", cursor: uploading ? "default" : "pointer", background: dragging ? "rgba(243,106,42,0.04)" : "#FAFAFA", transition: "border-color 0.15s", marginBottom: "20px" }}
          >
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => e.target.files && uploadFiles(e.target.files)} />
            {uploading ? (
              <>
                <div style={{ width: "100%", maxWidth: "240px", margin: "0 auto 8px", height: "4px", borderRadius: "2px", background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "var(--primary)", borderRadius: "2px", transition: "width 0.3s", width: `${(progress.done / progress.total) * 100}%` }} />
                </div>
                <p style={{ margin: 0, fontSize: "13px", color: "#555", fontWeight: 600 }}>Uploaden {progress.done} / {progress.total}</p>
              </>
            ) : (
              <>
                <p style={{ margin: "0 0 3px", fontSize: "14px", fontWeight: 700, color: "#111" }}>Sleep foto's hierheen of klik om te selecteren</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#aaa" }}>Meerdere foto's tegelijk mogelijk · JPG, PNG, WEBP</p>
              </>
            )}
          </div>

          {/* Toolbar */}
          {fotos.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
              {/* Alles selecteren checkbox */}
              <label style={{ display: "flex", alignItems: "center", gap: "7px", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#333", userSelect: "none" }}>
                <input type="checkbox" checked={allSelected} onChange={selectAll} style={{ width: "15px", height: "15px", cursor: "pointer", accentColor: "var(--primary)" }} />
                {allSelected ? "Alles deselecteren" : "Alles selecteren"}
              </label>

              <span style={{ color: "#ddd", fontSize: "16px" }}>|</span>

              {selected.size > 0 ? (
                <>
                  <span style={{ fontSize: "12px", color: "#888", fontWeight: 600 }}>{selected.size} geselecteerd</span>
                  <button
                    onClick={() => bulkSetImpressies(true)}
                    style={{ ...btnPrimary, fontSize: "12px", padding: "6px 14px" }}
                  >
                    Impressies pagina
                  </button>
                  <button
                    onClick={() => bulkSetImpressies(false)}
                    style={{ background: "none", color: "#555", border: "1.5px solid rgba(0,0,0,0.15)", borderRadius: "8px", padding: "5px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                  >
                    Niet op impressies
                  </button>
                  <button onClick={bulkDelete} style={{ ...btnDanger, fontSize: "12px" }}>Verwijderen</button>
                </>
              ) : (
                <span style={{ fontSize: "12px", color: "#aaa" }}>
                  {impressiesCount} van {fotos.length} op impressies pagina
                </span>
              )}
            </div>
          )}

          {/* Foto grid */}
          {fotos.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px" }}>
              {fotos.map((foto) => {
                const isSelected = selected.has(foto.id);
                return (
                  <div
                    key={foto.id}
                    onClick={() => toggleSelect(foto.id)}
                    style={{ position: "relative", borderRadius: "10px", overflow: "hidden", cursor: "pointer", border: isSelected ? "2px solid var(--primary)" : foto.impressies ? "2px solid rgba(243,106,42,0.4)" : "2px solid transparent", transition: "border-color 0.15s", boxShadow: isSelected ? "0 0 0 2px rgba(243,106,42,0.2)" : "none" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={foto.url} alt="" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />

                    {/* Checkbox overlay */}
                    <div style={{ position: "absolute", top: "7px", left: "7px" }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(foto.id)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--primary)" }}
                      />
                    </div>

                    {/* Impressies badge */}
                    {foto.impressies && (
                      <div style={{ position: "absolute", bottom: "6px", left: "6px", background: "var(--primary)", borderRadius: "4px", padding: "2px 7px", fontSize: "9px", fontWeight: 700, color: "#fff", letterSpacing: "0.04em" }}>
                        IMPRESSIES
                      </div>
                    )}

                    {/* Selectie overlay */}
                    {isSelected && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(243,106,42,0.15)", pointerEvents: "none" }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {fotos.length === 0 && !uploading && (
            <p style={{ margin: 0, fontSize: "13px", color: "#aaa", textAlign: "center", padding: "12px 0" }}>Nog geen foto's — upload hierboven om te beginnen.</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function BestandenAdminPage() {
  const [tab, setTab] = useState<"bestanden" | "fotos">("bestanden");

  const tabBtn = (t: typeof tab) => ({
    padding: "8px 20px", fontSize: "13px", fontWeight: 600, borderRadius: "35px", border: "1.5px solid",
    cursor: "pointer" as const,
    background: tab === t ? "var(--primary)" : "#fff",
    color: tab === t ? "#fff" : "#555",
    borderColor: tab === t ? "var(--primary)" : "rgba(0,0,0,0.15)",
  });

  return (
    <div>
      <div style={{ padding: "28px 32px 24px", background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <h1 style={{ margin: "0 0 16px", fontSize: "22px", fontWeight: 800, color: "#111", letterSpacing: "-0.5px" }}>Bestanden</h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <button style={tabBtn("bestanden")} onClick={() => setTab("bestanden")}>Bestanden & Liedjes</button>
          <button style={tabBtn("fotos")} onClick={() => setTab("fotos")}>Foto albums</button>
        </div>
      </div>

      {tab === "bestanden" && <BestandenTab />}
      {tab === "fotos" && <FotoAlbumsTab />}
    </div>
  );
}
