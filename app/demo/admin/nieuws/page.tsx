"use client";

import { useState } from "react";
import { btnPrimary, btnEdit, btnDanger, thStyle, tdStyle } from "@/app/admin/_components/adminStyles";

const demoNieuws = [
  { id: 1, titel: "Zomerconcert 2026 — kaartverkoop gestart!", datum: "10 mei 2026", gepubliceerd: true },
  { id: 2, titel: "Repetitieweekend oktober — aanmelden", datum: "22 april 2026", gepubliceerd: true },
  { id: 3, titel: "Welkom bij het nieuwe seizoen 2026", datum: "5 januari 2026", gepubliceerd: true },
];

export default function DemoNieuwsPage() {
  const [items, setItems] = useState(demoNieuws);

  return (
    <div>
      <div style={{ background: "rgba(243,106,42,0.07)", borderBottom: "1px solid rgba(243,106,42,0.15)", padding: "8px 32px", fontSize: "12px", color: "var(--primary)", fontWeight: 600 }}>
        Demo modus · Wijzigingen worden niet opgeslagen
      </div>
      <div style={{ padding: "28px 32px 24px", background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#111", letterSpacing: "-0.5px" }}>Nieuws</h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>{items.length} berichten</p>
        </div>
        <button style={btnPrimary}>+ Nieuw bericht</button>
      </div>
      <div style={{ margin: "24px 32px 32px", background: "#fff", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>{["Titel", "Datum", "Gepubliceerd", "Acties"].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{item.titel}</td>
                <td style={tdStyle}>{item.datum}</td>
                <td style={tdStyle}><span style={{ fontSize: "11px", fontWeight: 700, color: item.gepubliceerd ? "#16a34a" : "#888" }}>{item.gepubliceerd ? "Ja" : "Nee"}</span></td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button style={btnEdit}>Bewerken</button>
                    <button style={btnDanger} onClick={() => setItems((p) => p.filter((i) => i.id !== item.id))}>Verwijderen</button>
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
