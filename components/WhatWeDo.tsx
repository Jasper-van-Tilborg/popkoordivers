"use client";

import Reveal from "@/components/Reveal";

const media = [
  {
    gradient: "linear-gradient(135deg, rgba(220,38,38,0.12) 0%, rgba(243,106,42,0.06) 100%)",
    label: "YouTube",
    title: "Jubileum 15 jaar",
    sub: "Optreden VÓLkoren",
  },
  {
    gradient: "linear-gradient(135deg, rgba(243,106,42,0.2) 0%, #FDE8D8 100%)",
    label: "Foto's",
    title: "Najaarsconcert 2025",
    sub: "De Schakel, Gilze",
  },
  {
    gradient: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(243,106,42,0.06) 100%)",
    label: "Backstage",
    title: "Repetitie",
    sub: "Achter de schermen",
  },
];

export default function WhatWeDo() {
  return (
    <section id="sfeer" className="sfeer-section" style={{ position: "relative", padding: "100px 24px 140px", overflow: "hidden", background: "#FFF8F4" }}>
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 100% 70% at 50% 50%, rgba(243,106,42,0.07) 0%, rgba(255,255,255,0) 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Header row */}
        <Reveal style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "48px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.15, color: "#111", margin: 0 }}>
              Zo klinkt Divers
            </h2>
          </div>
          <a
            href="/media"
            style={{ fontSize: "14px", fontWeight: 600, color: "var(--primary)", textDecoration: "none", paddingBottom: "4px", borderBottom: "2px solid rgba(243,106,42,0.25)", transition: "border-color 0.15s", whiteSpace: "nowrap" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(243,106,42,0.25)")}
          >
            Naar foto&apos;s &amp; video&apos;s →
          </a>
        </Reveal>

        {/* Media grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }} className="sfeer-grid">
          {media.map((item, i) => (
            <Reveal key={item.title} delay={i * 100}>
              <div
                style={{ borderRadius: "20px", overflow: "hidden", position: "relative", aspectRatio: "4/3", cursor: "pointer", background: item.gradient }}
                className="card-hover"
              >
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }} />

                {/* Play/icon badge */}
                <div style={{ position: "absolute", top: "16px", left: "16px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      background: "rgba(255,255,255,0.92)",
                      borderRadius: "100px",
                      padding: "4px 12px",
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "#111",
                    }}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Bottom info */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px" }}>
                  <p style={{ margin: "0 0 2px", fontSize: "15px", fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>{item.title}</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.65)" }}>{item.sub}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>

      {/* Wave into dark footer */}
      <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "80px" }}>
          <path d="M0,80 L0,55 Q360,20 720,50 Q1080,76 1440,35 L1440,80 Z" fill="#111111" />
        </svg>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .sfeer-section {
            padding: 60px 16px 100px !important;
          }
          .sfeer-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 641px) and (max-width: 900px) {
          .sfeer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
