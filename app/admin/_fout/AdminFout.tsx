"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition, useEffect } from "react";
import { adminUitweg } from "@/app/_fout/uitweg";
import { useTitel } from "@/app/_fout/titel";

// Niet gevonden of een fout in de admin: de zijbalk blijft staan, met één knop verder.
function Melding({ titel, tekst, children }: { titel: string; tekst: string; children: React.ReactNode }) {
  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>{titel}</h1>
          <p className="adm-sub">{tekst}</p>
        </div>
      </header>
      <div className="adm-content">
        <div className="adm-fout-acties">{children}</div>
      </div>
      <style>{`
        .adm-fout-acties { display: flex; flex-wrap: wrap; gap: 10px; }
        .adm-fout-acties .adm-btn { min-height: 40px; }
        .adm-fout-acties .adm-btn[aria-busy="true"] { cursor: progress; }
        .adm-fout-draai { width: 15px; height: 15px; border-radius: 50%; border: 2px solid currentColor; border-right-color: transparent; animation: adm-fout-draai 0.8s linear infinite; }
        @keyframes adm-fout-draai { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) { .adm-fout-draai { animation-duration: 2.4s; } }
      `}</style>
    </div>
  );
}

export function AdminNietGevonden() {
  const uitweg = adminUitweg(usePathname());
  useTitel("Niet gevonden — Admin");
  return (
    <Melding titel="Niet gevonden" tekst="Deze pagina bestaat niet, of wat je zocht is verwijderd.">
      <Link href={uitweg.href} className="adm-btn adm-btn--primary">{uitweg.label}</Link>
      {uitweg.href !== "/admin" && <Link href="/admin" className="adm-btn adm-btn--ghost">Naar het overzicht</Link>}
    </Melding>
  );
}

export function AdminFout({ error, retry }: { error: unknown; retry: () => void }) {
  const [bezig, start] = useTransition();
  useTitel("Er ging iets mis — Admin");
  useEffect(() => { console.error(error); }, [error]);
  return (
    <Melding titel="Er ging iets mis" tekst="Deze pagina kon niet geladen worden. Probeer het nog eens.">
      <button type="button" className="adm-btn adm-btn--primary" aria-busy={bezig || undefined} disabled={bezig} onClick={() => start(() => retry())}>
        {bezig && <span className="adm-fout-draai" aria-hidden="true" />}
        {bezig ? "Bezig…" : "Probeer opnieuw"}
      </button>
      <Link href="/admin" className="adm-btn adm-btn--ghost">Naar het overzicht</Link>
    </Melding>
  );
}
