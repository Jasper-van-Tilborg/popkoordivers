"use client";

import Reveal from "@/components/Reveal";

const stats = [
  { value: "30+", label: "Enthousiaste leden" },
  { value: "10+", label: "Jaar actief" },
  { value: "50+", label: "Optredens" },
];

const pillars = [
  { icon: "🎵", title: "Wekelijkse repetities", description: "Elke week samenkomen om te repeteren, te lachen en nieuwe muziek in te studeren." },
  { icon: "🎤", title: "Breed repertoire", description: "Van pop en rock tot soul en gospel. Muziek die mensen raakt, gespeeld met overtuiging." },
  { icon: "🤝", title: "Echte saamhorigheid", description: "Vriendschappen bouwen, successen vieren. Het koor is een gemeenschap." },
];

export default function About() {
  return (
    <section id="over-ons" style={{ background: "#FFFFFF", padding: "100px 24px" }}>
      <div style={{ maxWidth: "940px", margin: "0 auto" }}>

        <Reveal style={{ textAlign: "center", marginBottom: "64px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(243,106,42,0.09)", border: "1px solid rgba(243,106,42,0.18)", borderRadius: "100px", padding: "4px 14px", marginBottom: "20px" }}>
            <span style={{ fontSize: "10px", color: "var(--primary)", fontWeight: 700, letterSpacing: "0.08em" }}>OVER ONS</span>
          </div>
          <h2 style={{ fontSize: "clamp(30px, 4.5vw, 48px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.15, color: "#111", margin: "0 0 16px" }}>
            Meer dan alleen een koor
          </h2>
          <p style={{ fontSize: "17px", lineHeight: 1.7, color: "#555", maxWidth: "500px", margin: "0 auto" }}>
            We zijn een divers gezelschap van mensen die wekelijks samenkomen om te zingen, te lachen en het beste uit zichzelf te halen.
          </p>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "48px" }}>
          {pillars.map((p, i) => (
            <Reveal
              key={p.title}
              delay={i * 120}
              style={{
                background: "#FFFFFF",
                backgroundImage: ["radial-gradient(circle, rgba(243,106,42,0.18) 1.5px, transparent 1.5px)", "linear-gradient(to bottom, transparent 40%, #ffffff 100%)"].join(", "),
                backgroundSize: "11px 11px, 100% 100%",
                border: "1px solid rgba(128,128,128,0.14)",
                borderRadius: "16px",
                padding: "28px 24px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(243,106,42,0.10)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "16px" }} aria-hidden="true">
                {p.icon}
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111", margin: "0 0 8px", letterSpacing: "-0.01em" }}>{p.title}</h3>
              <p style={{ fontSize: "14px", lineHeight: 1.65, color: "#666", margin: 0 }}>{p.description}</p>
            </Reveal>
          ))}
        </div>

        <Reveal
          delay={200}
          style={{
            background: "linear-gradient(135deg, rgba(243,106,42,0.08) 0%, rgba(243,106,42,0.04) 100%)",
            border: "1px solid rgba(243,106,42,0.14)",
            borderRadius: "16px",
            padding: "32px 40px",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            textAlign: "center",
            gap: "24px",
          }}
        >
          {stats.map((s, i) => (
            <div key={s.label} style={{ borderRight: i < stats.length - 1 ? "1px solid rgba(243,106,42,0.15)" : "none", padding: i > 0 ? "0 0 0 24px" : "0" }}>
              <p style={{ fontSize: "36px", fontWeight: 800, color: "var(--primary)", margin: "0 0 4px", letterSpacing: "-1.5px", lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: "13px", color: "#777", margin: 0, fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </Reveal>

      </div>
    </section>
  );
}
