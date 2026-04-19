"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

const steps = [
  { number: "01", title: "Neem contact op", description: "Stuur ons een berichtje of bel ons op. We vertellen je graag alles over het koor." },
  { number: "02", title: "Kom een keer kijken", description: "Kom vrijblijvend langs op onze wekelijkse repetitie. Gewoon ervaren hoe het is." },
  { number: "03", title: "Doe mee!", description: "Bevalt het? Dan ben je van harte welkom als nieuw lid van Popkoordivers." },
];

export default function JoinUs() {
  const sectionRef = useScrollReveal();

  return (
    <section id="meedoen" style={{ background: "#FFFFFF", padding: "100px 24px" }}>
      <div ref={sectionRef} style={{ maxWidth: "940px", margin: "0 auto" }}>

        {/* Header */}
        <div className="reveal" style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(243,106,42,0.09)", border: "1px solid rgba(243,106,42,0.18)", borderRadius: "100px", padding: "4px 14px", marginBottom: "20px" }}>
            <span style={{ fontSize: "10px", color: "var(--primary)", fontWeight: 700, letterSpacing: "0.08em" }}>MEEDOEN</span>
          </div>
          <h2 style={{ fontSize: "clamp(30px, 4.5vw, 48px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.15, color: "#111", margin: "0 0 16px" }}>
            Jij hoort erbij
          </h2>
          <p style={{ fontSize: "17px", lineHeight: 1.7, color: "#555", maxWidth: "480px", margin: "0 auto" }}>
            Geen ervaring nodig, geen notenkennis vereist. Alleen jouw stem en de wil om samen iets moois te maken.
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "48px" }}>
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="reveal"
              style={{
                animationDelay: `${i * 120}ms`,
                background: "#FFFFFF",
                backgroundImage: [
                  "radial-gradient(circle, rgba(243,106,42,0.18) 1.5px, transparent 1.5px)",
                  "linear-gradient(to bottom, transparent 40%, #ffffff 100%)",
                ].join(", "),
                backgroundSize: "11px 11px, 100% 100%",
                border: "1px solid rgba(128,128,128,0.14)",
                borderRadius: "16px",
                padding: "32px 28px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--primary)", letterSpacing: "0.06em", marginBottom: "16px", opacity: 0.7 }}>
                {step.number}
              </div>
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#111", margin: "0 0 10px", letterSpacing: "-0.01em" }}>{step.title}</h3>
              <p style={{ fontSize: "14px", lineHeight: 1.65, color: "#666", margin: 0 }}>{step.description}</p>
            </div>
          ))}
        </div>

        {/* CTA banner */}
        <div
          className="reveal"
          style={{
            animationDelay: "150ms",
            background: "var(--primary)",
            borderRadius: "20px",
            padding: "48px 40px",
            textAlign: "center",
            boxShadow: "0 8px 40px rgba(243,106,42,0.28)",
          }}
        >
          <h3 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, color: "#FFFFFF", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
            Klaar om de eerste stap te zetten?
          </h3>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.8)", margin: "0 0 28px" }}>
            Kom een keer vrijblijvend kijken. We zijn blij je te ontmoeten.
          </p>
          <a
            href="#contact"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#FFFFFF", color: "var(--primary)", fontWeight: 700, fontSize: "15px", padding: "13px 28px", borderRadius: "35px", textDecoration: "none", transition: "transform 0.12s, opacity 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.opacity = "0.92"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.opacity = "1"; }}
          >
            Meld je aan
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>

      </div>
    </section>
  );
}
