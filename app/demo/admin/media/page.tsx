import { thStyle, tdStyle } from "@/app/admin/_components/adminStyles";

const demoMedia = [
  { naam: "kersconcert-2025-foto1.jpg", type: "Afbeelding", grootte: "2.4 MB", datum: "december 2025" },
  { naam: "zomerconcert-2025-video.mp4", type: "Video", grootte: "180 MB", datum: "juni 2025" },
  { naam: "logo-popkoor-divers.svg", type: "Vector", grootte: "12 KB", datum: "januari 2025" },
];

export default function DemoMediaPage() {
  return (
    <div>
      <div style={{ background: "rgba(243,106,42,0.07)", borderBottom: "1px solid rgba(243,106,42,0.15)", padding: "8px 32px", fontSize: "12px", color: "var(--primary)", fontWeight: 600 }}>
        Demo modus · Wijzigingen worden niet opgeslagen
      </div>
      <div style={{ padding: "28px 32px 24px", background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#111", letterSpacing: "-0.5px" }}>Media</h1>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>{demoMedia.length} bestanden</p>
      </div>
      <div style={{ margin: "24px 32px 32px", background: "#fff", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>{["Bestandsnaam", "Type", "Grootte", "Datum"].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {demoMedia.map((item) => (
              <tr key={item.naam}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{item.naam}</td>
                <td style={tdStyle}>{item.type}</td>
                <td style={tdStyle}>{item.grootte}</td>
                <td style={tdStyle}>{item.datum}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
