"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Onjuist e-mailadres of wachtwoord.");
      setLoading(false);
    } else {
      const { data: profile } = await supabase
        .from("profiles")
        .select("rol")
        .eq("id", data.user.id)
        .single();

      router.replace(profile?.rol === "admin" ? "/admin" : "/leden");
      router.refresh();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      {/* Logo */}
      <a href="/" style={{ textDecoration: "none", marginBottom: "48px", display: "flex", justifyContent: "center" }}>
        <img
          src="/logo_popkoor_divers.svg"
          alt="Popkoor Divers"
          style={{ height: "56px", width: "auto", display: "block" }}
        />
      </a>

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#FFFFFF",
          borderRadius: "24px",
          padding: "40px",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 4px 40px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 800,
            color: "#111",
            margin: "0 0 6px",
            letterSpacing: "-0.5px",
          }}
        >
          Ledenomgeving
        </h1>
        <p style={{ fontSize: "14px", color: "#888", margin: "0 0 32px" }}>
          Log in met je account
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label
              htmlFor="email"
              style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#444", marginBottom: "6px" }}
            >
              E-mailadres
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: "100%",
                padding: "11px 14px",
                fontSize: "14px",
                border: "1.5px solid rgba(0,0,0,0.12)",
                borderRadius: "10px",
                outline: "none",
                background: "#FAFAFA",
                color: "#111",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#444", marginBottom: "6px" }}
            >
              Wachtwoord
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: "100%",
                padding: "11px 14px",
                fontSize: "14px",
                border: "1.5px solid rgba(0,0,0,0.12)",
                borderRadius: "10px",
                outline: "none",
                background: "#FAFAFA",
                color: "#111",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <p
              style={{
                fontSize: "13px",
                color: "#dc2626",
                margin: 0,
                padding: "10px 14px",
                background: "#fef2f2",
                borderRadius: "8px",
                border: "1px solid #fecaca",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              fontSize: "15px",
              fontWeight: 700,
              color: "#FFFFFF",
              background: loading ? "rgba(243,106,42,0.55)" : "var(--primary)",
              border: "none",
              borderRadius: "35px",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "8px",
              transition: "opacity 0.15s",
              boxShadow: loading ? "none" : "0 4px 16px rgba(243,106,42,0.28)",
            }}
          >
            {loading ? "Bezig met inloggen…" : "Inloggen →"}
          </button>
        </form>
      </div>

      <p style={{ marginTop: "24px", fontSize: "13px", color: "#bbb", textAlign: "center" }}>
        Alleen beschikbaar voor leden van Popkoor Divers
      </p>
    </div>
  );
}
