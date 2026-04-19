"use client";

export default function Footer() {
  return (
    <footer style={{ background: "#111111", padding: "48px 24px" }}>
      <div
        style={{
          maxWidth: "940px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "28px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <p style={{ fontSize: "17px", fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
            Popkoor<span style={{ color: "var(--primary)" }}>divers</span>
          </p>
          <nav style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
            {[
              { label: "Over ons", href: "#over-ons" },
              { label: "Wat we doen", href: "#wat-we-doen" },
              { label: "Optredens", href: "#optredens" },
              { label: "Meedoen", href: "#meedoen" },
              { label: "Contact", href: "#contact" },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                style={{ fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
        <div style={{ height: "1px", background: "rgba(255,255,255,0.08)" }} />
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", margin: 0 }}>
          © {new Date().getFullYear()} Popkoordivers — Gilze, Noord-Brabant
        </p>
      </div>
    </footer>
  );
}
