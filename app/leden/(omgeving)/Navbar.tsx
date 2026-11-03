"use client";

import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { IconCamera, IconFolder, IconPlay, IconSparkle, IconUsers } from "@/components/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CURVE, DUUR } from "@/lib/paginaWissel";
import PaginaLink from "./PaginaLink";
import Instellingen from "./instellingen/Instellingen";
import type { Weergave } from "./weergave";
import { PAGINAS, knopVoor, naStart } from "./wissel";

// Alleen wie de admin in mag krijgt een label (met een link erheen); een gewoon lid niet
const ROL = {
  admin: { label: "Beheerder", kleur: "oranje" },
  redacteur: { label: "Redacteur", kleur: "paars" },
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

const svg = (size: number, d: ReactNode) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);
const IconHuis = () => svg(24, <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20h14V9.5" /><path d="M10 20v-6h4v6" /></>);
const IconMeer = () => svg(24, <><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></>);
const IconWereld = () => svg(22, <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>);
const IconTandwiel = ({ size = 22 }: { size?: number }) => svg(size, <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>);
const IconSlot = () => svg(22, <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>);

// Op een telefoon: de belangrijkste pagina's in een balk onderin, de rest onder "Meer".
const TABS = [
  { href: "/leden", label: "Overzicht", icoon: <IconHuis /> },
  { href: "/leden/opnames", label: "Opnames", icoon: <IconPlay size={24} /> },
  { href: "/leden/choreo", label: "Choreo", icoon: <IconSparkle size={24} /> },
  { href: "/leden/fotos", label: "Foto's", icoon: <IconCamera size={24} /> },
];
const MEER = [
  { href: "/leden/nieuwsbrieven", label: "Nieuwsbrieven & ALV", icoon: <IconFolder size={22} /> },
  { href: "/leden/wie-is-wie", label: "Wie is wie", icoon: <IconUsers size={22} /> },
  { href: "/leden/instellingen", label: "Instellingen", icoon: <IconTandwiel /> },
];

function Tabbalk({ actief, beheer }: { actief: string | null; beheer: boolean }) {
  // Open op de pagina waar je het opende: naar een andere pagina en het is weer dicht
  const [openOp, setOpenOp] = useState<string | null | false>(false);
  const open = openOp === actief;
  const setOpen = (o: boolean) => setOpenOp(o ? actief : false);
  const inMeer = MEER.some((p) => p.href === actief);

  useEffect(() => {
    if (!open) return;
    const toets = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenOp(false); };
    window.addEventListener("keydown", toets);
    return () => window.removeEventListener("keydown", toets);
  }, [open]);

  return (
    <>
      <nav className="ln-tabbalk" aria-label="Ledenomgeving">
        {TABS.map((t) => (
          <PaginaLink key={t.href} href={t.href} className="ln-tab" aria-current={actief === t.href ? "page" : undefined}>
            <span className="ln-tab-icoon">{t.icoon}</span>
            {t.label}
          </PaginaLink>
        ))}
        <button className="ln-tab" aria-expanded={open} aria-controls="ln-meer" data-actief={inMeer || undefined} onClick={() => setOpen(!open)}>
          <span className="ln-tab-icoon"><IconMeer /></span>
          Meer
        </button>
      </nav>

      <div className="ln-meer-achter" data-open={open || undefined} onClick={() => setOpen(false)} aria-hidden="true" />
      <div id="ln-meer" className="ln-meer" data-open={open || undefined} inert={!open} role="dialog" aria-label="Meer">
        <div className="ln-meer-groep">
          {MEER.map((p) => (
            <PaginaLink key={p.href} href={p.href} className="ln-meer-rij" aria-current={actief === p.href ? "page" : undefined}>
              <span className="ln-meer-icoon">{p.icoon}</span>{p.label}
            </PaginaLink>
          ))}
        </div>
        <div className="ln-meer-groep">
          {beheer && <Link href="/admin" className="ln-meer-rij"><span className="ln-meer-icoon"><IconSlot /></span>Naar de admin</Link>}
          <Link href="/" className="ln-meer-rij"><span className="ln-meer-icoon"><IconWereld /></span>Naar de website</Link>
        </div>
        <button className="ln-meer-sluit" onClick={() => setOpen(false)}>Sluiten</button>
      </div>
    </>
  );
}

type Account = { naam: string | null; stemgroep: string | null; inlog: string };

export default function Navbar({ rol, account, weergave }: { rol: "lid" | "redacteur" | "admin"; account: Account; weergave: Weergave }) {
  const pad = usePathname();
  const actief = knopVoor(pad);
  const badge = rol === "lid" ? null : ROL[rol];
  const { zweef, naar, weg } = useZweef();
  // Op desktop opent Instellingen als paneel van rechts; op de telefoon is het een pagina (onder "Meer")
  const paneel = useRef<HTMLDialogElement>(null);

  return (
    <>
      <header className="ln-kop">
        <div className="ln-balk">
          <PaginaLink href="/leden" className="ln-logo">
            <span className="ln-logo-naam">Popkoor <span>Divers</span></span>
            <span className="ln-logo-sub">Ledenomgeving</span>
          </PaginaLink>

          <nav className="ln-links" aria-label="Ledenomgeving" onPointerOver={naar} onPointerLeave={weg}>
            <span ref={zweef} className="ln-zweef" aria-hidden="true" />
            <Vlak doel={actief} />
            {PAGINAS.filter((p) => !("rechts" in p)).map((p) => (
              <PaginaLink key={p.href} href={p.href} aria-current={actief === p.href ? "page" : undefined}>{p.label}</PaginaLink>
            ))}
          </nav>

          <div className="ln-rechts">
            {badge && (
              <Link href="/admin" className="ln-rol" data-kleur={badge.kleur} title="Naar de admin">{badge.label} <span aria-hidden="true">↗</span></Link>
            )}
            <Link href="/" className="ln-knop ln-knop--rand" title="Naar de website">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>
              <span className="ln-knop-tekst">Website</span>
            </Link>
            <button type="button" className="ln-knop ln-knop--donker" aria-haspopup="dialog" onClick={() => paneel.current?.showModal()}>
              <IconTandwiel size={15} />
              <span className="ln-knop-tekst">Instellingen</span>
            </button>
          </div>
        </div>
      </header>
      <dialog
        ref={paneel}
        className="ln-paneel"
        aria-labelledby="ln-paneel-titel"
        onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }}
      >
        <div className="ln-paneel-kop">
          <h2 id="ln-paneel-titel">Instellingen</h2>
          <button type="button" className="speler-sluit ln-paneel-sluit" onClick={() => paneel.current?.close()} aria-label="Sluiten">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <Instellingen weergave={weergave} account={account} beheer={rol !== "lid"} />
      </dialog>
      <Tabbalk actief={actief} beheer={rol !== "lid"} />
    </>
  );
}
