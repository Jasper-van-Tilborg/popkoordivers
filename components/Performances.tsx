"use client";

import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";

interface AgendaEvent {
  id: number;
  titel: string;
  datum: string;
  tijd: string | null;
  locatie: string | null;
  label: string | null;
  label_kleur: string | null;
  beschrijving: string | null;
  link: string | null;
}

interface Props {
  events: AgendaEvent[];
}

export default function Performances({ events }: Props) {
  return (
    <section id="agenda" className="perf-section" style={{ position: "relative", padding: "100px 24px 140px", overflow: "hidden", background: "#FFF8F4" }}>

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Header row */}
        <Reveal style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "48px", flexWrap: "wrap", gap: "16px" }}>
          <RevealText
            text="Aankomende optredens"
            pageDelay={500}
            style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.15, color: "#111", margin: 0 }}
          />
          <a
            href="/agenda"
            style={{ fontSize: "14px", fontWeight: 600, color: "var(--primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", paddingBottom: "4px", borderBottom: "2px solid rgba(243,106,42,0.25)", transition: "border-color 0.15s", whiteSpace: "nowrap" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(243,106,42,0.25)")}
          >
            Alle data op Agenda →
          </a>
        </Reveal>

        {/* Events */}
        {events.length === 0 ? (
          <Reveal>
            <p style={{ fontSize: "15px", color: "#aaa", textAlign: "center", padding: "40px 0" }}>
              Nog geen optredens gepland.
            </p>
          </Reveal>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {events.map((event, i) => (
              <Reveal key={event.id} delay={i * 100}>
                <div
                  className="perf-card"
                  style={{
                    background: "#FFFFFF",
                    borderRadius: "16px",
                    border: "1px solid rgba(0,0,0,0.07)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    padding: "24px 32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "24px",
                  }}
                >
                  {/* Left: title + meta */}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: "0 0 10px", fontSize: "19px", fontWeight: 800, color: "#111", letterSpacing: "-0.03em", lineHeight: 1.25 }}>
                      {event.titel}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                      {event.locatie && (
                        <span style={{ fontSize: "13px", color: "#777", fontWeight: 500 }}>{event.locatie}</span>
                      )}
                      {event.locatie && event.tijd && (
                        <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#ccc", flexShrink: 0, display: "inline-block" }} />
                      )}
                      {event.tijd && (
                        <span style={{ fontSize: "13px", color: "#aaa", fontWeight: 500 }}>{event.tijd}</span>
                      )}
                    </div>
                  </div>

                  {/* Right: date */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "var(--primary)", letterSpacing: "-0.5px", lineHeight: 1 }}>
                      {event.datum}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

      </div>

      <style>{`
        @media (max-width: 640px) {
          .perf-section { padding: 60px 16px 100px !important; }
          .perf-card { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; padding: 20px !important; }
        }
      `}</style>

      {/* Wave into white */}
      <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "80px" }}>
          <path d="M0,80 L0,30 Q360,68 720,35 Q1080,8 1440,52 L1440,80 Z" fill="#FFFFFF" />
        </svg>
      </div>
    </section>
  );
}
