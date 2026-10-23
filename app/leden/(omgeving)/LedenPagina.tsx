"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { paginaStaat, wisseltNu } from "./wissel";

// Elke pagina van de ledenomgeving. Meldt dat de nieuwe pagina er staat, zodat de
// schuifbeweging kan beginnen.
export default function LedenPagina({ children }: { children: ReactNode }) {
  const pad = usePathname();
  return <Pagina key={pad} pad={pad}>{children}</Pagina>;
}

function Pagina({ pad, children }: { pad: string; children: ReactNode }) {
  // Kwam deze pagina binnen met de schuifbeweging, dan als geheel: niet ook nog blok voor blok.
  const [geschoven] = useState(wisseltNu);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    paginaStaat(pad);
  }, [pad]);

  return <div className="leden-pagina" data-geschoven={geschoven || undefined}>{children}</div>;
}
