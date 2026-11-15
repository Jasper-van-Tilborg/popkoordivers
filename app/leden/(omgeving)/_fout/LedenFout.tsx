"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Kop } from "../Kop";
import Opnieuw from "@/app/_fout/Opnieuw";
import { ledenUitweg } from "@/app/_fout/uitweg";
import { useTitel } from "@/app/_fout/titel";

const STIJL = `
  .lfout-acties { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 24px; margin-top: 28px; }
  .lfout-acties .btn { min-height: 52px; padding: 0 28px; font-size: 16px; justify-content: center; border: 0; cursor: pointer; font-family: inherit; }
  .lfout-acties .btn[aria-busy="true"] { cursor: progress; }
  .lfout-acties .pijl-link { font-size: 15px; padding: 12px 0 3px; }
  .doodlopend-draai { width: 18px; height: 18px; border-radius: 50%; border: 2.5px solid currentColor; border-right-color: transparent; animation: doodlopend-draai 0.8s linear infinite; }
  @keyframes doodlopend-draai { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .doodlopend-draai { animation-duration: 2.4s; } }
`;

// Niet gevonden binnen de ledenomgeving: het ledenmenu blijft staan, één knop terug.
export function LedenNietGevonden() {
  const uitweg = ledenUitweg(usePathname());
  useTitel("Niet gevonden — Popkoor Divers");
  return (
    <>
      <Kop titel="Niet gevonden" tekst="Deze pagina bestaat niet, of is weggehaald.">
        <div className="lfout-acties">
          <Link href={uitweg.href} className="btn btn--primary">{uitweg.label}</Link>
        </div>
      </Kop>
      <style>{STIJL}</style>
    </>
  );
}

export function LedenFout({ error, retry }: { error: unknown; retry: () => void }) {
  useTitel("Er ging iets mis — Popkoor Divers");
  return (
    <>
      <Kop titel="Er ging iets mis" tekst="Dat ligt aan ons, niet aan jou. Probeer het nog eens.">
        <div className="lfout-acties">
          <Opnieuw error={error} retry={retry} className="btn btn--primary" />
          <Link href="/leden" className="pijl-link">Naar de ledenhome</Link>
        </div>
      </Kop>
      <style>{STIJL}</style>
    </>
  );
}
