"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const sections = [
  { href: "#liedjes",        label: "Liedjes" },
  { href: "#nieuwsbrieven",  label: "Nieuwsbrieven" },
  { href: "#bestuur",        label: "Bestuur" },
  { href: "#smoelenboek",    label: "Smoelenboek" },
  { href: "#opnames",        label: "Opnames" },
  { href: "#optredens",      label: "Optredens" },
];

const rolBadge: Record<string, { label: string; bg: string; color: string }> = {
  admin: { label: "Admin", bg: "rgba(243,106,42,0.12)", color: "var(--primary)" },
  lid:   { label: "Lid",   bg: "rgba(0,0,0,0.06)",     color: "#666" },
};

interface Props {
  email: string;
  rol: "lid" | "admin";
}

export default function LedenNavbar({ email, rol }: Props) {
  const router = useRouter();
  const badge  = rolBadge[rol] ?? rolBadge.lid;

  const logout = async () => {
    await createClient().auth.signOut();
    router.replace("/leden/login");
    router.refresh();
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        padding: "0 24px",
      }}
    >
      <nav
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        {/* Left — logo + label */}
        <a href="/" style={{ textDecoration: "none", flexShrink: 0, lineHeight: 1.3 }}>
          <span style={{ display: "block", fontSize: "16px", fontWeight: 800, color: "#111", letterSpacing: "-0.02em" }}>
            Popkoor <span style={{ color: "var(--primary)" }}>Divers</span>
          </span>
          <span style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "#aaa", letterSpacing: "0.07em", textTransform: "uppercase" }}>
            Ledenomgeving
          </span>
        </a>

        {/* Centre — section jump links (hidden on mobile) */}
        <div className="leden-nav-links" style={{ display: "flex", gap: "2px", flexShrink: 1, overflow: "hidden" }}>
          {sections.map((s) => (
            <a
              key={s.href}
              href={s.href}
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "#555",
                textDecoration: "none",
                padding: "5px 10px",
                borderRadius: "6px",
                whiteSpace: "nowrap",
                transition: "background 0.12s, color 0.12s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(243,106,42,0.08)"; e.currentTarget.style.color = "var(--primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#555"; }}
            >
              {s.label}
            </a>
          ))}
        </div>

        {/* Right — rol badge + website link + logout */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          {/* Rol badge */}
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: badge.color,
              background: badge.bg,
              padding: "4px 10px",
              borderRadius: "100px",
            }}
          >
            {badge.label}
          </span>

          {/* Back to website */}
          <a
            href="/"
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#555",
              textDecoration: "none",
              padding: "7px 14px",
              borderRadius: "35px",
              border: "1.5px solid rgba(0,0,0,0.12)",
              whiteSpace: "nowrap",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(243,106,42,0.4)"; e.currentTarget.style.color = "var(--primary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)"; e.currentTarget.style.color = "#555"; }}
          >
            ← Website
          </a>

          {/* Logout */}
          <button
            onClick={logout}
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#fff",
              background: "#111",
              border: "none",
              borderRadius: "35px",
              padding: "7px 16px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#111"; }}
          >
            Uitloggen
          </button>
        </div>
      </nav>

      <style>{`
        @media (max-width: 900px) {
          .leden-nav-links { display: none !important; }
        }
      `}</style>
    </header>
  );
}
