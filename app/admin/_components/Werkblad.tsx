"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { CURVE, DUUR } from "./paginaWissel";

// De opzet van Agenda, Nieuws, Bestanden en Leden: links de lijst, rechts het
// bewerkscherm van wat je kiest. Achter de gekozen regel schuift een oranje
// vlak naar de nieuwe regel, en het bewerkscherm schuift als geheel binnen
// zijn eigen kader: een regel lager en het oude scherm gaat naar boven weg
// terwijl het nieuwe van onderen komt; hoger andersom. In hetzelfde tempo als
// het wisselen van pagina (paginaWissel.ts). Op een telefoon opent het
// bewerkscherm over de hele breedte (admin.css).

export function Werkblad({ lijst, blad, leeg, gekozen }: {
  lijst: ReactNode;
  blad: ReactNode | null;
  leeg: ReactNode;
  gekozen: string | null;
}) {
  const lijstRef = useRef<HTMLDivElement>(null);
  return (
    <div className="adm-wb" data-open={blad ? true : undefined}>
      <div ref={lijstRef} className="adm-wb-lijst">
        <LijstVlak houder={lijstRef} gekozen={gekozen} />
        {lijst}
      </div>
      <div className="adm-wb-blad"><div className="adm-wb-blad-inhoud">{blad ?? <div className="adm-wb-leeg">{leeg}</div>}</div></div>
    </div>
  );
}

// Het vlak achter de gekozen regel (een element met data-id in de lijst).
type Plek = { top: number; left: number; width: number; height: number };
const px = (p: Plek) => ({ top: `${p.top}px`, left: `${p.left}px`, width: `${p.width}px`, height: `${p.height}px` });

function LijstVlak({ houder, gekozen }: { houder: React.RefObject<HTMLDivElement | null>; gekozen: string | null }) {
  const vlak = useRef<HTMLSpanElement>(null);
  const vorige = useRef<Plek | null>(null);

  useLayoutEffect(() => {
    const el = vlak.current;
    const doos = houder.current;
    const rij = gekozen && doos ? doos.querySelector<HTMLElement>(`[data-id="${CSS.escape(gekozen)}"]`) : null;
    if (!el || !doos) return;
    if (!rij) {
      el.style.opacity = "0";
      vorige.current = null;
      return;
    }
    const plek = (): Plek => {
      const a = doos.getBoundingClientRect();
      const b = rij.getBoundingClientRect();
      return { top: b.top - a.top + doos.scrollTop, left: b.left - a.left, width: b.width, height: b.height };
    };
    const nu = plek();
    Object.assign(el.style, px(nu), { opacity: "1" });
    if (vorige.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.animate([px(vorige.current), px(nu)], { duration: DUUR, easing: CURVE });
    }
    vorige.current = nu;
    const opnieuw = () => { vorige.current = plek(); Object.assign(el.style, px(vorige.current)); };
    const meten = new ResizeObserver(opnieuw);
    meten.observe(doos);
    return () => meten.disconnect();
  });

  return <span ref={vlak} className="adm-wb-vlak" aria-hidden="true" />;
}

// Een andere regel kiezen: het bewerkscherm schuift als geheel binnen zijn
// eigen kader, net als een pagina bij het wisselen via de zijbalk. Met gewone
// animaties (geen View Transition), zodat je tijdens het schuiven gewoon kunt
// blijven klikken. Het oude scherm gaat als kopie weg; het kader groeit of
// krimpt in hetzelfde tempo naar de hoogte van het nieuwe scherm.
// `van` en `naar` zijn de data-id's van de regels (null = niets gekozen).
let lopend: (() => void) | null = null;

export function kiesMetSchuif(van: string | null, naar: string | null, kies: () => void) {
  lopend?.(); // een vorige beweging meteen afronden
  const kader = document.querySelector<HTMLElement>(".adm-wb-blad");
  const inhoud = kader?.querySelector<HTMLElement>(".adm-wb-blad-inhoud");
  if (
    van === naar || !kader || !inhoud ||
    window.matchMedia("(max-width: 760px), (prefers-reduced-motion: reduce)").matches
  ) return flushSync(kies);

  // Lager in de lijst (of vanuit "niets gekozen"): het oude scherm gaat naar boven weg.
  const pos = (id: string | null) => (id ? document.querySelector(`.adm-wb-lijst [data-id="${CSS.escape(id)}"]`)?.getBoundingClientRect().top : undefined);
  const a = pos(van), b = pos(naar);
  const omlaag = a === undefined || b === undefined || b > a;

  const oudeHoogte = kader.offsetHeight;
  const kopie = inhoud.cloneNode(true) as HTMLElement;
  kopie.classList.add("adm-wb-kopie");
  kopie.setAttribute("aria-hidden", "true");
  kopie.inert = true;
  kopie.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));

  flushSync(kies);
  kader.appendChild(kopie);
  const nieuweHoogte = inhoud.offsetHeight;
  const afstand = omlaag ? oudeHoogte : nieuweHoogte;
  const tempo = { duration: DUUR, easing: CURVE };

  kader.classList.add("is-schuivend");
  const animaties = [
    kader.animate([{ height: `${oudeHoogte}px` }, { height: `${nieuweHoogte}px` }], tempo),
    kopie.animate([{ transform: "translateY(0)" }, { transform: `translateY(${omlaag ? -afstand : afstand}px)` }], tempo),
    inhoud.animate([{ transform: `translateY(${omlaag ? afstand : -afstand}px)` }, { transform: "translateY(0)" }], tempo),
  ];
  const klaar = () => {
    animaties.forEach((x) => x.cancel());
    kopie.remove();
    kader.classList.remove("is-schuivend");
    if (lopend === klaar) lopend = null;
  };
  lopend = klaar;
  animaties[0].finished.then(klaar, () => {});
}
