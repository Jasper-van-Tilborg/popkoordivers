"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const rolLabels: Record<string, { label: string; bg: string; color: string }> = {
  admin: { label: "Admin",  bg: "rgba(243,106,42,0.12)", color: "var(--primary)" },
  lid:   { label: "Lid",    bg: "rgba(0,0,0,0.06)",     color: "#666"           },
};

export default function LogoutButton({
  email,
  rol,
}: {
  email: string;
  rol: "lid" | "admin";
}) {
  const router = useRouter();
  const badge = rolLabels[rol] ?? rolLabels.lid;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/leden/login");
    router.refresh();
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
      {/* Rol badge */}
      <span
        style={{
          fontSize: "11px",
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

      {/* Email */}
      <span style={{ fontSize: "13px", color: "#888", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {email}
      </span>

      {/* Uitloggen */}
      <button
        onClick={handleLogout}
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: "#555",
          background: "none",
          border: "1.5px solid rgba(0,0,0,0.12)",
          borderRadius: "35px",
          padding: "7px 16px",
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "border-color 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(243,106,42,0.4)";
          e.currentTarget.style.color = "var(--primary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)";
          e.currentTarget.style.color = "#555";
        }}
      >
        Uitloggen →
      </button>
    </div>
  );
}
