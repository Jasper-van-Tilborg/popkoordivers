"use client";

const socials = [
  { label: "Facebook",  href: "https://www.facebook.com/p/Popkoor-Divers-100066853672465/?locale=nl_NL" },
  { label: "Instagram", href: "https://www.instagram.com/popkoordivers/" },
  { label: "YouTube",   href: "https://www.youtube.com/@popkoordivers" },
];

export default function Footer() {
  return (
    <footer className="footer-outer" style={{ background: "#111111", padding: "64px 24px 32px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Top grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "48px",
            paddingBottom: "48px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
          className="footer-grid"
        >
          {/* Brand */}
          <div>
            <p style={{ fontSize: "18px", fontWeight: 800, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              Popkoor <span style={{ color: "var(--primary)" }}>Divers</span>
            </p>
            <p style={{ fontSize: "13px", lineHeight: 1.7, color: "rgba(255,255,255,0.45)", margin: "0 0 0", maxWidth: "260px" }}>
              Een swingend popkoor uit Gilze met 60 stemmen, piano, band en bijpassende choreo.
            </p>
          </div>

          {/* Repetities */}
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px" }}>Repetities</p>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", margin: "0 0 4px", fontWeight: 500 }}>Dinsdag · 20:00</p>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", margin: "0 0 4px" }}>De Schakel</p>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", margin: 0 }}>Gilze</p>
          </div>

          {/* Contact */}
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px" }}>Contact</p>
            <a
              href="mailto:info@popkoordivers.nl"
              style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.7)", textDecoration: "none", margin: "0 0 8px", transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            >
              info@popkoordivers.nl
            </a>
            <a
              href="/contact#boeken"
              style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.45)", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
            >
              Boekingen via formulier
            </a>
          </div>

          {/* Volg ons */}
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px" }}>Volg ons</p>
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.7)", textDecoration: "none", margin: "0 0 8px", transition: "color 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            paddingTop: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", margin: 0 }}>
            © {new Date().getFullYear()} Popkoor Divers
          </p>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {[
              { label: "SponsorKliks", href: "https://www.sponsorkliks.com/products/shops.php?club=13468&cn=nl&ln=nl" },
              { label: "Log in", href: "/leden" },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-outer {
            padding: 48px 16px 24px !important;
          }
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 32px !important;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
