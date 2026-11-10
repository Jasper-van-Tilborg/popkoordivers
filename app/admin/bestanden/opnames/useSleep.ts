"use client";

import { useEffect, useRef, useState } from "react";

// Een opname oppakken en in een ander vakje loslaten. Met gewone pointer-events
// (geen HTML-slepen), zodat het ook op een telefoon werkt: daar pak je iets op
// door het even vast te houden, zodat scrollen gewoon blijft werken.
// Een plek om los te laten heeft data-doel; dat komt terug in onLos.

export interface Sleep { id: number; x: number; y: number; doel: string | null }

const DREMPEL = 6;         // px bewegen voordat een muis gaat slepen
const VASTHOUDEN = 280;    // ms vasthouden voordat een vinger gaat slepen
const RAND = 80;           // px van de rand waar de pagina meescrolt

export function useSleep(onLos: (id: number, doel: string) => void) {
  const [sleep, setSleep] = useState<Sleep | null>(null);
  const einde = useRef(0);
  const losRef = useRef(onLos);
  useEffect(() => { losRef.current = onLos; });

  function start(e: React.PointerEvent, id: number) {
    if (e.button !== 0 || sleep) return;
    const begin = { x: e.clientX, y: e.clientY };
    const vinger = e.pointerType !== "mouse";
    let x = begin.x, y = begin.y, doel: string | null = null, actief = false, snelheid = 0, frame = 0;
    const scroller = document.querySelector<HTMLElement>(".adm-main") ?? document.scrollingElement;

    const zoekDoel = () => {
      const el = document.elementFromPoint(x, y) as HTMLElement | null;
      doel = el?.closest<HTMLElement>("[data-doel]")?.dataset.doel ?? null;
      setSleep({ id, x, y, doel });
    };

    // Bij de rand van het scherm scrolt de pagina mee
    const scrol = () => {
      if (snelheid && scroller) { scroller.scrollBy(0, snelheid); zoekDoel(); }
      frame = requestAnimationFrame(scrol);
    };

    const activeer = () => {
      actief = true;
      document.documentElement.classList.add("adm-sleept");
      navigator.vibrate?.(8);
      zoekDoel();
      frame = requestAnimationFrame(scrol);
    };
    const wacht = vinger ? setTimeout(activeer, VASTHOUDEN) : undefined;

    function beweeg(ev: PointerEvent) {
      x = ev.clientX; y = ev.clientY;
      if (!actief) {
        if (Math.hypot(x - begin.x, y - begin.y) < DREMPEL) return;
        if (vinger) return klaar(); // een vinger die meteen beweegt, scrolt
        activeer();
      }
      snelheid = y < RAND ? -Math.ceil((RAND - y) / 6) : y > window.innerHeight - RAND ? Math.ceil((y - window.innerHeight + RAND) / 6) : 0;
      zoekDoel();
    }
    // Tijdens het slepen niet ook de pagina laten scrollen (telefoon)
    function houdStil(ev: TouchEvent) { if (actief) ev.preventDefault(); }
    function geenMenu(ev: Event) { if (actief || vinger) ev.preventDefault(); }
    function toets(ev: KeyboardEvent) { if (ev.key === "Escape" && actief) { ev.preventDefault(); doel = null; klaar(); } }

    function los() {
      const waar = doel;
      const wasActief = actief;
      klaar();
      if (wasActief && waar) losRef.current(id, waar);
    }

    function klaar() {
      clearTimeout(wacht);
      cancelAnimationFrame(frame);
      if (actief) einde.current = Date.now();
      actief = false;
      document.documentElement.classList.remove("adm-sleept");
      setSleep(null);
      window.removeEventListener("pointermove", beweeg);
      window.removeEventListener("pointerup", los);
      window.removeEventListener("pointercancel", klaar);
      window.removeEventListener("touchmove", houdStil);
      window.removeEventListener("contextmenu", geenMenu);
      window.removeEventListener("keydown", toets, true);
    }

    window.addEventListener("pointermove", beweeg);
    window.addEventListener("pointerup", los);
    window.addEventListener("pointercancel", klaar);
    window.addEventListener("touchmove", houdStil, { passive: false });
    window.addEventListener("contextmenu", geenMenu);
    window.addEventListener("keydown", toets, true);
  }

  // Na het loslaten volgt nog een klik op wat je vasthad; die telt niet
  const netGesleept = () => Date.now() - einde.current < 350;

  return { sleep, start, netGesleept };
}
