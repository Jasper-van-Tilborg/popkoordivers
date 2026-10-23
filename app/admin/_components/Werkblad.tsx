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
      <div className="adm-wb-blad">{blad ?? <div className="adm-wb-leeg">{leeg}</div>}</div>
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

// Een andere regel kiezen: met de schuifbeweging van het bewerkscherm als dat kan.
// `van` en `naar` zijn de data-id's van de regels (null = niets gekozen).
export function kiesMetSchuif(van: string | null, naar: string | null, kies: () => void) {
  const blad = document.querySelector<HTMLElement>(".adm-wb-blad");
  if (
    van === naar || !blad || !document.startViewTransition ||
    window.matchMedia("(max-width: 760px), (prefers-reduced-motion: reduce)").matches
  ) return kies();

  // Lager in de lijst (of vanuit "niets gekozen"): het oude scherm gaat naar boven weg.
  const pos = (id: string | null) => (id ? document.querySelector(`.adm-wb-lijst [data-id="${CSS.escape(id)}"]`)?.getBoundingClientRect().top : undefined);
  const a = pos(van), b = pos(naar);
  const omlaag = a === undefined || b === undefined || b > a;

  const root = document.documentElement;
  root.dataset.vt = omlaag ? "blad-omlaag" : "blad-omhoog";
  root.style.setProperty("--blad-schuif", `${blad.offsetHeight}px`);
  const overgang = document.startViewTransition(() => flushSync(kies));
  overgang.finished.finally(() => {
    if (!root.dataset.vt?.startsWith("blad-")) return;
    delete root.dataset.vt;
    root.style.removeProperty("--blad-schuif");
  });
}
