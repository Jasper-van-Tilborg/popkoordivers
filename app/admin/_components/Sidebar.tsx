"use client";

import { useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { IconCalendar, IconNewspaper, IconUsers, IconEye, IconCamera } from "@/components/icons";
import { CURVE, DUUR, knopVoor, naStart, schuifNaar } from "./paginaWissel";
import { IconHome, IconMuziek, IconPost, IconStukken, IconMicro, IconDans, IconLogboek, IconHartslag } from "./iconen";

const IconGlobe = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>
);

type Item = { label: string; href: string; icon: ReactNode };
const groepen: { kop: string | null; alleenAdmin?: boolean; items: Item[] }[] = [
  { kop: null, items: [{ label: "Overzicht", href: "/admin", icon: <IconHome /> }] },
  { kop: "Website", items: [
    { label: "Agenda", href: "/admin/agenda", icon: <IconCalendar size={19} /> },
    { label: "Nieuws", href: "/admin/nieuws", icon: <IconNewspaper size={19} /> },
    { label: "Media",  href: "/admin/albums", icon: <IconCamera size={19} /> },
  ] },
  { kop: "Ledenomgeving", items: [
    { label: "Bladmuziek",    href: "/admin/bestanden/liedjes",       icon: <IconMuziek /> },
    { label: "Nieuwsbrieven", href: "/admin/bestanden/nieuwsbrieven", icon: <IconPost /> },
    { label: "ALV-stukken",   href: "/admin/bestanden/alv",           icon: <IconStukken /> },
    { label: "Opnames",       href: "/admin/bestanden/opnames",       icon: <IconMicro /> },
    { label: "Choreografie",  href: "/admin/bestanden/choreo",        icon: <IconDans /> },
  ] },
  { kop: "Beheer", alleenAdmin: true, items: [
    { label: "Gebruikers", href: "/admin/gebruikers", icon: <IconUsers size={19} /> },
    { label: "Activiteit", href: "/admin/activiteit", icon: <IconLogboek /> },
    { label: "Sitestatus", href: "/admin/sitestatus", icon: <IconHartslag /> },
  ] },
];

// Het oranje vlak achter de actieve knop. Bij een klik schuift het naar de
// nieuwe knop, meegroeiend in hoogte en breedte, in hetzelfde tempo als de
// pagina die wisselt (paginaWissel.ts): vlak en pagina komen tegelijk aan.
type Plek = { top: number; left: number; width: number; height: number };
const px = (p: Plek) => ({ top: `${p.top}px`, left: `${p.left}px`, width: `${p.width}px`, height: `${p.height}px` });
const zelfde = (a: Plek, b: Plek) => a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height;

function NavVlak({ doel }: { doel: string | null }) {
  const vlak = useRef<HTMLSpanElement>(null);
  const vorige = useRef<Plek | null>(null);

  useLayoutEffect(() => {
    const el = vlak.current;
    const link = doel ? el?.parentElement?.querySelector<HTMLElement>(`a[href="${doel}"]`) : null;
    if (!el) return;
    if (!link) {
      el.style.opacity = "0";
      return;
    }
    const plek = () => ({ top: link.offsetTop, left: link.offsetLeft, width: link.offsetWidth, height: link.offsetHeight });
    const nu = plek();
    const van = vorige.current;
    vorige.current = nu;
    const rustig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!rustig && van && !zelfde(van, nu)) {
      // Blijf staan tot de pagina gaat schuiven, en beweeg dan tegelijk mee.
      Object.assign(el.style, px(van), { opacity: "1" });
      naStart(() => {
        Object.assign(el.style, px(nu));
        el.animate([px(van), px(nu)], { duration: DUUR, easing: CURVE });
      });
    } else {
      Object.assign(el.style, px(nu), { opacity: "1" });
    }

    // Op een andere schermbreedte staat de knop ergens anders: meegroeien, zonder animatie.
    const opnieuw = () => {
      vorige.current = plek();
      Object.assign(el.style, px(vorige.current));
    };
    window.addEventListener("resize", opnieuw);
    return () => window.removeEventListener("resize", opnieuw);
  }, [doel]);

  return <span ref={vlak} className="adm-navvlak" aria-hidden="true" />;
}

function Brand() {
  return (
    <a href="/" target="_blank" rel="noopener" className="adm-brand">
      <p className="adm-brand-name">Popkoor <span>Divers</span></p>
      <p className="adm-brand-sub">Beheer van de website</p>
    </a>
  );
}

const initialen = (s: string) =>
  (s.split(/[\s@.]+/).filter(Boolean).map((w) => w[0]).join("").slice(0, 2) || "?").toUpperCase();

export default function Sidebar({ naam, email, rol }: { naam: string | null; email: string; rol: "admin" | "redacteur" }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [open, setOpen] = useState(false);

  // Na een klik schuift het vlak meteen naar de gekozen knop, nog voordat de pagina geladen is.
  const actief = knopVoor(pathname);
  const [geklikt, setGeklikt] = useState<string | null>(null);
  const [vorigActief, setVorigActief] = useState(actief);
  if (actief !== vorigActief) {
    setVorigActief(actief);
    setGeklikt(null);
  }
  const doel = geklikt ?? actief;

  const kies = (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    // Openen in een nieuw tabblad laat de browser zelf doen.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    setOpen(false);
    if (pathname === href) return;
    setGeklikt(href);
    if (!schuifNaar(actief, href, () => router.push(href))) router.push(href);
  };

  const logout = async () => {
    await createClient().auth.signOut();
    router.replace("/leden/login");
    router.refresh();
  };

  return (
    <>
      <div className="adm-topbar">
        <Brand />
        <button onClick={() => setOpen(true)} aria-label="Menu openen" aria-expanded={open} aria-controls="adm-sidebar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
      </div>
      {open && <div className="adm-scrim" onClick={() => setOpen(false)} />}

      <aside id="adm-sidebar" className="adm-sidebar" data-open={open || undefined}>
        <Brand />
        <nav className="adm-nav" aria-label="Beheer">
          <NavVlak doel={doel} />
          {groepen.filter((g) => rol === "admin" || !g.alleenAdmin).map((g) => (
            <div key={g.kop ?? "start"} style={{ display: "contents" }}>
              {g.kop && <p className="adm-nav-kop">{g.kop}</p>}
              {g.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={kies(item.href)}
                  aria-current={actief === item.href ? "page" : undefined}
                  data-doel={doel === item.href || undefined}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="adm-side-foot">
          <a href="/" target="_blank" rel="noopener"><IconGlobe /> Website bekijken</a>
          <Link href="/leden" onClick={() => setOpen(false)}><IconEye size={16} /> Ledenomgeving bekijken</Link>
          <div className="adm-account">
            <span className="adm-avatar" aria-hidden="true">{initialen(naam ?? email)}</span>
            <div>
              <p className="adm-account-naam">{naam ?? (rol === "admin" ? "Beheerder" : "Redacteur")}</p>
              <p className="adm-account-mail">{email}</p>
            </div>
            <button onClick={logout} aria-label="Uitloggen" title="Uitloggen">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
