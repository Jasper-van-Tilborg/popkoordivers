"use client";

import Reveal from "@/components/Reveal";

const infoCards = [
  { label: "Repetities", value: "Dinsdag · 20:00", sub: "De Schakel" },
  { label: "Dirigent", value: "Tom Mordang", sub: "sinds 2008" },
  { label: "Eerstvolgend", value: "za 7 nov", sub: "De Schakel" },
];

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
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.30)",
              borderRadius: "100px",
              padding: "5px 16px",
              marginBottom: "28px",
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(255,255,255,0.9)", display: "inline-block" }} />
            <span style={{ color: "#FFFFFF", fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em" }}>
              Popkoor uit Gilze · sinds 2008
            </span>
          </div>

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
              href="#meezingen"
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
              href="#contact"
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
              background: "rgba(0,0,0,0.20)",
              border: "1px solid rgba(255,255,255,0.15)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <img
              src="https://picsum.photos/seed/popkoor-hero/600/750"
              alt="Koor op podium"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: 0.85 }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 50%)" }} />
            <span style={{ position: "absolute", bottom: "16px", left: "16px", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: "0.05em" }}>
              sfeerfoto · koor op podium
            </span>
          </div>

          {/* Info cards — overlaid at right side */}
          <div
            style={{
              position: "absolute",
              right: "-20px",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {infoCards.map((card) => (
              <div
                key={card.label}
                style={{
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  borderRadius: "14px",
                  padding: "12px 16px",
                  minWidth: "160px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
              >
                <p style={{ margin: "0 0 2px", fontSize: "10px", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{card.label}</p>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#111", lineHeight: 1.3 }}>{card.value}</p>
                <p style={{ margin: "1px 0 0", fontSize: "11px", color: "#888", fontWeight: 500 }}>{card.sub}</p>
              </div>
            ))}
          </div>
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
