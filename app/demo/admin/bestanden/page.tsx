import { thStyle, tdStyle } from "@/app/admin/_components/adminStyles";

const demoBestanden = [
  { naam: "Nieuwsbrief mei 2026", bestandsnaam: "nieuwsbrief-mei-2026.pdf", datum: "mei 2026" },
  { naam: "Nieuwsbrief maart 2026", bestandsnaam: "nieuwsbrief-maart-2026.pdf", datum: "maart 2026" },
  { naam: "Nieuwsbrief januari 2026", bestandsnaam: "nieuwsbrief-jan-2026.pdf", datum: "januari 2026" },
];

export default function DemoBestandenPage() {
  return (
    <div>
      <div style={{ background: "rgba(243,106,42,0.07)", borderBottom: "1px solid rgba(243,106,42,0.15)", padding: "8px 32px", fontSize: "12px", color: "var(--primary)", fontWeight: 600 }}>
        Demo modus · Wijzigingen worden niet opgeslagen
      </div>
      <div style={{ padding: "28px 32px 24px", background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#111", letterSpacing: "-0.5px" }}>Bestanden</h1>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>{demoBestanden.length} bestanden</p>
      </div>
      <div style={{ margin: "24px 32px 32px", background: "#fff", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>{["Naam", "Bestandsnaam", "Datum"].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {demoBestanden.map((item) => (
              <tr key={item.naam}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{item.naam}</td>
                <td style={tdStyle}>{item.bestandsnaam}</td>
                <td style={tdStyle}>{item.datum}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
