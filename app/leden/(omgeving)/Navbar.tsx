"use client";

import { useLayoutEffect, useRef, type PointerEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CURVE, DUUR } from "@/lib/paginaWissel";
import PaginaLink from "./PaginaLink";
import { PAGINAS, knopVoor, naStart } from "./wissel";

const ROL = {
  admin: { label: "Beheerder", kleur: "oranje" },
  redacteur: { label: "Redacteur", kleur: "paars" },
  lid: { label: "Lid", kleur: "grijs" },
} as const;

type Plek = { left: number; width: number };
const px = (p: Plek) => ({ left: `${p.left}px`, width: `${p.width}px` });

// Het oranje vlak achter de gekozen pagina. Schuift tegelijk met de pagina mee
// (naStart wacht tot de schuifbeweging begint).
function Vlak({ doel }: { doel: string | null }) {
  const vlak = useRef<HTMLSpanElement>(null);
  const vorige = useRef<Plek | null>(null);

  useLayoutEffect(() => {
    const el = vlak.current;
    const balk = el?.parentElement;
    const link = doel ? balk?.querySelector<HTMLElement>(`a[href="${doel}"]`) : null;
    if (!el || !balk) return;
    if (!link) { el.style.opacity = "0"; return; }

    const plek = () => ({ left: link.offsetLeft, width: link.offsetWidth });
    const nu = plek();
    const van = vorige.current;
    vorige.current = nu;
    const rustig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!rustig && van && (van.left !== nu.left || van.width !== nu.width)) {
      Object.assign(el.style, px(van), { opacity: "1" });
      naStart(() => {
        Object.assign(el.style, px(nu));
        el.animate([px(van), px(nu)], { duration: DUUR, easing: CURVE });
      });
    } else {
      Object.assign(el.style, px(nu), { opacity: "1" });
    }
    // Op een telefoon scrolt de balk: de gekozen pagina in beeld
    if (balk.scrollWidth > balk.clientWidth) {
      balk.scrollTo({ left: nu.left - (balk.clientWidth - nu.width) / 2, behavior: rustig ? "auto" : "smooth" });
    }

    const opnieuw = () => { vorige.current = plek(); Object.assign(el.style, px(vorige.current)); };
    window.addEventListener("resize", opnieuw);
    return () => window.removeEventListener("resize", opnieuw);
  }, [doel]);

  return <span ref={vlak} className="ln-vlak" aria-hidden="true" />;
}

// Een zacht vlak dat met de muis meeschuift naar de link waar je overheen gaat.
// Komt het net in beeld, dan verschijnt het op zijn plek in plaats van eraan te schuiven.
function useZweef() {
  const zweef = useRef<HTMLSpanElement>(null);
  const naar = (e: PointerEvent<HTMLElement>) => {
    const el = zweef.current;
    const link = (e.target as HTMLElement).closest<HTMLElement>("a");
    if (!el || !link || e.pointerType !== "mouse") return;
    const nieuw = el.dataset.zichtbaar === undefined;
    if (nieuw) el.style.transition = "none";
    Object.assign(el.style, px({ left: link.offsetLeft, width: link.offsetWidth }));
    if (nieuw) { void el.offsetWidth; el.style.transition = ""; }
    el.dataset.zichtbaar = "";
  };
  const weg = () => { if (zweef.current) delete zweef.current.dataset.zichtbaar; };
  return { zweef, naar, weg };
}

export default function Navbar({ rol }: { rol: "lid" | "redacteur" | "admin" }) {
  const pad = usePathname();
  const router = useRouter();
  const actief = knopVoor(pad);
  const badge = ROL[rol] ?? ROL.lid;
  const { zweef, naar, weg } = useZweef();

  const logout = async () => {
    await createClient().auth.signOut();
    router.replace("/leden/login");
    router.refresh();
  };

  return (
    <header className="ln-kop">
      <div className="ln-balk">
        <PaginaLink href="/leden" className="ln-logo">
          <span className="ln-logo-naam">Popkoor <span>Divers</span></span>
          <span className="ln-logo-sub">Ledenomgeving</span>
        </PaginaLink>

        <nav className="ln-links" aria-label="Ledenomgeving" onPointerOver={naar} onPointerLeave={weg}>
          <span ref={zweef} className="ln-zweef" aria-hidden="true" />
          <Vlak doel={actief} />
          {PAGINAS.map((p) => (
            <PaginaLink key={p.href} href={p.href} aria-current={actief === p.href ? "page" : undefined}>{p.label}</PaginaLink>
          ))}
        </nav>

        <div className="ln-rechts">
          {rol === "lid" ? (
            <span className="ln-rol" data-kleur={badge.kleur}>{badge.label}</span>
          ) : (
            <Link href="/admin" className="ln-rol" data-kleur={badge.kleur} title="Naar de admin">{badge.label} <span aria-hidden="true">↗</span></Link>
          )}
          <Link href="/" className="ln-knop ln-knop--rand" title="Naar de website">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>
            <span className="ln-knop-tekst">Website</span>
          </Link>
          <button className="ln-knop ln-knop--donker" onClick={logout} aria-label="Uitloggen" title="Uitloggen">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            <span className="ln-knop-tekst">Uitloggen</span>
          </button>
        </div>
      </div>
    </header>
  );
}
