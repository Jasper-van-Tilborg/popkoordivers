// Pagina's van de ledenomgeving liggen naast elkaar, in de volgorde van de navbar.
// Naar een pagina verderop schuift de huidige naar links weg en komt de nieuwe van
// rechts; terug andersom (lib/paginaWissel.ts, beweging in leden.css).

import { maakPaginaWissel } from "@/lib/paginaWissel";

export const PAGINAS = [
  { href: "/leden", label: "Overzicht" },
  { href: "/leden/bladmuziek", label: "Bladmuziek" },
  { href: "/leden/opnames", label: "Opnames" },
  { href: "/leden/nieuwsbrieven", label: "Nieuwsbrieven" },
  { href: "/leden/fotos", label: "Foto's" },
  { href: "/leden/wie-is-wie", label: "Wie is wie" },
];

export const { knopVoor, naStart, wisseltNu, paginaStaat, schuifNaar } = maakPaginaWissel({
  volgorde: PAGINAS.map((p) => p.href),
  vooruit: "leden-rechts",
  terug: "leden-links",
  uitBij: "(prefers-reduced-motion: reduce)",
});
