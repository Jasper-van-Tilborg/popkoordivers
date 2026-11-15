"use client";

import { useEffect, useTransition } from "react";

// Noodpagina: alleen als zelfs het hoofdlayout faalt (bijv. de database reageert niet).
// Daarom een eigen document, zonder menu, globals.css of lettertypen van de site.
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  const [bezig, start] = useTransition();
  useEffect(() => { console.error(error); }, [error]);

  return (
    <html lang="nl">
      <body>
        <title>Even niet bereikbaar — Popkoor Divers</title>
        <main className="nood">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo_popkoor_divers.svg" alt="Popkoor Divers" width={160} height={48} className="nood-logo" />
          <h1>De site is even niet bereikbaar</h1>
          <p>Dat ligt aan ons, niet aan jou. Probeer het over een paar minuten nog eens.</p>
          <button type="button" aria-busy={bezig || undefined} disabled={bezig} onClick={() => start(() => retry())}>
            {bezig && <span className="nood-draai" aria-hidden="true" />}
            {bezig ? "Bezig…" : "Probeer opnieuw"}
          </button>
        </main>
        <style>{`
          * { box-sizing: border-box; }
          body { margin: 0; background: #FFF8F3; color: #111; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; -webkit-font-smoothing: antialiased; }
          .nood { min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 48px 20px; }
          .nood-logo { height: 48px; width: auto; margin-bottom: 40px; }
          .nood h1 { font-size: clamp(28px, 5vw, 44px); font-weight: 800; letter-spacing: -1px; line-height: 1.15; margin: 0 0 16px; max-width: 16ch; }
          .nood p { font-size: 17px; line-height: 1.6; color: #555; margin: 0 0 32px; max-width: 34ch; }
          .nood button {
            display: inline-flex; align-items: center; gap: 10px; min-height: 52px; padding: 0 28px; border: 0; border-radius: 35px; cursor: pointer;
            font: inherit; font-size: 16px; font-weight: 700; color: #fff; background: #F36A2A; box-shadow: 0 4px 16px rgba(243,106,42,0.28);
            transition: transform 0.12s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.15s;
          }
          @media (hover: hover) { .nood button:hover { opacity: 0.9; } }
          .nood button:active { transform: scale(0.97); }
          .nood button:focus-visible { outline: 3px solid #F36A2A; outline-offset: 3px; }
          .nood button[aria-busy="true"] { cursor: progress; }
          .nood-draai { width: 18px; height: 18px; border-radius: 50%; border: 2.5px solid currentColor; border-right-color: transparent; animation: nood-draai 0.8s linear infinite; }
          @keyframes nood-draai { to { transform: rotate(360deg); } }
          @media (prefers-reduced-motion: reduce) { .nood-draai { animation-duration: 2.4s; } }
        `}</style>
      </body>
    </html>
  );
}
