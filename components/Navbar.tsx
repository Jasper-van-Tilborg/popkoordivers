"use client";

import { useState, useEffect } from "react";

const links = [
  { label: "Home", href: "/" },
  { label: "Over ons", href: "/over-ons" },
  { label: "Agenda", href: "/agenda" },
  { label: "Nieuws", href: "/nieuws" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 50,
        transition: "all 0.25s ease",
        background: scrolled ? "rgba(255,255,255,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(0,0,0,0.07)" : "none",
        padding: scrolled ? "10px 24px" : "16px 24px",
      }}
    >
      <nav style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
        <a
          href="/"
          style={{ textDecoration: "none", flexShrink: 0, transition: "opacity 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <img
            src="/logo_popkoor_divers.svg"
            alt=""
            style={{
              height: scrolled ? "38px" : "44px",
              width: "auto",
              display: "block",
              transition: "height 0.25s ease",
            }}
          />
        </a>

        <ul style={{ display: "flex", gap: "28px", listStyle: "none", margin: 0, padding: 0, alignItems: "center" }} className="hidden md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                style={{ fontSize: "14px", fontWeight: 500, color: scrolled ? "#444" : "rgba(255,255,255,0.85)", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = scrolled ? "var(--primary)" : "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = scrolled ? "#444" : "rgba(255,255,255,0.85)")}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="/contact#meezingen"
          className="hidden md:inline-flex"
          style={{ background: scrolled ? "#111111" : "rgba(255,255,255,0.15)", border: scrolled ? "none" : "1.5px solid rgba(255,255,255,0.5)", color: "#FFFFFF", fontSize: "13px", fontWeight: 600, padding: "9px 22px", borderRadius: "35px", textDecoration: "none", transition: "background 0.2s, transform 0.12s", flexShrink: 0 }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = scrolled ? "#111111" : "rgba(255,255,255,0.15)"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          Kom meezingen →
        </a>

        <button className="md:hidden" style={{ background: "none", border: "none", cursor: "pointer", color: scrolled ? "#111" : "#fff", padding: "4px" }} onClick={() => setOpen(!open)} aria-label={open ? "Sluit menu" : "Open menu"}>
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            {open ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div style={{ background: "rgba(255,255,255,0.98)", backdropFilter: "blur(14px)", borderTop: "1px solid rgba(0,0,0,0.07)", padding: "8px 24px 20px", display: "flex", flexDirection: "column", gap: "0" }}>
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} style={{ fontSize: "15px", fontWeight: 500, color: "#333", textDecoration: "none", padding: "10px 0", display: "block", minHeight: "44px", lineHeight: "24px" }}>{l.label}</a>
          ))}
          <a href="/contact#meezingen" onClick={() => setOpen(false)} style={{ marginTop: "8px", background: "#111", color: "#fff", fontSize: "14px", fontWeight: 600, padding: "13px 20px", borderRadius: "35px", textDecoration: "none", textAlign: "center", minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            Kom meezingen →
          </a>
        </div>
      )}
    </header>
  );
}
