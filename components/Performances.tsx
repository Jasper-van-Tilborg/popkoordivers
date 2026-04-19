"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

const events = [
  { date: { day: "12", month: "Jun" }, title: "Zomerfestival Gilze", location: "Gilze Centrum", type: "Festival", highlight: false },
  { date: { day: "21", month: "Sep" }, title: "Open Podium Rijen", location: "Cultuurcentrum de Kring, Rijen", type: "Optreden", highlight: false },
  { date: { day: "15", month: "Nov" }, title: "Jaarlijkse Koorshow", location: "Gemeenschapshuis Gilze", type: "Eigen show", highlight: true },
  { date: { day: "20", month: "Dec" }, title: "Kerstconcert", location: "Kerk Gilze-Rijen", type: "Concert", highlight: false },
];

export default function Performances() {
  const sectionRef = useScrollReveal();

  return (
    <section id="optredens" style={{ position: "relative", padding: "100px 24px", overflow: "hidden" }}>
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 140% 80% at 50% 0%, rgba(243,106,42,0.13) 0%, rgba(255,255,255,0) 60%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.5)", pointerEvents: "none" }} />

      <div ref={sectionRef} style={{ maxWidth: "940px", margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div className="reveal" style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(243,106,42,0.09)", border: "1px solid rgba(243,106,42,0.18)", borderRadius: "100px", padding: "4px 14px", marginBottom: "20px" }}>
            <span style={{ fontSize: "10px", color: "var(--primary)", fontWeight: 700, letterSpacing: "0.08em" }}>AGENDA</span>
          </div>
          <h2 style={{ fontSize: "clamp(30px, 4.5vw, 48px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.15, color: "#111", margin: "0 0 16px" }}>
            Kom ons beleven
          </h2>
          <p style={{ fontSize: "17px", lineHeight: 1.7, color: "#555", maxWidth: "440px", margin: "0 auto" }}>
            Hieronder vind je onze komende optredens en evenementen.
          </p>
        </div>

        {/* Events list */}
        <div style={{ maxWidth: "700px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "10px" }}>
          {events.map((e, i) => (
            <div
              key={e.title}
              className="reveal"
              style={{
                animationDelay: `${i * 100}ms`,
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "18px 20px",
                borderRadius: "14px",
                background: e.highlight ? "var(--primary)" : "#FFFFFF",
                border: e.highlight ? "none" : "1px solid rgba(0,0,0,0.08)",
                boxShadow: e.highlight ? "0 4px 20px rgba(243,106,42,0.28)" : "0 1px 4px rgba(0,0,0,0.04)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(el) => {
                el.currentTarget.style.transform = "translateX(4px)";
                if (!e.highlight) el.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(el) => {
                el.currentTarget.style.transform = "translateX(0)";
                el.currentTarget.style.boxShadow = e.highlight ? "0 4px 20px rgba(243,106,42,0.28)" : "0 1px 4px rgba(0,0,0,0.04)";
              }}
            >
              <div style={{ flexShrink: 0, width: "52px", height: "52px", borderRadius: "12px", background: e.highlight ? "rgba(255,255,255,0.22)" : "rgba(243,106,42,0.09)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "18px", fontWeight: 800, lineHeight: 1, color: e.highlight ? "#fff" : "var(--primary)", letterSpacing: "-0.02em" }}>{e.date.day}</span>
                <span style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: e.highlight ? "rgba(255,255,255,0.8)" : "#999" }}>{e.date.month}</span>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: e.highlight ? "#fff" : "#111", margin: 0, letterSpacing: "-0.01em" }}>{e.title}</h3>
                  <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 8px", borderRadius: "100px", background: e.highlight ? "rgba(255,255,255,0.22)" : "rgba(243,106,42,0.10)", color: e.highlight ? "#fff" : "var(--primary)" }}>{e.type}</span>
                </div>
                <p style={{ fontSize: "13px", color: e.highlight ? "rgba(255,255,255,0.75)" : "#888", margin: 0 }}>{e.location}</p>
              </div>

              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ flexShrink: 0, color: e.highlight ? "rgba(255,255,255,0.6)" : "#ccc" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
