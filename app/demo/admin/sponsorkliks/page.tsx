import { thStyle, tdStyle } from "@/app/admin/_components/adminStyles";

const demoSponsors = [
  { naam: "Thuisbezorgd", url: "https://thuisbezorgd.nl", kliks: 142, actief: true },
  { naam: "bol.com", url: "https://bol.com", kliks: 89, actief: true },
  { naam: "Booking.com", url: "https://booking.com", kliks: 56, actief: false },
];

export default function DemoSponsorKliksPage() {
  return (
    <div>
      <div style={{ background: "rgba(243,106,42,0.07)", borderBottom: "1px solid rgba(243,106,42,0.15)", padding: "8px 32px", fontSize: "12px", color: "var(--primary)", fontWeight: 600 }}>
        Demo modus · Wijzigingen worden niet opgeslagen
      </div>
      <div style={{ padding: "28px 32px 24px", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 20, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#111", letterSpacing: "-0.5px" }}>Sponsorkliks</h1>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>{demoSponsors.length} sponsors</p>
      </div>
      <div style={{ margin: "24px 32px 32px", background: "#fff", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>{["Naam", "URL", "Kliks", "Actief"].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {demoSponsors.map((item) => (
              <tr key={item.naam}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{item.naam}</td>
                <td style={{ ...tdStyle, color: "var(--primary)" }}>{item.url}</td>
                <td style={{ ...tdStyle, fontWeight: 700 }}>{item.kliks}</td>
                <td style={tdStyle}><span style={{ fontSize: "11px", fontWeight: 700, color: item.actief ? "#16a34a" : "#888" }}>{item.actief ? "Ja" : "Nee"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
