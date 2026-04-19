"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

const values = [
  { icon: "🎵", title: "Muziek voor iedereen", description: "Geen nootjes lezen nodig. We leren alle nummers op gehoor en via begeleiding. Iedereen kan meedoen." },
  { icon: "🌟", title: "Professionele begeleiding", description: "Onder ervaren muzikale leiding brengen we het beste in onze leden naar boven — stap voor stap." },
  { icon: "🎭", title: "Op het podium", description: "Van intieme optredens tot grote shows — we staan regelmatig voor een publiek en genieten ervan." },
  { icon: "💛", title: "Inclusief & warm", description: "Oud en jong, man en vrouw, beginner en gevorderd — iedereen is welkom in ons koor." },
  { icon: "🎶", title: "Gevarieerd repertoire", description: "Pop, rock, soul, gospel — we kiezen nummers die mensen kennen en die energie geven." },
  { icon: "🏆", title: "Jaarlijkse show", description: "Elk jaar werken we toe naar onze grote koorshow. Een avond om nooit te vergeten." },
];

export default function WhatWeDo() {
  const sectionRef = useScrollReveal();

  return (
    <section
      id="wat-we-doen"
      style={{ position: "relative", padding: "100px 24px", overflow: "hidden", background: "#FFFFFF" }}
    >
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 100% 70% at 50% 50%, rgba(243,106,42,0.09) 0%, rgba(255,255,255,0) 70%)", pointerEvents: "none" }} />

      <div ref={sectionRef} style={{ maxWidth: "940px", margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div className="reveal" style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(243,106,42,0.09)", border: "1px solid rgba(243,106,42,0.18)", borderRadius: "100px", padding: "4px 14px", marginBottom: "20px" }}>
            <span style={{ fontSize: "10px", color: "var(--primary)", fontWeight: 700, letterSpacing: "0.08em" }}>WAT WE DOEN</span>
          </div>
          <h2 style={{ fontSize: "clamp(30px, 4.5vw, 48px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.15, color: "#111", margin: "0 0 16px" }}>
            Alles wat het koor zo bijzonder maakt
          </h2>
          <p style={{ fontSize: "17px", lineHeight: 1.7, color: "#555", maxWidth: "480px", margin: "0 auto" }}>
            Bij Popkoordivers draait het niet alleen om noten zingen — het gaat om mensen, beleving en muziek die ertoe doet.
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {values.map((v, i) => (
            <div
              key={v.title}
              className="reveal"
              style={{
                animationDelay: `${i * 80}ms`,
                background: "#FFFFFF",
                backgroundImage: [
                  "radial-gradient(circle, rgba(243,106,42,0.18) 1.5px, transparent 1.5px)",
                  "linear-gradient(to bottom, transparent 40%, #ffffff 100%)",
                ].join(", "),
                backgroundSize: "11px 11px, 100% 100%",
                border: "1px solid rgba(128,128,128,0.14)",
                borderRadius: "16px",
                padding: "28px 24px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
                transition: "box-shadow 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.09)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.03)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(243,106,42,0.10)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "16px" }} aria-hidden="true">
                {v.icon}
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111", margin: "0 0 8px", letterSpacing: "-0.01em" }}>{v.title}</h3>
              <p style={{ fontSize: "14px", lineHeight: 1.65, color: "#666", margin: 0 }}>{v.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
