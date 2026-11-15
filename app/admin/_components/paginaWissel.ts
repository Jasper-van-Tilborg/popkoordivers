// Wisselen van pagina via de zijbalk: de pagina's liggen als grote vlakken
// onder elkaar, in de volgorde van de zijbalk. Naar een pagina lager in de
// lijst schuift de hele huidige pagina naar boven uit beeld en komt de nieuwe
// tegelijk van onderen; omhoog precies andersom. De zijbalk blijft staan.
// De werking zit in lib/paginaWissel.ts, de beweging in admin.css
// ("Pagina wisselen"). Op een telefoon en met "minder beweging" gewoon direct.

import { maakPaginaWissel } from "@/lib/paginaWissel";

export { CURVE } from "@/lib/paginaWissel";

// Korter dan in de ledenomgeving: in de admin wissel je vaak van pagina.
// Even lang als de schuifbeweging in admin.css ("Pagina wisselen").
export const DUUR = 320;

export const VOLGORDE = [
  "/admin",
  "/admin/agenda", "/admin/nieuws",
  "/admin/bestanden/opnames", "/admin/bestanden/choreo", "/admin/bestanden/nieuwsbrieven", "/admin/bestanden/alv", "/admin/albums", "/admin/organisatie",
  "/admin/gebruikers", "/admin/activiteit", "/admin/sitestatus",
];

export const { knopVoor, naStart, wisseltNu, paginaStaat, schuifNaar } = maakPaginaWissel({
  volgorde: VOLGORDE,
  vooruit: "pagina-omlaag",
  terug: "pagina-omhoog",
  uitBij: "(max-width: 760px), (prefers-reduced-motion: reduce)",
});
