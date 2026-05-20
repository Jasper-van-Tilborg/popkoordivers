"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { btnPrimary, btnOutline, btnDanger, btnEdit, inputStyle, labelStyle, thStyle, tdStyle } from "../_components/adminStyles";

interface AgendaItem {
  id: number;
  titel: string;
  datum: string;
  tijd: string | null;
  locatie: string | null;
  label: string | null;
  label_kleur: string | null;
  beschrijving: string | null;
  link: string | null;
  gepubliceerd: boolean;
}

const empty = { titel: "", datum: "", tijd: "", locatie: "", label: "", label_kleur: "#F36A2A", beschrijving: "", link: "", gepubliceerd: true };

export default function AgendaAdminPage() {
  const supabase = createClient();
  const [items, setItems]       = useState<AgendaItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<AgendaItem | null>(null);
  const [form, setForm]         = useState(empty);
  const [saving, setSaving]     = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("agenda").select("*").order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  function openAdd() { setEditing(null); setForm(empty); setShowForm(true); }
  function openEdit(item: AgendaItem) {
    setEditing(item);
    setForm({ titel: item.titel, datum: item.datum, tijd: item.tijd || "", locatie: item.locatie || "", label: item.label || "", label_kleur: item.label_kleur || "#F36A2A", beschrijving: item.beschrijving || "", link: item.link || "", gepubliceerd: item.gepubliceerd });
    setShowForm(true);
  }

  async function save() {
    if (!form.titel || !form.datum) return;
    setSaving(true);
    if (editing) {
      await supabase.from("agenda").update(form).eq("id", editing.id);
    } else {
      await supabase.from("agenda").insert(form);
    }
    setSaving(false);
    setShowForm(false);
    load();
  }

  async function remove(id: number) {
    if (!confirm("Optreden verwijderen?")) return;
    await supabase.from("agenda").delete().eq("id", id);
    load();
  }

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      {/* Header */}
      <div style={{ padding: "28px 32px 24px", background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#111", letterSpacing: "-0.5px" }}>Agenda</h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>{items.length} optredens</p>
        </div>
        <button style={btnPrimary} onClick={openAdd}>+ Nieuw optreden</button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ margin: "24px 32px 0", background: "#fff", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: "24px" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700, color: "#111" }}>
            {editing ? "Optreden bewerken" : "Nieuw optreden"}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {[["titel","Titel *","text"],["datum","Datum *","text"],["tijd","Tijd","text"],["locatie","Locatie","text"],["label","Label","text"],["label_kleur","Labelkleur","color"],["link","Link (optioneel)","url"]].map(([k, lbl, type]) => (
              <div key={k}>
                <label style={labelStyle}>{lbl}</label>
                <input type={type} value={(form as any)[k]} onChange={(e) => set(k, e.target.value)} style={{ ...inputStyle, width: type === "color" ? "60px" : "100%", padding: type === "color" ? "4px" : inputStyle.padding, height: type === "color" ? "38px" : undefined }} />
              </div>
            ))}
            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>Beschrijving</label>
              <textarea rows={3} value={form.beschrijving} onChange={(e) => set("beschrijving", e.target.value)} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input type="checkbox" id="gepub" checked={form.gepubliceerd} onChange={(e) => set("gepubliceerd", e.target.checked)} style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }} />
              <label htmlFor="gepub" style={{ fontSize: "13px", fontWeight: 600, color: "#444", cursor: "pointer" }}>Gepubliceerd</label>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button style={btnPrimary} onClick={save} disabled={saving}>{saving ? "Opslaan…" : "Opslaan"}</button>
            <button style={btnOutline} onClick={() => setShowForm(false)}>Annuleren</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ margin: "24px 32px 32px", background: "#fff", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden" }}>
        {loading ? (
          <p style={{ padding: "32px", color: "#888", fontSize: "14px" }}>Laden…</p>
        ) : items.length === 0 ? (
          <p style={{ padding: "32px", color: "#aaa", fontSize: "14px" }}>Nog geen optredens.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Titel","Datum","Tijd","Locatie","Label","Pub","Acties"].map((h) => <th key={h} style={thStyle}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{item.titel}</td>
                  <td style={tdStyle}>{item.datum}</td>
                  <td style={tdStyle}>{item.tijd || "—"}</td>
                  <td style={tdStyle}>{item.locatie || "—"}</td>
                  <td style={tdStyle}>
                    {item.label && <span style={{ fontSize: "11px", fontWeight: 700, color: "#fff", background: item.label_kleur || "var(--primary)", padding: "2px 8px", borderRadius: "100px" }}>{item.label}</span>}
                  </td>
                  <td style={tdStyle}><span style={{ fontSize: "11px", fontWeight: 700, color: item.gepubliceerd ? "#16a34a" : "#888" }}>{item.gepubliceerd ? "Ja" : "Nee"}</span></td>
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
