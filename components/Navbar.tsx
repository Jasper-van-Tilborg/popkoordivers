"use client";

import { useState, useEffect } from "react";

const links = [
  { label: "Home",     href: "/" },
  { label: "Over ons", href: "/over-ons" },
  { label: "Agenda",   href: "/agenda" },
  { label: "Nieuws",   href: "/nieuws" },
  { label: "Media",    href: "/media" },
  { label: "Contact",  href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Sluit menu bij resize naar desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Scroll-lock op body als menu open is
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 100,
          transition: "background 0.25s ease, padding 0.25s ease, border-color 0.25s ease",
          background: scrolled || open ? "rgba(255,255,255,0.97)" : "transparent",
          backdropFilter: scrolled || open ? "blur(16px)" : "none",
          WebkitBackdropFilter: scrolled || open ? "blur(16px)" : "none",
          borderBottom: scrolled || open ? "1px solid rgba(0,0,0,0.07)" : "1px solid transparent",
          padding: scrolled ? "10px 24px" : "16px 24px",
        }}
      >
        <nav style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>

          {/* Logo */}
          <a href="/" style={{ textDecoration: "none", flexShrink: 0, transition: "opacity 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <img
              src="/logo_popkoor_divers.svg"
              alt="Popkoor Divers"
              style={{ height: scrolled ? "38px" : "44px", width: "auto", display: "block", transition: "height 0.25s ease" }}
            />
          </a>

          {/* Desktop links */}
          <ul className="nav-desktop" style={{ display: "flex", gap: "28px", listStyle: "none", margin: 0, padding: 0, alignItems: "center" }}>
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

          {/* Desktop CTA */}
          <a
            href="/contact#meezingen"
            className="nav-cta"
            style={{ background: scrolled ? "#111" : "rgba(255,255,255,0.15)", border: scrolled ? "none" : "1.5px solid rgba(255,255,255,0.5)", color: "#fff", fontSize: "13px", fontWeight: 600, padding: "9px 22px", borderRadius: "35px", textDecoration: "none", transition: "background 0.2s, transform 0.12s", flexShrink: 0, alignItems: "center", gap: "6px" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = scrolled ? "#111" : "rgba(255,255,255,0.15)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Kom meezingen →
          </a>

          {/* Hamburger */}
          <button
            className="nav-hamburger"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Sluit menu" : "Open menu"}
            aria-expanded={open}
            style={{ background: "none", border: "none", cursor: "pointer", color: scrolled || open ? "#111" : "#fff", padding: "6px", display: "none", flexShrink: 0, transition: "color 0.2s" }}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ display: "block", transition: "transform 0.2s" }}>
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>

        </nav>
      </header>

      {/* Mobile menu — buiten de header zodat hij de volle hoogte kan pakken */}
      <div
        className={`mobile-menu${open ? " mobile-menu--open" : ""}`}
        aria-hidden={!open}
      >
        <nav style={{ padding: "24px 24px 40px", display: "flex", flexDirection: "column" }}>
          {links.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="mobile-menu__link"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {l.label}
            </a>
          ))}

          <a
            href="/contact#meezingen"
            onClick={() => setOpen(false)}
            className="mobile-menu__link"
            style={{ animationDelay: `${links.length * 40}ms`, marginTop: "16px", background: "var(--primary)", color: "#fff", borderRadius: "35px", textAlign: "center", fontWeight: 700, justifyContent: "center" }}
          >
            Kom meezingen →
          </a>
        </nav>
      </div>

      <style>{`
        /* Desktop: links en CTA zichtbaar, hamburger verborgen */
        .nav-desktop  { display: flex; }
        .nav-cta      { display: inline-flex; }
        .nav-hamburger { display: none !important; }

        /* Mobile: hamburger zichtbaar, desktop nav verborgen */
        @media (max-width: 767px) {
          .nav-desktop   { display: none !important; }
          .nav-cta       { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }

        /* ── Mobile menu ── */
        .mobile-menu {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: 99;
          background: rgba(255,255,255,0.98);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          padding-top: 76px;
          transform: translateY(-100%);
          opacity: 0;
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease;
          pointer-events: none;
          display: none;
        }
        @media (max-width: 767px) {
          .mobile-menu { display: block; }
        }
        .mobile-menu--open {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }

        /* Link items — staggered fade-in wanneer menu opent */
        @keyframes menu-link-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mobile-menu__link {
          display: flex;
          align-items: center;
          padding: 14px 0;
          font-size: 20px;
          font-weight: 600;
          color: #111;
          text-decoration: none;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          transition: color 0.15s;
          opacity: 0;
        }
        .mobile-menu--open .mobile-menu__link {
          animation: menu-link-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .mobile-menu__link:last-child {
          border-bottom: none;
          padding: 14px 16px;
        }
        .mobile-menu__link:last-child::after { display: none; }
        .mobile-menu__link {
          position: relative;
        }
        .mobile-menu__link::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--primary);
          border-radius: 2px;
          transition: width 0.65s cubic-bezier(0.5, 0, 0.5, 1);
        }
        .mobile-menu__link:hover { color: var(--primary); }
        .mobile-menu__link:hover::after { width: 100%; }
      `}</style>
    </>
  );
}
