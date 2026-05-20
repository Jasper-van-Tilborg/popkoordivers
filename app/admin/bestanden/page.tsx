"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { btnPrimary, btnDanger, inputStyle, labelStyle, thStyle, tdStyle } from "../_components/adminStyles";

interface Bestand {
  id: number;
  naam: string;
  categorie: string;
  stemgroep: string | null;
  storage_path: string;
  bucket: string;
  bestandsnaam: string;
  created_at: string;
}

const cats = ["liedjes", "nieuwsbrieven", "opnames", "choreo", "oude_optredens"];
const catBuckets: Record<string, string> = { liedjes: "liedjes", nieuwsbrieven: "nieuwsbrieven", opnames: "media", choreo: "media", oude_optredens: "media" };
const stemgroepen = ["Alt", "Mezzo", "Sopraan", "Tenor", "Bas"];

export default function BestandenAdminPage() {
  const supabase = createClient();
  const fileRef  = useRef<HTMLInputElement>(null);

  const [items, setItems]         = useState<Bestand[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("all");
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [form, setForm]           = useState({ naam: "", categorie: "nieuwsbrieven", stemgroep: "" });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("bestanden").select("*").order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) { setUploadErr("Selecteer een bestand."); return; }
    if (!form.naam) { setUploadErr("Geef een weergavenaam op."); return; }
    setUploadErr("");
    setUploading(true);

    const bucket = catBuckets[form.categorie] || "media";
    const ext    = file.name.split(".").pop();
    const path   = `${form.categorie}/${Date.now()}-${file.name}`;

    const { error: upErr } = await supabase.storage.from(bucket).upload(path, file);
    if (upErr) { setUploadErr(upErr.message); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

    await supabase.from("bestanden").insert({
      naam: form.naam,
      categorie: form.categorie,
      stemgroep: form.categorie === "liedjes" && form.stemgroep ? form.stemgroep : null,
      storage_path: urlData.publicUrl,
      bucket,
      bestandsnaam: file.name,
    });

    setForm({ naam: "", categorie: form.categorie, stemgroep: "" });
    if (fileRef.current) fileRef.current.value = "";
    setUploading(false);
    load();
  }

  async function remove(item: Bestand) {
    if (!confirm("Bestand verwijderen?")) return;
    const pathInBucket = item.storage_path.split(`/${item.bucket}/`)[1];
    if (pathInBucket) await supabase.storage.from(item.bucket).remove([pathInBucket]);
    await supabase.from("bestanden").delete().eq("id", item.id);
    load();
  }

  const filtered = filter === "all" ? items : items.filter((i) => i.categorie === filter);

  const catLabel: Record<string, string> = { liedjes: "Liedjes", nieuwsbrieven: "Nieuwsbrieven", opnames: "Opnames", choreo: "Choreo", oude_optredens: "Oude optredens" };

  return (
    <div>
      <div style={{ padding: "28px 32px 24px", background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#111", letterSpacing: "-0.5px" }}>Bestanden</h1>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>{items.length} bestanden in totaal</p>
      </div>

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
        {[["all","Alles"], ...cats.map((c) => [c, catLabel[c]])].map(([val, lbl]) => (
          <button key={val} onClick={() => setFilter(val)}
            style={{ padding: "6px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "35px", border: "1.5px solid", cursor: "pointer", background: filter === val ? "var(--primary)" : "#fff", color: filter === val ? "#fff" : "#555", borderColor: filter === val ? "var(--primary)" : "rgba(0,0,0,0.15)" }}>
            {lbl}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ margin: "16px 32px 32px", background: "#fff", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden" }}>
        {loading ? <p style={{ padding: "32px", color: "#888", fontSize: "14px" }}>Laden…</p> : filtered.length === 0 ? <p style={{ padding: "32px", color: "#aaa", fontSize: "14px" }}>Geen bestanden.</p> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["Naam","Categorie","Stemgroep","Bestandsnaam","Acties"].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                    <a href={item.storage_path} target="_blank" rel="noopener" style={{ color: "var(--primary)", textDecoration: "none" }}>{item.naam}</a>
                  </td>
                  <td style={tdStyle}><span style={{ fontSize: "11px", fontWeight: 700, background: "rgba(243,106,42,0.10)", color: "var(--primary)", padding: "2px 8px", borderRadius: "100px" }}>{catLabel[item.categorie] || item.categorie}</span></td>
                  <td style={tdStyle}>{item.stemgroep || "—"}</td>
                  <td style={{ ...tdStyle, color: "#888", fontSize: "12px" }}>{item.bestandsnaam}</td>
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
