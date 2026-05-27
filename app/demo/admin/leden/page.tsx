"use client";

import { useState } from "react";
import { btnPrimary, btnEdit, btnDanger, thStyle, tdStyle } from "@/app/admin/_components/adminStyles";

const demoLeden = [
  { id: 1, naam: "Anna Bakker", email: "a.bakker@example.nl", stemgroep: "Alt", actief: true },
  { id: 2, naam: "Lies Verhoeven", email: "l.verhoeven@example.nl", stemgroep: "Alt", actief: true },
  { id: 3, naam: "Karin de Wit", email: "k.dewit@example.nl", stemgroep: "Mezzo", actief: true },
  { id: 4, naam: "Els Mulder", email: "e.mulder@example.nl", stemgroep: "Mezzo", actief: true },
  { id: 5, naam: "Susan Peters", email: "s.peters@example.nl", stemgroep: "Sopraan", actief: true },
  { id: 6, naam: "Linda Hooft", email: "l.hooft@example.nl", stemgroep: "Sopraan", actief: true },
  { id: 7, naam: "Henk Smit", email: "h.smit@example.nl", stemgroep: "Tenor", actief: true },
  { id: 8, naam: "Tom van Dijk", email: "t.vandijk@example.nl", stemgroep: "Tenor", actief: false },
  { id: 9, naam: "Jan Koster", email: "j.koster@example.nl", stemgroep: "Bas", actief: true },
  { id: 10, naam: "Wim de Groot", email: "w.degroot@example.nl", stemgroep: "Bas", actief: true },
];

export default function DemoLedenAdminPage() {
  const [items, setItems] = useState(demoLeden);

  return (
    <div>
      <div style={{ background: "rgba(243,106,42,0.07)", borderBottom: "1px solid rgba(243,106,42,0.15)", padding: "8px 32px", fontSize: "12px", color: "var(--primary)", fontWeight: 600 }}>
        Demo modus · Wijzigingen worden niet opgeslagen
      </div>
      <div style={{ padding: "28px 32px 24px", background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#111", letterSpacing: "-0.5px" }}>Leden</h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>{items.length} leden</p>
        </div>
        <button style={btnPrimary}>+ Nieuw lid</button>
      </div>
      <div style={{ margin: "24px 32px 32px", background: "#fff", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>{["Naam", "E-mailadres", "Stemgroep", "Actief", "Acties"].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {items.map((lid) => (
              <tr key={lid.id}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{lid.naam}</td>
                <td style={tdStyle}>{lid.email}</td>
                <td style={tdStyle}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--primary)", background: "rgba(243,106,42,0.08)", padding: "2px 8px", borderRadius: "100px" }}>
                    {lid.stemgroep}
                  </span>
                </td>
                <td style={tdStyle}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: lid.actief ? "#16a34a" : "#888" }}>
                    {lid.actief ? "Ja" : "Nee"}
                  </span>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button style={btnEdit}>Bewerken</button>
                    <button style={btnDanger} onClick={() => setItems((p) => p.filter((i) => i.id !== lid.id))}>Verwijderen</button>
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
