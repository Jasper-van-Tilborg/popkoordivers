"use client";

import Link from "next/link";
import Doodlopend from "./_fout/Doodlopend";
import Opnieuw from "./_fout/Opnieuw";
import { useTitel } from "./_fout/titel";

export default function Fout({ error, retry }: { error: unknown; retry: () => void }) {
  useTitel("Er ging iets mis — Popkoor Divers");
  return (
    <Doodlopend
      titel="Er ging iets mis"
      tekst="Dat ligt aan ons, niet aan jou. Probeer het nog eens."
      acties={<>
        <Opnieuw error={error} retry={retry} className="doodlopend-knop druk" />
        <Link href="/" className="doodlopend-link">Naar de homepage</Link>
      </>}
    />
  );
}
