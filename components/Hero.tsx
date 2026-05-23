"use client";

import Reveal from "@/components/Reveal";

export default function Hero() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "100svh",
        background: "var(--primary)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Texture overlays */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 30% 20%, rgba(255,255,255,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(0,0,0,0.10) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* Main content area — padded wrapper matches the 24px section padding of all other sections */}
      <div style={{ flex: 1, padding: "0 24px", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          flex: 1,
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
          padding: "120px 0 60px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "48px",
          alignItems: "center",
          position: "relative",
          zIndex: 10,
        }}
        className="hero-grid"
      >
        {/* Left: text */}
        <Reveal delay={0}><div>
          {/* Eyebrow */}
          <p style={{ margin: "0 0 20px", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.75)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Popkoor uit Gilze · sinds 2008
          </p>

          {/* Headline */}
          <h1
            style={{
              fontSize: "clamp(36px, 5vw, 60px)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-2px",
              color: "#FFFFFF",
              margin: "0 0 20px",
            }}
          >
            Passie voor popmuziek brengt mensen bij elkaar.
          </h1>

          {/* Subheadline */}
          <p
            style={{
              fontSize: "clamp(15px, 1.6vw, 17px)",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.82)",
              margin: "0 0 36px",
              maxWidth: "460px",
            }}
          >
            Een swingend koor met mannen én vrouwen uit Gilze en omstreken. Van jaren &apos;80 tot nu — met piano, band en bijpassende choreo.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a
              href="/contact#meezingen"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#FFFFFF",
                color: "var(--primary)",
                fontWeight: 700,
                fontSize: "15px",
                padding: "13px 28px",
                borderRadius: "35px",
                textDecoration: "none",
                transition: "opacity 0.15s, transform 0.12s",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.92"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Kom meezingen →
            </a>
            <a
              href="/contact#boeken"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "transparent",
                color: "#FFFFFF",
                fontWeight: 600,
                fontSize: "15px",
                padding: "13px 28px",
                borderRadius: "35px",
                textDecoration: "none",
                border: "1.5px solid rgba(255,255,255,0.55)",
                transition: "border-color 0.15s, transform 0.12s, background 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.90)"; e.currentTarget.style.background = "rgba(255,255,255,0.10)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.55)"; e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Boek ons optreden
            </a>
          </div>

          {/* Stats strip */}
          <div
            style={{
              marginTop: "48px",
              display: "flex",
              gap: "0",
              background: "rgba(0,0,0,0.18)",
              borderRadius: "14px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {[
              { value: "60", label: "stemmen" },
              { value: "5", label: "stemgroepen" },
              { value: "1", label: "dirigent" },
            ].map((s, i) => (
              <div
                key={s.label}
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  textAlign: "center",
                  borderRight: i < 2 ? "1px solid rgba(255,255,255,0.12)" : "none",
                }}
              >
                <p style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#FFFFFF", lineHeight: 1 }}>{s.value}</p>
                <p style={{ margin: "3px 0 0", fontSize: "11px", color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div></Reveal>

        {/* Right: image + info cards */}
        <Reveal delay={200}><div style={{ position: "relative" }}>
          {/* Sfeerfoto placeholder */}
          <div
            style={{
              width: "100%",
              aspectRatio: "4/5",
              borderRadius: "24px",
              background: "linear-gradient(160deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 50%, rgba(0,0,0,0.12) 100%)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          />

        </div></Reveal>
      </div>
      </div>

      {/* Wave into white — outside padded wrapper so it stays full-width */}
      <div aria-hidden="true" style={{ position: "relative", lineHeight: 0 }}>
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "80px" }}>
          <path d="M0,80 L0,40 Q360,0 720,32 Q1080,64 1440,20 L1440,80 Z" fill="#FFFFFF" />
        </svg>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            padding-top: 100px !important;
          }
          .hero-grid > div:last-child {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
