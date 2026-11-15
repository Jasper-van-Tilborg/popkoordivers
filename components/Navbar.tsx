"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSocials } from "@/components/InstellingenProvider";

const links = [
  { label: "Home",     href: "/" },
  { label: "Over ons", href: "/over-ons" },
  { label: "Agenda",   href: "/agenda" },
  { label: "Nieuws",   href: "/nieuws" },
  { label: "Impressies", href: "/media" },
  { label: "Contact",  href: "/contact" },
];

export default function Navbar() {
  const socials                 = useSocials(20);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);
  const pathname                = usePathname();
  const hamburger               = useRef<HTMLButtonElement>(null);

  const actief = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  // Op pagina's met een lichte kop is de knop altijd oranje; boven een foto pas na scrollen
  const ctaVol = pathname === "/" || pathname === "/over-ons" || scrolled;

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

  // Scroll-lock op body als menu open is; Esc sluit het menu en zet de focus terug op de knop
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return () => { document.body.style.overflow = ""; };
    const esc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      hamburger.current?.focus();
    };
    window.addEventListener("keydown", esc);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <>
      <header
        className="site-header"
        data-scrolled={scrolled || undefined}
        data-vol={scrolled || open || undefined}
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
          <Link href="/" className="nav-logo" style={{ textDecoration: "none", flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG, next/image voegt niets toe */}
            <img
              src="/logo_popkoor_divers.svg"
              alt="Popkoor Divers"
              style={{ height: scrolled ? "48px" : "60px", width: "auto", display: "block", transition: "height 0.25s ease" }}
            />
          </Link>

          {/* Desktop links */}
          <ul className="nav-desktop" style={{ display: "flex", gap: "28px", listStyle: "none", margin: 0, padding: 0, alignItems: "center" }}>
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={actief(l.href) ? "page" : undefined}
                  className={`nav-link${actief(l.href) ? " nav-link--active" : ""}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <Link href="/contact#meezingen" className="nav-cta" data-vol={ctaVol || undefined}>
            Kom meezingen →
          </Link>

          {/* Hamburger: de drie streepjes draaien naar een kruisje */}
          <button
            ref={hamburger}
            className="nav-hamburger"
            data-open={open || undefined}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Sluit menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobiel-menu"
            style={{ background: "none", border: "none", cursor: "pointer", color: scrolled || open ? "#111" : "#fff", padding: "10px", display: "none", flexShrink: 0, transition: "color 0.2s" }}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" viewBox="0 0 24 24" style={{ display: "block" }}>
              <path className="ham-boven" d="M4 6h16" />
              <path className="ham-midden" d="M4 12h16" />
              <path className="ham-onder" d="M4 18h16" />
            </svg>
          </button>

        </nav>
      </header>

      {/* Mobile menu — buiten de header zodat hij de volle hoogte kan pakken.
          Dicht: inert, zodat toetsenbord en schermlezer er niet in belanden. */}
      <div
        id="mobiel-menu"
        className={`mobile-menu${open ? " mobile-menu--open" : ""}`}
        inert={!open}
      >
        <nav style={{ padding: "24px 24px 40px", display: "flex", flexDirection: "column" }}>
          {links.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              aria-current={actief(l.href) ? "page" : undefined}
              className={`mobile-menu__link${actief(l.href) ? " mobile-menu__link--active" : ""}`}
              style={{ animationDelay: `${i * 35}ms` }}
            >
              {l.label}
            </Link>
          ))}

          <Link
            href="/contact#meezingen"
            onClick={() => setOpen(false)}
            className="mobile-menu__link mobile-menu__cta"
            style={{ animationDelay: `${links.length * 35}ms` }}
          >
            Kom meezingen →
          </Link>

          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "24px" }}>
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="druk"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "50%", background: "rgba(243,106,42,0.08)", color: "var(--primary)", transition: "transform 0.12s" }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </nav>
      </div>

      <style>{`
        .nav-logo { transition: opacity 0.2s; }

        /* Desktop links: wit boven de foto, grijs na scrollen */
        .nav-link {
          position: relative; padding-bottom: 6px;
          font-size: 14px; font-weight: 500; text-decoration: none;
          color: rgba(255,255,255,0.85); transition: color 0.15s;
        }
        .site-header[data-scrolled] .nav-link { color: #444; }
        .nav-link::after {
          content: "";
          position: absolute;
          bottom: 0; left: 0;
          width: 0; height: 2px;
          border-radius: 2px;
          background: currentColor;
          transition: width 0.25s var(--ease-out);
        }
        .nav-link--active::after { width: 100%; }

        .nav-cta {
          align-items: center; gap: 6px; flex-shrink: 0;
          font-size: 13px; font-weight: 600; color: #fff; text-decoration: none;
          padding: 9px 22px; border-radius: 35px;
          background: rgba(255,255,255,0.15); border: 1.5px solid rgba(255,255,255,0.5);
          transition: background-color 0.2s, border-color 0.2s, transform 0.12s var(--ease-out);
        }
        .nav-cta[data-vol] { background: var(--primary); border-color: var(--primary); }

        @media (hover: hover) {
          .nav-logo:hover { opacity: 0.8; }
          .nav-link:hover { color: #fff; }
          .site-header[data-scrolled] .nav-link:hover { color: var(--primary); }
          .nav-link:hover::after { width: 100%; }
          .nav-cta:hover { background: var(--primary-light); border-color: var(--primary-light); transform: translateY(-2px); }
        }
        .nav-cta:active { transform: scale(0.96); transition-duration: 0.1s; }

        /* Hamburger ↔ kruisje */
        .nav-hamburger path {
          transform-box: fill-box; transform-origin: center;
          transition: transform 0.22s var(--ease-out), opacity 0.15s;
        }
        .nav-hamburger[data-open] .ham-boven  { transform: translateY(6px) rotate(45deg); }
        .nav-hamburger[data-open] .ham-midden { transform: scaleX(0); opacity: 0; }
        .nav-hamburger[data-open] .ham-onder  { transform: translateY(-6px) rotate(-45deg); }

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
          padding-top: 96px;
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

        /* Link items — gespreid binnenkomen wanneer het menu opent */
        @keyframes menu-link-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mobile-menu__link {
          position: relative;
          display: flex;
          align-items: center;
          padding: 14px 0;
          font-size: 20px;
          font-weight: 600;
          color: #111;
          text-decoration: none;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          transition: color 0.15s, transform 0.12s var(--ease-out);
        }
        /* backwards: daarna gelden de gewone stijlen weer, dus indrukken werkt */
        .mobile-menu--open .mobile-menu__link {
          animation: menu-link-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) backwards;
        }
        .mobile-menu__link--active { color: var(--primary); }
        .mobile-menu__link::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--primary);
          border-radius: 2px;
          transition: width 0.25s var(--ease-out);
        }
        .mobile-menu__cta {
          margin-top: 16px; padding: 14px 16px; justify-content: center;
          background: var(--primary); color: #fff; border-radius: 35px; border-bottom: none;
          font-weight: 700; text-align: center;
        }
        .mobile-menu__cta::after { display: none; }
        @media (hover: hover) {
          .mobile-menu__link:hover { color: var(--primary); }
          .mobile-menu__cta:hover { color: #fff; }
          .mobile-menu__link:hover::after { width: 100%; }
        }
        .mobile-menu__link:active { color: var(--primary); }
        .mobile-menu__cta:active { color: #fff; transform: scale(0.97); transition-duration: 0.1s; }
      `}</style>
    </>
  );
}
