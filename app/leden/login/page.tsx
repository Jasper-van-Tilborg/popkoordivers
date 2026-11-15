"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { naarInlog } from "@/lib/gebruikersnaam";
import { terugNaar } from "@/lib/terugNaar";

const Oog = ({ dicht }: { dicht: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
    {dicht && <path d="M3 3l18 18" />}
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toon, setToon] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const kaart = useRef<HTMLDivElement>(null);
  const wachtwoordVeld = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email: naarInlog(email), password });

    if (error) {
      setError("Onjuiste inloggegevens. Controleer je e-mailadres of gebruikersnaam en je wachtwoord.");
      setLoading(false);
      // Kaart schudt kort, cursor terug in het wachtwoord zodat je meteen opnieuw kunt typen
      const k = kaart.current;
      if (k) { k.removeAttribute("data-schud"); void k.offsetWidth; k.setAttribute("data-schud", ""); }
      setTimeout(() => wachtwoordVeld.current?.select(), 0);
    } else {
      const { data: profile } = await supabase
        .from("profiles")
        .select("rol")
        .eq("id", data.user.id)
        .single();

      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(terugNaar(next, profile?.rol));
      router.refresh();
    }
  };

  return (
    <div className="login">
      <Link href="/" className="login-logo" aria-label="Popkoor Divers, naar de homepage">
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG, next/image voegt niets toe */}
        <img src="/logo_popkoor_divers.svg" alt="" style={{ height: "56px", width: "auto", display: "block" }} />
      </Link>

      <div ref={kaart} className="login-kaart" onAnimationEnd={(e) => e.currentTarget.removeAttribute("data-schud")}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#111", margin: "0 0 6px", letterSpacing: "-0.5px" }}>
          Ledenomgeving
        </h1>
        <p style={{ fontSize: "14px", color: "#767676", margin: "0 0 32px" }}>
          Log in met je account
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label htmlFor="email" className="login-label">E-mailadres of gebruikersnaam</label>
            <input
              id="email"
              className="login-veld"
              type="text"
              inputMode="email"
              enterKeyHint="next"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                // Enter in het eerste veld: door naar het wachtwoord zolang dat nog leeg is
                if (e.key === "Enter" && !password) { e.preventDefault(); wachtwoordVeld.current?.focus(); }
              }}
              required
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-describedby={error ? "login-fout" : undefined}
            />
          </div>

          <div>
            <label htmlFor="password" className="login-label">Wachtwoord</label>
            <div style={{ position: "relative" }}>
              <input
                ref={wachtwoordVeld}
                id="password"
                className="login-veld"
                type={toon ? "text" : "password"}
                enterKeyHint="go"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                aria-describedby={error ? "login-fout" : undefined}
                style={{ paddingRight: "52px" }}
              />
              <button
                type="button"
                className="login-oog"
                onClick={() => setToon((v) => !v)}
                aria-label={toon ? "Verberg wachtwoord" : "Toon wachtwoord"}
                aria-pressed={toon}
                aria-controls="password"
              >
                <Oog dicht={toon} />
              </button>
            </div>
          </div>

          <div role="alert" style={{ display: error ? "block" : "none" }}>
            {error && <p id="login-fout" className="login-fout">{error}</p>}
          </div>

          <button type="submit" disabled={loading} className="login-knop">
            {loading ? "Bezig met inloggen…" : "Inloggen →"}
          </button>
        </form>
      </div>

      <p style={{ marginTop: "24px", fontSize: "13px", color: "#767676", textAlign: "center" }}>
        Alleen beschikbaar voor leden van Popkoor Divers
      </p>

      <style>{`
        .login {
          min-height: 100vh; min-height: 100dvh; background: #fff; padding: 24px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .login-logo {
          display: flex; justify-content: center; margin-bottom: 48px; text-decoration: none;
          border-radius: 12px; transition: opacity 0.2s, transform 0.12s var(--ease-out);
        }
        .login-kaart {
          width: 100%; max-width: 400px; background: #fff; border-radius: 24px; padding: 40px;
          border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 4px 40px rgba(0,0,0,0.08);
        }
        .login-label { display: block; font-size: 12px; font-weight: 600; color: #444; margin-bottom: 6px; }
        /* 16px: kleiner laat de iPhone inzoomen zodra je in het veld tikt */
        .login-veld {
          width: 100%; padding: 11px 14px; font-size: 16px; font-family: inherit; color: #111;
          background: #FAFAFA; border: 1.5px solid rgba(0,0,0,0.12); border-radius: 10px;
          outline: none; box-sizing: border-box; transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;
        }
        .login-veld:focus { border-color: var(--primary); background: #fff; box-shadow: 0 0 0 3px rgba(243,106,42,0.12); }
        .login-oog {
          position: absolute; top: 50%; right: 2px; transform: translateY(-50%);
          width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
          background: none; border: none; border-radius: 8px; color: #888; cursor: pointer;
          transition: color 0.15s;
        }
        .login-oog:focus-visible { outline: 2px solid var(--primary); outline-offset: -4px; }
        .login-fout {
          font-size: 13px; color: #c53030; margin: 0; padding: 10px 14px;
          background: #fef2f2; border-radius: 8px; border: 1px solid #fecaca;
        }
        .login-knop {
          width: 100%; padding: 13px; margin-top: 8px; font-size: 15px; font-weight: 700; font-family: inherit;
          color: #fff; background: var(--primary); border: none; border-radius: 35px; cursor: pointer;
          box-shadow: 0 4px 16px rgba(243,106,42,0.28);
          transition: background-color 0.15s, box-shadow 0.15s, transform 0.12s var(--ease-out);
        }
        .login-knop:disabled { background: rgba(243,106,42,0.55); box-shadow: none; cursor: not-allowed; }
        .login-knop:focus-visible { outline: 2px solid var(--primary); outline-offset: 3px; }
        @media (hover: hover) {
          .login-logo:hover { opacity: 0.8; }
          .login-oog:hover { color: #111; }
          .login-knop:not(:disabled):hover { background: var(--primary-light); }
        }
        .login-logo:active { transform: scale(0.96); transition-duration: 0.1s; }
        .login-knop:not(:disabled):active { transform: scale(0.97); transition-duration: 0.1s; }

        @keyframes login-schud {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(7px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(2px); }
        }
        .login-kaart[data-schud] { animation: login-schud 0.3s var(--ease-out); }

        @media (max-width: 480px) {
          .login-kaart { padding: 28px; }
          .login-logo { margin-bottom: 36px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .login-kaart[data-schud] { animation: none; }
        }
      `}</style>
    </div>
  );
}
