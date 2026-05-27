"use client";

import { usePathname } from "next/navigation";
import { IconCalendar, IconNewspaper, IconFolder, IconStar, IconUsers, IconCamera } from "@/components/icons";

const nav = [
  { label: "Agenda",       href: "/demo/admin/agenda",      icon: <IconCalendar size={15} /> },
  { label: "Nieuws",       href: "/demo/admin/nieuws",       icon: <IconNewspaper size={15} /> },
  { label: "Media",        href: "/demo/admin/media",        icon: <IconCamera size={15} /> },
  { label: "Bestanden",    href: "/demo/admin/bestanden",    icon: <IconFolder size={15} /> },
  { label: "Sponsorkliks", href: "/demo/admin/sponsorkliks", icon: <IconStar size={15} /> },
  { label: "Leden",        href: "/demo/admin/leden",        icon: <IconUsers size={15} /> },
];

export default function DemoSidebar() {
  const pathname = usePathname();

  return (
    <aside style={{ width: "220px", minWidth: "220px", background: "#111111", display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Brand */}
      <div style={{ padding: "22px 20px 16px" }}>
        <a href="/" target="_blank" rel="noopener" style={{ textDecoration: "none" }}>
          <p style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
            Popkoor <span style={{ color: "var(--primary)" }}>Divers</span>
          </p>
        </a>
        <p style={{ margin: "3px 0 0", fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Admin dashboard
        </p>
      </div>

      {/* Demo badge */}
      <div style={{ margin: "0 16px 12px" }}>
        <span
          style={{
            display: "block",
            textAlign: "center",
            padding: "5px 10px",
            fontSize: "10px",
            fontWeight: 700,
            color: "var(--primary)",
            background: "rgba(243,106,42,0.12)",
            border: "1px solid rgba(243,106,42,0.25)",
            borderRadius: "6px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Demo modus
        </span>
      </div>

      <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", margin: "0 16px" }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 0", overflow: "auto" }}>
        {nav.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <a
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 20px",
                fontSize: "13px",
                fontWeight: active ? 700 : 500,
                color: active ? "var(--primary)" : "rgba(255,255,255,0.6)",
                textDecoration: "none",
                background: active ? "rgba(243,106,42,0.10)" : "transparent",
                borderLeft: active ? "2px solid var(--primary)" : "2px solid transparent",
                transition: "all 0.12s",
              }}
            >
              <span style={{ lineHeight: 1, display: "flex" }}>{item.icon}</span>
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* Back to demo */}
      <div style={{ padding: "12px 16px 20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <a
          href="/demo"
          style={{
            display: "block",
            width: "100%",
            padding: "9px 14px",
            fontSize: "13px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.45)",
            background: "none",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: "8px",
            cursor: "pointer",
            textAlign: "center",
            textDecoration: "none",
            transition: "color 0.15s, border-color 0.15s",
          }}
        >
          ← Demo menu
        </a>
      </div>
    </aside>
  );
}
