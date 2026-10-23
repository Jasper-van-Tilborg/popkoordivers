// Wisselen van pagina met een schuifbeweging: de pagina's liggen naast of onder
// elkaar in de volgorde van het menu. Naar een pagina verderop schuift de hele
// huidige pagina weg en komt de nieuwe tegelijk van de andere kant; terug precies
// andersom. Het menu blijft staan.
//
// Met View Transitions: de browser maakt een beeld van de oude pagina en schuift
// dat weg, terwijl de nieuwe binnenschuift. De CSS hoort bij de plek die dit
// gebruikt (admin.css, leden.css) en kijkt naar html[data-vt]. Met "minder
// beweging" en zonder View Transitions gewoon direct.
//
// Gebruikt door de admin (verticaal) en de ledenomgeving (horizontaal).

// Even lang en met dezelfde curve als het vlak in het menu.
export const DUUR = 550;
export const CURVE = "cubic-bezier(0.55, 0, 0.1, 1)";

export function maakPaginaWissel({ volgorde, vooruit, terug, uitBij }: {
  volgorde: string[];
  vooruit: string;   // data-vt naar een pagina verderop
  terug: string;     // data-vt naar een pagina eerder
  uitBij: string;    // media query waarbij niet geschoven wordt
}) {
  const start = volgorde[0];
  // Een gekozen pagina die nog moet verschijnen: de overgang wacht tot die er staat.
  let wacht: { doel: string; klaar: () => void } | null = null;
  // De laatste overgang: klik je snel door, dan neemt een nieuwe de vorige over.
  let huidige: ViewTransition | null = null;

  // Bij welke knop in het menu hoort dit pad? (/admin/albums/<id> hoort bij Media)
  const knopVoor = (pad: string) =>
    [...volgorde].reverse().find((href) => (href === start ? pad === href : pad === href || pad.startsWith(`${href}/`))) ?? null;

  // Iets dat tegelijk met de pagina moet bewegen (het vlak in het menu): wacht
  // tot de schuifbeweging echt begint. Tot dan staat het beeld stil, dus anders
  // is het vlak al halverwege voordat je het ziet.
  function naStart(fn: () => void) {
    if (huidige) huidige.ready.then(fn, fn);
    else fn();
  }

  // Loopt er nu een wissel? Dan komt een nieuwe pagina als geheel binnen, zonder
  // ook nog stukje voor stukje.
  const wisseltNu = () => {
    const vt = typeof document !== "undefined" ? document.documentElement.dataset.vt : undefined;
    return vt === vooruit || vt === terug;
  };

  // De pagina meldt dat hij er staat; is dat de gekozen pagina, dan kan de overgang beginnen.
  function paginaStaat(pad: string) {
    if (wacht && knopVoor(pad) === wacht.doel) {
      wacht.klaar();
      wacht = null;
    }
  }

  // Naar `naar` met de schuifbeweging, vanaf de knop waar je nu bent. false: niet
  // geschoven (zelfde pagina, uitBij of geen View Transitions); navigeer dan zelf.
  function schuifNaar(van: string | null, naar: string, ga: () => void): boolean {
    const a = van ? volgorde.indexOf(van) : -1;
    const b = volgorde.indexOf(naar);
    if (a < 0 || b < 0 || a === b || !document.startViewTransition || window.matchMedia(uitBij).matches) return false;

    const root = document.documentElement;
    root.dataset.vt = b > a ? vooruit : terug;
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
      if (root.dataset.vt === vooruit || root.dataset.vt === terug) delete root.dataset.vt;
    });
    return true;
  }

  return { knopVoor, naStart, wisseltNu, paginaStaat, schuifNaar };
}
