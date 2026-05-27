"use client";

import { useState } from "react";
import { btnPrimary, btnOutline, btnDanger, btnEdit, inputStyle, labelStyle, thStyle, tdStyle } from "@/app/admin/_components/adminStyles";

interface AgendaItem {
  id: number;
  titel: string;
  datum: string;
  tijd: string | null;
  locatie: string | null;
  label: string | null;
  label_kleur: string | null;
  gepubliceerd: boolean;
}

const demoItems: AgendaItem[] = [
  { id: 1, titel: "Zomerconcert 2026", datum: "14 juni 2026", tijd: "20:00", locatie: "Cultuurcentrum De Vlinderhal, Delft", label: "Concert", label_kleur: "#F36A2A", gepubliceerd: true },
  { id: 2, titel: "Koordag 2026", datum: "5 september 2026", tijd: "14:00", locatie: "Gemeentehuis, Den Haag", label: "Intern", label_kleur: "#6366f1", gepubliceerd: true },
  { id: 3, titel: "Kersconcert 2026", datum: "19 december 2026", tijd: "19:30", locatie: "Grote Kerk, Delft", label: "Concert", label_kleur: "#F36A2A", gepubliceerd: true },
  { id: 4, titel: "Repetitieweekend", datum: "17–18 oktober 2026", tijd: null, locatie: "Conferentieoord De Horst", label: "Weekend", label_kleur: "#16a34a", gepubliceerd: false },
  { id: 5, titel: "Nieuwjaarsborrel", datum: "10 januari 2027", tijd: "16:00", locatie: "Repetitielocatie", label: "Sociaal", label_kleur: "#888888", gepubliceerd: true },
];

const empty = { titel: "", datum: "", tijd: "", locatie: "", label: "", label_kleur: "#F36A2A", gepubliceerd: true };

export default function DemoAgendaPage() {
  const [items, setItems] = useState<AgendaItem[]>(demoItems);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AgendaItem | null>(null);
  const [form, setForm] = useState(empty);

  function openAdd() { setEditing(null); setForm(empty); setShowForm(true); }
  function openEdit(item: AgendaItem) {
    setEditing(item);
    setForm({ titel: item.titel, datum: item.datum, tijd: item.tijd || "", locatie: item.locatie || "", label: item.label || "", label_kleur: item.label_kleur || "#F36A2A", gepubliceerd: item.gepubliceerd });
    setShowForm(true);
  }

  function save() {
    if (!form.titel || !form.datum) return;
    if (editing) {
      setItems((prev) => prev.map((i) => i.id === editing.id ? { ...editing, ...form } : i));
    } else {
      setItems((prev) => [...prev, { id: Date.now(), ...form, tijd: form.tijd || null, locatie: form.locatie || null, label: form.label || null, label_kleur: form.label_kleur }]);
    }
    setShowForm(false);
  }

  function remove(id: number) {
    if (!confirm("Optreden verwijderen?")) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      {/* Demo banner */}
      <div
        style={{
          background: "rgba(243,106,42,0.07)",
          borderBottom: "1px solid rgba(243,106,42,0.15)",
          padding: "8px 32px",
          fontSize: "12px",
          color: "var(--primary)",
          fontWeight: 600,
        }}
      >
        Demo modus · Wijzigingen worden niet opgeslagen en zijn alleen zichtbaar in deze sessie
      </div>

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
            {([
              ["titel", "Titel *", "text"],
              ["datum", "Weergavedatum *", "text"],
              ["tijd", "Tijd", "text"],
              ["locatie", "Locatie", "text"],
              ["label", "Label", "text"],
              ["label_kleur", "Labelkleur", "color"],
            ] as [string, string, string][]).map(([k, lbl, type]) => (
              <div key={k}>
                <label style={labelStyle}>{lbl}</label>
                <input
                  type={type}
                  value={(form as Record<string, string | boolean>)[k] as string}
                  onChange={(e) => set(k, e.target.value)}
                  style={{ ...inputStyle, width: type === "color" ? "60px" : "100%", padding: type === "color" ? "4px" : inputStyle.padding, height: type === "color" ? "38px" : undefined }}
                />
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input type="checkbox" id="gepub" checked={form.gepubliceerd} onChange={(e) => set("gepubliceerd", e.target.checked)} style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }} />
              <label htmlFor="gepub" style={{ fontSize: "13px", fontWeight: 600, color: "#444", cursor: "pointer" }}>Gepubliceerd</label>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button style={btnPrimary} onClick={save}>Opslaan</button>
            <button style={btnOutline} onClick={() => setShowForm(false)}>Annuleren</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ margin: "24px 32px 32px", background: "#fff", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Titel", "Datum", "Tijd", "Locatie", "Label", "Pub", "Acties"].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
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
                  {item.label && (
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#fff", background: item.label_kleur || "var(--primary)", padding: "2px 8px", borderRadius: "100px" }}>
                      {item.label}
                    </span>
                  )}
                </td>
                <td style={tdStyle}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: item.gepubliceerd ? "#16a34a" : "#888" }}>
                    {item.gepubliceerd ? "Ja" : "Nee"}
                  </span>
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
      </div>
    </div>
  );
}
