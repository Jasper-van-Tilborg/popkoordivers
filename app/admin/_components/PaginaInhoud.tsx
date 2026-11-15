"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { paginaStaat, wisseltNu } from "./paginaWissel";

// Elke pagina van de admin. Meldt aan paginaWissel dat de nieuwe pagina er
// staat, zodat de schuifbeweging kan beginnen.
export default function PaginaInhoud({ children }: { children: ReactNode }) {
  const pad = usePathname();
  return <Pagina key={pad} pad={pad}>{children}</Pagina>;
}

const SIGNALEN = ["pointerdown", "keydown", "input"] as const;

function Pagina({ pad, children }: { pad: string; children: ReactNode }) {
  // Kwam deze pagina binnen met de schuifbeweging, dan als geheel: niet ook nog rij voor rij.
  const [geschoven] = useState(wisseltNu);

  useLayoutEffect(() => {
    document.querySelector(".adm-main")?.scrollTo(0, 0);
    paginaStaat(pad);
  }, [pad]);

  // Rij voor rij binnenkomen hoort bij het openen van de pagina. Zodra je er iets
  // doet (tabblad, zoeken, opslaan), verschijnen nieuwe rijen meteen (admin.css).
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const gezien = () => {
      el.setAttribute("data-gezien", "");
      for (const t of SIGNALEN) el.removeEventListener(t, gezien);
    };
    for (const t of SIGNALEN) el.addEventListener(t, gezien);
    return () => { for (const t of SIGNALEN) el.removeEventListener(t, gezien); };
  }, []);

  return <div ref={ref} className="adm-pagina" data-geschoven={geschoven || undefined}>{children}</div>;
}
