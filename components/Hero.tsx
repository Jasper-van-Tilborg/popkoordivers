"use client";

export default function Hero() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "var(--primary)",
        paddingTop: "80px",
      }}
    >
      {/* Subtle texture overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 50% at 20% 20%, rgba(255,255,255,0.10) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(0,0,0,0.08) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "720px",
          margin: "0 auto",
          padding: "60px 24px 64px",
          textAlign: "center",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(255,255,255,0.18)",
            border: "1px solid rgba(255,255,255,0.30)",
            borderRadius: "100px",
            padding: "5px 14px",
            marginBottom: "28px",
          }}
        >
          <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.9)" }}>●</span>
          <span
            style={{
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            Popkoor uit Gilze, Noord-Brabant
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: "clamp(40px, 6.5vw, 72px)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-2px",
            color: "#FFFFFF",
            margin: "0 0 20px",
          }}
        >
          Zingen met passie,
          <br />samen met plezier
        </h1>

        {/* Subheadline */}
        <p
          style={{
            fontSize: "clamp(16px, 2vw, 18px)",
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.85)",
            maxWidth: "520px",
            margin: "0 auto 36px",
          }}
        >
          Popkoordivers is een bruisend popkoor waar muziek, plezier en
          saamhorigheid samenkomen — week na week, in Gilze.
        </p>

        {/* CTA buttons */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href="#over-ons"
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
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.92";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Leer ons kennen
          </a>
          <a
            href="#meedoen"
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
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.90)";
              e.currentTarget.style.background = "rgba(255,255,255,0.10)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.55)";
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Doe mee
          </a>
        </div>
      </div>

      {/* Curved wave SVG — transitions hero into white sections */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          lineHeight: 0,
        }}
      >
        <svg
          viewBox="0 0 1440 80"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ display: "block", width: "100%", height: "80px" }}
        >
          <path
            d="M0,80 L0,40 Q360,0 720,32 Q1080,64 1440,20 L1440,80 Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>
    </section>
  );
}
