"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { btnPrimary, btnOutline, btnDanger, btnEdit, inputStyle, labelStyle, thStyle, tdStyle } from "../_components/adminStyles";

interface Sponsor {
  id: number;
  naam: string;
  url: string;
  logo_url: string | null;
  volgorde: number;
  actief: boolean;
}

const empty = { naam: "", url: "", logo_url: "", volgorde: 0, actief: true };

export default function SponsorklisAdminPage() {
  const supabase = createClient();
  const [items, setItems]       = useState<Sponsor[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<Sponsor | null>(null);
  const [form, setForm]         = useState(empty);
  const [saving, setSaving]     = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("sponsors").select("*").order("volgorde").order("naam");
    setItems(data || []);
    setLoading(false);
  }

  function openAdd() { setEditing(null); setForm(empty); setShowForm(true); }
  function openEdit(item: Sponsor) {
    setEditing(item);
    setForm({ naam: item.naam, url: item.url, logo_url: item.logo_url || "", volgorde: item.volgorde, actief: item.actief });
    setShowForm(true);
  }

  const set = (k: string, v: string | boolean | number) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.naam || !form.url) return;
    setSaving(true);
    const payload = { naam: form.naam, url: form.url, logo_url: form.logo_url || null, volgorde: Number(form.volgorde), actief: form.actief };
    if (editing) {
      await supabase.from("sponsors").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("sponsors").insert(payload);
    }
    setSaving(false);
    setShowForm(false);
    load();
  }

  async function remove(id: number) {
    if (!confirm("Sponsor verwijderen?")) return;
    await supabase.from("sponsors").delete().eq("id", id);
    load();
  }

  async function toggleActief(item: Sponsor) {
    await supabase.from("sponsors").update({ actief: !item.actief }).eq("id", item.id);
    load();
  }

  return (
    <div>
      <div style={{ padding: "28px 32px 24px", background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#111", letterSpacing: "-0.5px" }}>Sponsorkliks</h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>{items.length} sponsors</p>
        </div>
        <button style={btnPrimary} onClick={openAdd}>+ Nieuwe sponsor</button>
      </div>

      {showForm && (
        <div style={{ margin: "24px 32px 0", background: "#fff", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: "24px" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700, color: "#111" }}>{editing ? "Sponsor bewerken" : "Nieuwe sponsor"}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {[["naam","Naam *","text"],["url","Website URL *","url"],["logo_url","Logo URL (optioneel)","url"]].map(([k, lbl, type]) => (
              <div key={k} style={{ gridColumn: k === "logo_url" ? "1/-1" : undefined }}>
                <label style={labelStyle}>{lbl}</label>
                <input type={type} value={(form as any)[k]} onChange={(e) => set(k, e.target.value)} style={inputStyle} />
              </div>
            ))}
            <div>
              <label style={labelStyle}>Volgorde</label>
              <input type="number" value={form.volgorde} onChange={(e) => set("volgorde", Number(e.target.value))} style={inputStyle} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "24px" }}>
              <input type="checkbox" id="actief" checked={form.actief} onChange={(e) => set("actief", e.target.checked)} style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }} />
              <label htmlFor="actief" style={{ fontSize: "13px", fontWeight: 600, color: "#444", cursor: "pointer" }}>Actief (zichtbaar)</label>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button style={btnPrimary} onClick={save} disabled={saving}>{saving ? "Opslaan…" : "Opslaan"}</button>
            <button style={btnOutline} onClick={() => setShowForm(false)}>Annuleren</button>
          </div>
        </div>
      )}

      <div style={{ margin: "24px 32px 32px", background: "#fff", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden" }}>
        {loading ? <p style={{ padding: "32px", color: "#888", fontSize: "14px" }}>Laden…</p> : items.length === 0 ? <p style={{ padding: "32px", color: "#aaa", fontSize: "14px" }}>Nog geen sponsors.</p> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["Naam","URL","Volgorde","Status","Acties"].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {item.logo_url && <img src={item.logo_url} alt={item.naam} style={{ height: "24px", width: "auto", objectFit: "contain" }} />}
                      {item.naam}
                    </div>
                  </td>
                  <td style={tdStyle}><a href={item.url} target="_blank" rel="noopener" style={{ color: "var(--primary)", fontSize: "12px" }}>{item.url}</a></td>
                  <td style={tdStyle}>{item.volgorde}</td>
                  <td style={tdStyle}>
                    <button onClick={() => toggleActief(item)} style={{ fontSize: "11px", fontWeight: 700, color: item.actief ? "#16a34a" : "#888", background: item.actief ? "rgba(22,163,74,0.08)" : "rgba(0,0,0,0.05)", border: "none", borderRadius: "100px", padding: "3px 10px", cursor: "pointer" }}>
                      {item.actief ? "Actief" : "Inactief"}
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
