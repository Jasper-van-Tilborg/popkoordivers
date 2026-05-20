"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createUser, deleteUser, updateUserRol } from "./actions";
import { btnPrimary, btnOutline, btnDanger, inputStyle, labelStyle, thStyle, tdStyle } from "../_components/adminStyles";

interface Lid { id: string; email: string; naam: string | null; rol: string; stemgroep: string | null; created_at: string; }

const stemgroepen = ["", "Alt", "Mezzo", "Sopraan", "Tenor", "Bas"];
const rollen = ["lid", "admin"];

export default function LedenClient({ leden }: { leden: Lid[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ email: "", password: "", naam: "", stemgroep: "", rol: "lid" });
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    const result = await createUser(fd);
    setSaving(false);
    if (result?.error) { setError(result.error); return; }
    setShowForm(false);
    setForm({ email: "", password: "", naam: "", stemgroep: "", rol: "lid" });
    router.refresh();
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Account van ${email} verwijderen?`)) return;
    startTransition(async () => {
      await deleteUser(id);
      router.refresh();
    });
  }

  async function handleRol(id: string, rol: string) {
    startTransition(async () => {
      await updateUserRol(id, rol);
      router.refresh();
    });
  }

  return (
    <div>
      <div style={{ padding: "28px 32px 24px", background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#111", letterSpacing: "-0.5px" }}>Leden</h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>{leden.length} accounts</p>
        </div>
        <button style={btnPrimary} onClick={() => setShowForm(!showForm)}>+ Nieuw account</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={{ margin: "24px 32px 0", background: "#fff", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", padding: "24px" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700, color: "#111" }}>Nieuw account aanmaken</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Naam</label>
              <input type="text" value={form.naam} onChange={(e) => set("naam", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>E-mailadres *</label>
              <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Wachtwoord *</label>
              <input type="password" required minLength={8} value={form.password} onChange={(e) => set("password", e.target.value)} style={inputStyle} placeholder="Minimaal 8 tekens" />
            </div>
            <div>
              <label style={labelStyle}>Stemgroep</label>
              <select value={form.stemgroep} onChange={(e) => set("stemgroep", e.target.value)} style={inputStyle}>
                {stemgroepen.map((s) => <option key={s} value={s}>{s || "— geen —"}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Rol</label>
              <select value={form.rol} onChange={(e) => set("rol", e.target.value)} style={inputStyle}>
                {rollen.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
          </div>
          {error && <p style={{ margin: "12px 0 0", fontSize: "13px", color: "#dc2626", background: "#fef2f2", padding: "10px 14px", borderRadius: "8px" }}>{error}</p>}
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button type="submit" style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }} disabled={saving}>{saving ? "Aanmaken…" : "Account aanmaken"}</button>
            <button type="button" style={btnOutline} onClick={() => { setShowForm(false); setError(""); }}>Annuleren</button>
          </div>
        </form>
      )}

      <div style={{ margin: "24px 32px 32px", background: "#fff", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden", opacity: isPending ? 0.7 : 1 }}>
        {leden.length === 0 ? <p style={{ padding: "32px", color: "#aaa", fontSize: "14px" }}>Nog geen accounts.</p> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["E-mail","Naam","Stemgroep","Rol","Aangemaakt","Acties"].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {leden.map((lid) => (
                <tr key={lid.id}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{lid.email}</td>
                  <td style={tdStyle}>{lid.naam || <span style={{ color: "#ccc" }}>—</span>}</td>
                  <td style={tdStyle}>{lid.stemgroep || <span style={{ color: "#ccc" }}>—</span>}</td>
                  <td style={tdStyle}>
                    <select
                      value={lid.rol}
                      onChange={(e) => handleRol(lid.id, e.target.value)}
                      style={{ fontSize: "12px", fontWeight: 700, color: lid.rol === "admin" ? "var(--primary)" : "#555", background: lid.rol === "admin" ? "rgba(243,106,42,0.10)" : "rgba(0,0,0,0.05)", border: "none", borderRadius: "100px", padding: "4px 10px", cursor: "pointer", outline: "none" }}
                    >
                      {rollen.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                    </select>
                  </td>
                  <td style={{ ...tdStyle, color: "#888", fontSize: "12px" }}>{new Date(lid.created_at).toLocaleDateString("nl-NL")}</td>
                  <td style={tdStyle}>
                    <button style={btnDanger} onClick={() => handleDelete(lid.id, lid.email)}>Verwijderen</button>
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
