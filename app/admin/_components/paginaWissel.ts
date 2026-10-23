// Wisselen van pagina via de zijbalk: de pagina's liggen als grote vlakken
// onder elkaar, in de volgorde van de zijbalk. Naar een pagina lager in de
// lijst schuift de hele huidige pagina naar boven uit beeld en komt de nieuwe
// tegelijk van onderen; omhoog precies andersom. De zijbalk blijft staan.
//
// Met View Transitions: de browser maakt een beeld van de oude pagina
// (.adm-main) en schuift dat weg, terwijl de nieuwe binnenschuift
// ("Pagina wisselen" in admin.css). Op een telefoon, met "minder beweging"
// en zonder View Transitions gewoon direct.

export const VOLGORDE = [
  "/admin",
  "/admin/agenda", "/admin/nieuws", "/admin/albums",
  "/admin/bestanden/liedjes", "/admin/bestanden/nieuwsbrieven", "/admin/bestanden/alv", "/admin/bestanden/opnames", "/admin/bestanden/choreo",
  "/admin/gebruikers", "/admin/activiteit", "/admin/sitestatus",
];

// Even lang en met dezelfde curve als het vlak in de zijbalk (Sidebar.tsx).
export const DUUR = 550;
export const CURVE = "cubic-bezier(0.55, 0, 0.1, 1)";

// Bij welke knop in de zijbalk hoort dit pad? (/admin/albums/<id> hoort bij Media)
export const knopVoor = (pad: string) =>
  [...VOLGORDE].reverse().find((href) => (href === "/admin" ? pad === href : pad === href || pad.startsWith(`${href}/`))) ?? null;

// Een gekozen pagina die nog moet verschijnen: de overgang wacht tot die er staat.
let wacht: { doel: string; klaar: () => void } | null = null;
// De laatste overgang: klik je snel door, dan neemt een nieuwe de vorige over.
let huidige: ViewTransition | null = null;

// Iets dat tegelijk met de pagina moet bewegen (het vlak in de zijbalk): wacht
// tot de schuifbeweging echt begint. Tot dan staat het beeld stil, dus anders
// is het vlak al halverwege voordat je het ziet.
export function naStart(fn: () => void) {
  if (huidige) huidige.ready.then(fn, fn);
  else fn();
}

// Loopt er nu een wissel? Dan komt een nieuwe pagina als geheel binnen,
// zonder ook nog rij voor rij (PaginaInhoud.tsx, data-geschoven).
export const wisseltNu = () => typeof document !== "undefined" && Boolean(document.documentElement.dataset.vt?.startsWith("pagina-"));

// De pagina meldt dat hij er staat; is dat de gekozen pagina, dan kan de overgang beginnen.
export function paginaStaat(pad: string) {
  if (wacht && knopVoor(pad) === wacht.doel) {
    wacht.klaar();
    wacht = null;
  }
}

// Naar `naar` met de schuifbeweging, vanaf de knop waar je nu bent. false:
// niet geschoven (zelfde pagina, telefoon, minder beweging of geen View
// Transitions); navigeer dan zelf.
export function schuifNaar(van: string | null, naar: string, ga: () => void): boolean {
  const a = van ? VOLGORDE.indexOf(van) : -1;
  const b = VOLGORDE.indexOf(naar);
  if (
    a < 0 || b < 0 || a === b || !document.startViewTransition ||
    window.matchMedia("(max-width: 760px), (prefers-reduced-motion: reduce)").matches
  ) return false;

  const root = document.documentElement;
  root.dataset.vt = b > a ? "pagina-omlaag" : "pagina-omhoog";
  const overgang = document.startViewTransition(
    () =>
      new Promise<void>((klaar) => {
        wacht = { doel: naar, klaar };
        ga();
        // Laadt de pagina niet, dan na een tijdje toch verder (de browser breekt anders zelf af).
        window.setTimeout(() => { if (wacht?.doel === naar) { wacht.klaar(); wacht = null; } }, 2500);
      }),
  );
  huidige = overgang;
  overgang.finished.finally(() => {
    if (huidige !== overgang) return;
    huidige = null;
    if (root.dataset.vt?.startsWith("pagina-")) delete root.dataset.vt;
  });
  return true;
}
