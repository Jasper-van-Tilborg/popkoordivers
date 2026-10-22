"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { IconCalendar, IconNewspaper, IconFolder, IconUsers, IconEye, IconCamera } from "@/components/icons";

const nav = [
  { label: "Agenda",    href: "/admin/agenda",    icon: <IconCalendar size={17} /> },
  { label: "Nieuws",    href: "/admin/nieuws",    icon: <IconNewspaper size={17} /> },
  { label: "Media",     href: "/admin/albums",    icon: <IconCamera size={17} /> },
  { label: "Bestanden", href: "/admin/bestanden", icon: <IconFolder size={17} /> },
  { label: "Leden",     href: "/admin/leden",     icon: <IconUsers size={17} /> },
];

function Brand() {
  return (
    <a href="/" target="_blank" rel="noopener" className="adm-brand">
      <p className="adm-brand-name">Popkoor <span>Divers</span></p>
      <p className="adm-brand-sub">Beheer van de website</p>
    </a>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [open, setOpen] = useState(false);

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
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname.startsWith(item.href) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="adm-side-foot">
          <Link href="/leden" onClick={() => setOpen(false)}><IconEye size={15} /> Ledenomgeving bekijken</Link>
          <button onClick={logout}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            Uitloggen
          </button>
        </div>
      </aside>
    </>
  );
}
