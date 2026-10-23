"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { knopVoor, schuifNaar } from "./wissel";

// Een link naar een andere pagina van de ledenomgeving, met de schuifbeweging.
export default function PaginaLink({ href, className, children, ...rest }: {
  href: string;
  className?: string;
  children: ReactNode;
  "aria-current"?: "page";
  "data-doel"?: boolean;
}) {
  const pad = usePathname();
  const router = useRouter();

  function klik(e: MouseEvent<HTMLAnchorElement>) {
    // Openen in een nieuw tabblad laat de browser zelf doen.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    if (pad === href) return;
    if (!schuifNaar(knopVoor(pad), href, () => router.push(href))) router.push(href);
  }

  return <Link href={href} prefetch={true} className={className} onClick={klik} {...rest}>{children}</Link>;
}
