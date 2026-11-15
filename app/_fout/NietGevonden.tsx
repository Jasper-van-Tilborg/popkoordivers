"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Doodlopend from "./Doodlopend";
import { siteUitweg } from "./uitweg";

export default function NietGevonden() {
  const { hoofd, rest } = siteUitweg(usePathname());
  return (
    <Doodlopend
      titel="Deze pagina bestaat niet"
      tekst="Misschien is de link oud of is de pagina weggehaald."
      acties={<Link href={hoofd.href} className="doodlopend-knop druk">{hoofd.label}</Link>}
      verder={rest}
    />
  );
}
