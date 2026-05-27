export default function DemoLandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "var(--font-manrope), system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: "rgba(243,106,42,0.08)",
          border: "1px solid rgba(243,106,42,0.2)",
          borderRadius: "100px",
          padding: "6px 18px",
          fontSize: "12px",
          fontWeight: 700,
          color: "var(--primary)",
          letterSpacing: "0.06em",
          textTransform: "uppercase" as const,
          marginBottom: "32px",
        }}
      >
        Demo omgeving
      </div>

      <a href="/" style={{ textDecoration: "none", marginBottom: "40px", display: "flex", justifyContent: "center" }}>
        <img src="/logo_popkoor_divers.svg" alt="Popkoor Divers" style={{ height: "52px", width: "auto" }} />
      </a>

      <h1
        style={{
          fontSize: "clamp(24px, 4vw, 32px)",
          fontWeight: 800,
          color: "#111",
          letterSpacing: "-1px",
          margin: "0 0 10px",
          textAlign: "center",
        }}
      >
        Kies een demo omgeving
      </h1>
      <p style={{ fontSize: "15px", color: "#888", margin: "0 0 48px", textAlign: "center", maxWidth: "380px", lineHeight: 1.6 }}>
        Bekijk hoe de ledenomgeving of het admin dashboard eruitziet — geen inloggen nodig.
      </p>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" as const, justifyContent: "center" }}>
        {/* Ledenomgeving */}
        <a href="/demo/leden" style={{ textDecoration: "none" }}>
          <div
            style={{
              width: "260px",
              background: "#FFFFFF",
              border: "1.5px solid rgba(243,106,42,0.25)",
              borderRadius: "20px",
              padding: "32px 28px",
              boxShadow: "0 4px 24px rgba(243,106,42,0.08)",
              transition: "box-shadow 0.15s",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                background: "rgba(243,106,42,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                marginBottom: "18px",
              }}
            >
              🎤
            </div>
            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "18px",
                fontWeight: 800,
                color: "#111",
                letterSpacing: "-0.3px",
              }}
            >
              Ledenomgeving
            </h2>
            <p style={{ margin: "0 0 22px", fontSize: "13px", color: "#888", lineHeight: 1.6 }}>
              Liedjes per stemgroep, nieuwsbrieven, smoelenboek, opnames en meer.
            </p>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                fontWeight: 700,
                color: "#fff",
                background: "var(--primary)",
                padding: "9px 18px",
                borderRadius: "35px",
                boxShadow: "0 4px 14px rgba(243,106,42,0.3)",
              }}
            >
              Demo bekijken →
            </span>
          </div>
        </a>

        {/* Admin dashboard */}
        <a href="/demo/admin" style={{ textDecoration: "none" }}>
          <div
            style={{
              width: "260px",
              background: "#FFFFFF",
              border: "1.5px solid rgba(0,0,0,0.12)",
              borderRadius: "20px",
              padding: "32px 28px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
              transition: "box-shadow 0.15s",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                background: "rgba(0,0,0,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                marginBottom: "18px",
              }}
            >
              ⚙️
            </div>
            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "18px",
                fontWeight: 800,
                color: "#111",
                letterSpacing: "-0.3px",
              }}
            >
              Admin dashboard
            </h2>
            <p style={{ margin: "0 0 22px", fontSize: "13px", color: "#888", lineHeight: 1.6 }}>
              Agenda, nieuws, media, bestanden, sponsorkliks en ledenbeheer.
            </p>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                fontWeight: 700,
                color: "#111",
                background: "rgba(0,0,0,0.06)",
                padding: "9px 18px",
                borderRadius: "35px",
                border: "1.5px solid rgba(0,0,0,0.12)",
              }}
            >
              Demo bekijken →
            </span>
          </div>
        </a>
      </div>

      <a
        href="/"
        style={{
          marginTop: "40px",
          fontSize: "13px",
          fontWeight: 600,
          color: "#aaa",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 16px",
          borderRadius: "35px",
          border: "1.5px solid rgba(0,0,0,0.10)",
          transition: "color 0.15s, border-color 0.15s",
        }}
      >
        ← Terug naar website
      </a>

      <p style={{ marginTop: "16px", fontSize: "12px", color: "#ccc", textAlign: "center" }}>
        Demo omgeving · Geen echte data · Wijzigingen worden niet opgeslagen
      </p>
    </div>
  );
}
