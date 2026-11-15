"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// Beweging die uitlegt wat er in een lijst veranderde: waar iets na opslaan
// terechtkwam (oplichten), wat er verdween (wegvagen) en waar de rest heen
// schoof (glijden). De stijl staat in admin.css ("Lijsten in beweging").

const rustig = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Oplichten: het item dat net is opgeslagen ──────────────────────────────────
   lichtOp(id) na het opslaan; zet data-licht={licht(id)} op de rij of kaart.
   Staat het item buiten beeld, dan schuift de pagina ernaartoe. */
export function useOplichten(ms = 1600) {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    // De nieuwe gegevens komen soms een paar frames na het opslaan binnen
    let poging = 0;
    let raf = requestAnimationFrame(function zoek() {
      const el = document.querySelector<HTMLElement>("[data-licht]");
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.top < 80 || r.bottom > window.innerHeight) el.scrollIntoView({ block: "center", behavior: rustig() ? "auto" : "smooth" });
      } else if (poging++ < 60) raf = requestAnimationFrame(zoek);
    });
    const t = setTimeout(() => setId(null), ms);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); };
  }, [id, ms]);

  const licht = (sleutel: string | number) => (id !== null && id === String(sleutel)) || undefined;
  const lichtOp = useCallback((sleutel: string | number | null | undefined) => { if (sleutel != null) setId(String(sleutel)); }, []);
  return [licht, lichtOp] as const;
}

/* ── Glijden (FLIP): na een verschuiving glijdt alles naar de nieuwe plek ───────
   Zet ref op een omhullend element en data-flip={sleutel} op de items. Roep
   meet() aan vlak vóór de verandering; de eerstvolgende keer dat de items op
   een andere plek staan, glijden ze daarheen. */
export function useGlijden<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const van = useRef<Map<string, { x: number; y: number }> | null>(null);
  const tot = useRef(0);

  const plekken = () => {
    const m = new Map<string, { x: number; y: number; el: HTMLElement }>();
    ref.current?.querySelectorAll<HTMLElement>("[data-flip]").forEach((el) => m.set(el.dataset.flip!, { x: el.offsetLeft, y: el.offsetTop, el }));
    return m;
  };

  const meet = useCallback(() => {
    if (rustig()) return;
    van.current = plekken();
    tot.current = performance.now() + 1500;
  }, []);

  useLayoutEffect(() => {
    if (!van.current) return;
    if (performance.now() > tot.current) { van.current = null; return; }
    const naar = plekken();
    for (const [k, p] of naar) {
      const a = van.current.get(k);
      if (!a) continue;
      const dx = a.x - p.x;
      const dy = a.y - p.y;
      if (dx || dy) {
        p.el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: 260, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
      }
    }
    van.current = naar;
  });

  return [ref, meet] as const;
}

/* ── Wegvagen: een verwijderd item blijft even staan terwijl het verdwijnt ──────
   Geeft de lijst terug mét de items die net uit `lijst` zijn verdwenen, op hun
   oude plek. Zet data-weg={isWeg(item)} op de rij of kaart (admin.css laat die
   wegvagen). Daarna valt het item echt weg en roept het voorAfscheid() aan,
   zodat de rest kan glijden (useGlijden). */
const WEG_MS = 360;

export function useWegvagen<T>(lijst: T[], sleutel: (t: T) => string | number, voorAfscheid?: () => void) {
  const [vorige, setVorige] = useState(lijst);
  const [weg, setWeg] = useState<{ item: T; na: string | null }[]>([]);

  if (lijst !== vorige) {
    setVorige(lijst);
    const nu = new Set(lijst.map((t) => String(sleutel(t))));
    const verdwenen: { item: T; na: string | null }[] = [];
    let na: string | null = null;
    for (const t of vorige) {
      const k = String(sleutel(t));
      if (nu.has(k)) na = k;
      else verdwenen.push({ item: t, na });
    }
    if (verdwenen.length) setWeg((w) => [...w, ...verdwenen]);
  }

  const afscheid = useRef(voorAfscheid);
  useEffect(() => { afscheid.current = voorAfscheid; });
  useEffect(() => {
    if (!weg.length) return;
    const t = setTimeout(() => { afscheid.current?.(); setWeg([]); }, WEG_MS);
    return () => clearTimeout(t);
  }, [weg]);

  if (!weg.length) return { lijst, isWeg: () => undefined };

  const nu = new Set(lijst.map((t) => String(sleutel(t))));
  const blijft = weg.filter((w) => !nu.has(String(sleutel(w.item))));
  const metWeg: T[] = [];
  const voegToe = (na: string | null) => { for (const w of blijft) if (w.na === na) metWeg.push(w.item); };
  voegToe(null);
  for (const t of lijst) { metWeg.push(t); voegToe(String(sleutel(t))); }
  const wegSet = new Set(blijft.map((w) => w.item));
  return { lijst: metWeg, isWeg: (t: T) => wegSet.has(t) || undefined };
}
