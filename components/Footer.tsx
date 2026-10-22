"use client";

import Link from "next/link";
import { IconFacebook, IconInstagram, IconYoutube } from "@/components/icons";

const socials = [
  { label: "Facebook",  href: "https://www.facebook.com/p/Popkoor-Divers-100066853672465/?locale=nl_NL", icon: <IconFacebook size={17} /> },
  { label: "Instagram", href: "https://www.instagram.com/popkoordivers/", icon: <IconInstagram size={17} /> },
  { label: "YouTube",   href: "https://www.youtube.com/@popkoordivers", icon: <IconYoutube size={17} /> },
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo_popkoor_divers.svg"
              alt="Popkoor Divers"
              style={{ height: "40px", width: "auto", display: "block", marginBottom: "16px", opacity: 0.9 }}
            />
            <p style={{ fontSize: "13px", lineHeight: 1.7, color: "rgba(255,255,255,0.45)", margin: 0, maxWidth: "260px" }}>
              Een swingend popkoor uit Gilze met 60 enthousiaste stemmen, begeleid door piano.
            </p>
          </div>

          {/* Repetities */}
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px" }}>Repetities</p>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", margin: "0 0 4px", fontWeight: 500 }}>Dinsdag · 19:30 – 21:30 uur</p>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", margin: "0 0 4px" }}>CCGR De Schakel</p>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", margin: 0 }}>Kerkstraat 104, Gilze</p>
          </div>

          {/* Contact */}
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px" }}>Contact</p>
            <a
              href="mailto:popkoordivers@gmail.com"
              style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.7)", textDecoration: "none", margin: "0 0 8px", transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            >
              popkoordivers@gmail.com
            </a>
            <Link
              href="/contact#boeken"
              style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.45)", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
            >
              Uitnodigen voor een optreden
            </Link>
          </div>

          {/* Volg ons */}
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px" }}>Volg ons</p>
            <div style={{ display: "flex", gap: "10px" }}>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "38px", height: "38px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)", transition: "background 0.15s, color 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
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
            ].map((l) =>
              l.href.startsWith("http") ? (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.label}
                  href={l.href}
                  style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
                >
                  {l.label}
                </Link>
              )
            )}
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
