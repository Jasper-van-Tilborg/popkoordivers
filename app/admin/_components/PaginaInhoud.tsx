"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { paginaStaat, wisseltNu } from "./paginaWissel";

// Elke pagina van de admin. Meldt aan paginaWissel dat de nieuwe pagina er
// staat, zodat de schuifbeweging kan beginnen.
export default function PaginaInhoud({ children }: { children: ReactNode }) {
  const pad = usePathname();
  return <Pagina key={pad} pad={pad}>{children}</Pagina>;
}

function Pagina({ pad, children }: { pad: string; children: ReactNode }) {
  // Kwam deze pagina binnen met de schuifbeweging, dan als geheel: niet ook nog rij voor rij.
  const [geschoven] = useState(wisseltNu);

  useLayoutEffect(() => {
    document.querySelector(".adm-main")?.scrollTo(0, 0);
    paginaStaat(pad);
  }, [pad]);

  return <div className="adm-pagina" data-geschoven={geschoven || undefined}>{children}</div>;
}
