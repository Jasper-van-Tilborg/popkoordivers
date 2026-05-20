"use client";

import Reveal from "@/components/Reveal";

const events = [
  {
    month: "nov",
    year: "2026",
    label: "Eerstvolgend",
    labelColor: "var(--primary)",
    venue: "De Schakel, Gilze",
    title: "Najaarsconcert",
    description: "Spetterend optreden met gastoptredens",
    time: "20:00",
    cta: "Kaartjes →",
    ctaHref: "#",
  },
  {
    month: "dec",
    year: "2026",
    label: "Op uitnodiging",
    labelColor: "#6366f1",
    venue: "Zonnebloem jubileum",
    title: "Jubileum Zonnebloem",
    description: "Uitgenodigd gastoptreden",
    time: "14:00",
    cta: "Details →",
    ctaHref: "#",
  },
  {
    month: "jun",
    year: "2027",
    label: "Festival",
    labelColor: "#0ea5e9",
    venue: "VÓLkoren, Middelburg",
    title: "VÓLkoren Middelburg",
    description: "Grootste korenfestival van Zeeland",
    time: "hele dag",
    cta: "Details →",
    ctaHref: "#",
  },
];

export default function Performances() {
  return (
    <section id="agenda" style={{ position: "relative", padding: "100px 24px 140px", overflow: "hidden", background: "#FFF8F4" }}>
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 120% 80% at 50% 0%, rgba(243,106,42,0.07) 0%, transparent 60%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Header row */}
        <Reveal style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "48px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(243,106,42,0.09)", border: "1px solid rgba(243,106,42,0.18)", borderRadius: "100px", padding: "4px 14px", marginBottom: "16px" }}>
              <span style={{ fontSize: "10px", color: "var(--primary)", fontWeight: 700, letterSpacing: "0.08em" }}>AGENDA</span>
            </div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.15, color: "#111", margin: 0 }}>
              Aankomende optredens
            </h2>
          </div>
          <a
            href="/agenda"
            style={{ fontSize: "14px", fontWeight: 600, color: "var(--primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", paddingBottom: "4px", borderBottom: "2px solid rgba(243,106,42,0.25)", transition: "border-color 0.15s", whiteSpace: "nowrap" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(243,106,42,0.25)")}
          >
            Alle data op Agenda →
          </a>
        </Reveal>

        {/* Timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {events.map((event, i) => (
            <Reveal key={event.venue} delay={i * 100}>
              <div
                className="event-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr auto",
                  gap: "24px",
                  alignItems: "center",
                  background: "#FFFFFF",
                  borderRadius: "16px",
                  padding: "20px 24px",
                  border: "1px solid rgba(0,0,0,0.07)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                {/* Month */}
                <div style={{ textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "var(--primary)", lineHeight: 1, letterSpacing: "-0.5px" }}>
                    {event.month}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#aaa", fontWeight: 500 }}>{event.year}</p>
                </div>

                {/* Details */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        color: "#fff",
                        background: event.labelColor,
                        padding: "3px 10px",
                        borderRadius: "100px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {event.label}
                    </span>
                    <span style={{ fontSize: "13px", color: "#888", fontWeight: 500 }}>{event.venue}</span>
                  </div>
                  <p style={{ margin: "0 0 4px", fontSize: "17px", fontWeight: 700, color: "#111", letterSpacing: "-0.02em", lineHeight: 1.3 }}>
                    {event.title}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "13px", color: "#666" }}>{event.description}</span>
                    <span style={{ fontSize: "12px", color: "#aaa", display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}>
                      <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
                      </svg>
                      {event.time}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <a
                  href={event.ctaHref}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(243,106,42,0.08)",
                    color: "var(--primary)",
                    fontSize: "13px",
                    fontWeight: 700,
                    padding: "10px 18px",
                    borderRadius: "35px",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    border: "1.5px solid rgba(243,106,42,0.2)",
                    transition: "background 0.15s, transform 0.12s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(243,106,42,0.08)"; e.currentTarget.style.color = "var(--primary)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  {event.cta}
                </a>
              </div>
            </Reveal>
          ))}
        </div>

      </div>

      {/* Wave into white */}
      <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "80px" }}>
          <path d="M0,80 L0,30 Q360,68 720,35 Q1080,8 1440,52 L1440,80 Z" fill="#FFFFFF" />
        </svg>
      </div>
    </section>
  );
}
