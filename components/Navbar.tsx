"use client";

import { useState, useEffect } from "react";

const links = [
  { label: "Over ons", href: "#over-ons" },
  { label: "Wat we doen", href: "#wat-we-doen" },
  { label: "Optredens", href: "#optredens" },
  { label: "Meedoen", href: "#meedoen" },
  { label: "Contact", href: "#contact" },
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
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: "all 0.25s ease",
        background: scrolled ? "rgba(255,255,255,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(0,0,0,0.07)" : "none",
        padding: scrolled ? "10px 0" : "16px 0",
      }}
    >
      <nav
        style={{
          maxWidth: "940px",
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        {/* Logo */}
        <a
          href="#"
          style={{
            fontSize: "18px",
            fontWeight: 800,
            color: "#111111",
            textDecoration: "none",
            letterSpacing: "-0.02em",
            flexShrink: 0,
          }}
        >
          Popkoor<span style={{ color: "var(--primary)" }}>divers</span>
        </a>

        {/* Desktop links */}
        <ul
          style={{
            display: "flex",
            gap: "28px",
            listStyle: "none",
            margin: 0,
            padding: 0,
            alignItems: "center",
          }}
          className="hidden md:flex"
        >
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#444",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a
          href="#meedoen"
          className="hidden md:inline-flex"
          style={{
            background: "#111111",
            color: "#FFFFFF",
            fontSize: "13px",
            fontWeight: 600,
            padding: "9px 22px",
            borderRadius: "35px",
            textDecoration: "none",
            transition: "background 0.2s, transform 0.12s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--primary)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#111111";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Word lid
        </a>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          style={{ background: "none", border: "none", cursor: "pointer", color: "#111", padding: "4px" }}
          onClick={() => setOpen(!open)}
          aria-label={open ? "Sluit menu" : "Open menu"}
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div
          style={{
            background: "rgba(255,255,255,0.98)",
            backdropFilter: "blur(14px)",
            borderTop: "1px solid rgba(0,0,0,0.07)",
            padding: "16px 24px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{ fontSize: "15px", fontWeight: 500, color: "#333", textDecoration: "none" }}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#meedoen"
            onClick={() => setOpen(false)}
            style={{
              marginTop: "4px",
              background: "#111",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              padding: "11px 20px",
              borderRadius: "35px",
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            Word lid
          </a>
        </div>
      )}
    </header>
  );
}
