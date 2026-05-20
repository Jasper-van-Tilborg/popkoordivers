"use client";

import Reveal from "@/components/Reveal";

export default function JoinUs() {
  return (
    <section id="meezingen" style={{ position: "relative", background: "#FFFFFF", padding: "100px 24px 140px", overflow: "hidden" }}>
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 100% 70% at 50% 50%, rgba(243,106,42,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>

        <Reveal style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(243,106,42,0.09)", border: "1px solid rgba(243,106,42,0.18)", borderRadius: "100px", padding: "4px 14px", marginBottom: "16px" }}>
            <span style={{ fontSize: "10px", color: "var(--primary)", fontWeight: 700, letterSpacing: "0.08em" }}>MEEDOEN</span>
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.15, color: "#111", margin: 0 }}>
            Jij hoort erbij
          </h2>
        </Reveal>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}
          className="joinus-grid"
        >
          {/* Word lid */}
          <Reveal delay={0}>
            <div
              style={{
                background: "var(--primary)",
                borderRadius: "24px",
                padding: "48px 40px",
                height: "100%",
                boxShadow: "0 8px 40px rgba(243,106,42,0.25)",
              }}
            >
              <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", marginBottom: "24px" }}>
                🎤
              </div>
              <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.65)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Word lid</p>
              <h3 style={{ fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 800, color: "#FFFFFF", margin: "0 0 16px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                Kom meezingen
              </h3>
              <p style={{ fontSize: "15px", lineHeight: 1.7, color: "rgba(255,255,255,0.82)", margin: "0 0 28px" }}>
                Dinsdagavond in De Schakel. Gewoon eens proefzingen — geen verplichting, geen auditie op dag één.
              </p>
              <a
                href="#contact"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#FFFFFF",
                  color: "var(--primary)",
                  fontWeight: 700,
                  fontSize: "14px",
                  padding: "12px 24px",
                  borderRadius: "35px",
                  textDecoration: "none",
                  transition: "opacity 0.15s, transform 0.12s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Meer info →
              </a>
            </div>
          </Reveal>

          {/* Boek ons */}
          <Reveal delay={120}>
            <div
              style={{
                background: "#FFFFFF",
                border: "1.5px solid rgba(0,0,0,0.09)",
                borderRadius: "24px",
                padding: "48px 40px",
                height: "100%",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(243,106,42,0.10)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", marginBottom: "24px" }}>
                📅
              </div>
              <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 700, color: "var(--primary)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Boek ons</p>
              <h3 style={{ fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 800, color: "#111", margin: "0 0 16px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                Boek ons optreden
              </h3>
              <p style={{ fontSize: "15px", lineHeight: 1.7, color: "#666", margin: "0 0 28px" }}>
                Voor feesten, jubilea, festivals of een intieme setting. Wij zingen. Vraag een vrijblijvende offerte aan.
              </p>
              <a
                href="#contact"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#111",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "14px",
                  padding: "12px 24px",
                  borderRadius: "35px",
                  textDecoration: "none",
                  transition: "background 0.15s, transform 0.12s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#111"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Aanvraag doen →
              </a>
            </div>
          </Reveal>
        </div>

      </div>

      {/* Wave into warm */}
      <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "80px" }}>
          <path d="M0,80 L0,48 Q360,12 720,44 Q1080,72 1440,25 L1440,80 Z" fill="#FFF8F4" />
        </svg>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .joinus-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </section>
  );
}
