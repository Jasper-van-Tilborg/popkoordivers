"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { btnPrimary, btnOutline, btnDanger, btnEdit, inputStyle, labelStyle, thStyle, tdStyle } from "../_components/adminStyles";

interface Bericht {
  id: number;
  slug: string;
  titel: string;
  datum: string;
  categorie: string;
  intro: string;
  inhoud: string;
  afbeelding: string;
  gepubliceerd: boolean;
}

function toSlug(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

const empty = { slug: "", titel: "", datum: "", categorie: "Nieuws", intro: "", inhoud: "", afbeelding: "", gepubliceerd: true };

export default function NieuwsAdminPage() {
  const supabase = createClient();
  const [items, setItems]       = useState<Bericht[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<Bericht | null>(null);
  const [form, setForm]         = useState(empty);
  const [saving, setSaving]     = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("berichten").select("*").order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  function openAdd() { setEditing(null); setForm(empty); setShowForm(true); }
  function openEdit(item: Bericht) {
    setEditing(item);
    setForm({ slug: item.slug, titel: item.titel, datum: item.datum, categorie: item.categorie, intro: item.intro, inhoud: item.inhoud, afbeelding: item.afbeelding, gepubliceerd: item.gepubliceerd });
    setShowForm(true);
  }

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  function handleTitel(v: string) {
    setForm((f) => ({ ...f, titel: v, slug: editing ? f.slug : toSlug(v) }));
  }

  async function save() {
    if (!form.titel || !form.datum || !form.intro) return;
    const payload = { ...form, slug: form.slug || toSlug(form.titel) };
    setSaving(true);
    if (editing) {
      await supabase.from("berichten").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("berichten").insert(payload);
    }
    setSaving(false);
    setShowForm(false);
    load();
  }

  async function remove(id: number) {
    if (!confirm("Bericht verwijderen?")) return;
    await supabase.from("berichten").delete().eq("id", id);
    load();
  }

  async function togglePub(item: Bericht) {
    await supabase.from("berichten").update({ gepubliceerd: !item.gepubliceerd }).eq("id", item.id);
    load();
  }

  const categories = ["Nieuws", "Concert", "Optreden", "Leden"];

  return (
    <div>
      <div style={{ padding: "28px 32px 24px", background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#111", letterSpacing: "-0.5px" }}>Nieuws</h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>{items.length} berichten</p>
        </div>
        <button style={btnPrimary} onClick={openAdd}>+ Nieuw bericht</button>
      </div>

      {showForm && (
        <div style={{ margin: "24px 32px 0", background: "#fff", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: "24px" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700, color: "#111" }}>{editing ? "Bericht bewerken" : "Nieuw bericht"}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>Titel *</label>
              <input type="text" value={form.titel} onChange={(e) => handleTitel(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Slug (auto)</label>
              <input type="text" value={form.slug} onChange={(e) => set("slug", e.target.value)} style={{ ...inputStyle, color: "#888" }} />
            </div>
            <div>
              <label style={labelStyle}>Datum *</label>
              <input type="text" placeholder="bijv. 12 oktober 2026" value={form.datum} onChange={(e) => set("datum", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Categorie</label>
              <select value={form.categorie} onChange={(e) => set("categorie", e.target.value)} style={inputStyle}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Afbeelding seed</label>
              <input type="text" placeholder="bijv. divers-concert-1" value={form.afbeelding} onChange={(e) => set("afbeelding", e.target.value)} style={inputStyle} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>Intro * (1–2 zinnen)</label>
              <textarea rows={2} value={form.intro} onChange={(e) => set("intro", e.target.value)} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>Inhoud (alinea's gescheiden door lege regel)</label>
              <textarea rows={10} value={form.inhoud} onChange={(e) => set("inhoud", e.target.value)} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input type="checkbox" id="gpub" checked={form.gepubliceerd} onChange={(e) => set("gepubliceerd", e.target.checked)} style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }} />
              <label htmlFor="gpub" style={{ fontSize: "13px", fontWeight: 600, color: "#444", cursor: "pointer" }}>Gepubliceerd</label>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button style={btnPrimary} onClick={save} disabled={saving}>{saving ? "Opslaan…" : "Opslaan"}</button>
            <button style={btnOutline} onClick={() => setShowForm(false)}>Annuleren</button>
          </div>
        </div>
      )}

      <div style={{ margin: "24px 32px 32px", background: "#fff", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden" }}>
        {loading ? <p style={{ padding: "32px", color: "#888", fontSize: "14px" }}>Laden…</p> : items.length === 0 ? <p style={{ padding: "32px", color: "#aaa", fontSize: "14px" }}>Nog geen berichten.</p> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["Titel","Datum","Categorie","Gepubliceerd","Acties"].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ ...tdStyle, fontWeight: 600, maxWidth: "260px" }}><span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.titel}</span></td>
                  <td style={tdStyle}>{item.datum}</td>
                  <td style={tdStyle}><span style={{ fontSize: "11px", fontWeight: 700, background: "rgba(243,106,42,0.10)", color: "var(--primary)", padding: "2px 8px", borderRadius: "100px" }}>{item.categorie}</span></td>
                  <td style={tdStyle}>
                    <button onClick={() => togglePub(item)} style={{ fontSize: "11px", fontWeight: 700, color: item.gepubliceerd ? "#16a34a" : "#888", background: item.gepubliceerd ? "rgba(22,163,74,0.08)" : "rgba(0,0,0,0.05)", border: "none", borderRadius: "100px", padding: "3px 10px", cursor: "pointer" }}>
                      {item.gepubliceerd ? "Gepubliceerd" : "Concept"}
                    </button>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button style={btnEdit} onClick={() => openEdit(item)}>Bewerken</button>
                      <button style={btnDanger} onClick={() => remove(item.id)}>Verwijderen</button>
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
