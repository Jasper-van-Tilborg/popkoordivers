"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton({ email }: { email: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/leden/login");
    router.refresh();
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
      <span style={{ fontSize: "13px", color: "#888", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {email}
      </span>
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
