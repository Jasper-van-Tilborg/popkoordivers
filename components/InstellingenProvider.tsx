"use client";

import { createContext, useContext, type ReactNode } from "react";
import { IconFacebook, IconInstagram, IconYoutube } from "@/components/icons";
import { STANDAARD, type Instellingen } from "@/lib/instellingen-standaard";

const InstellingenContext = createContext<Instellingen>(STANDAARD);

export function InstellingenProvider({ value, children }: { value: Instellingen; children: ReactNode }) {
  return <InstellingenContext.Provider value={value}>{children}</InstellingenContext.Provider>;
}

export const useInstellingen = () => useContext(InstellingenContext);

// Sociale media uit de instellingen; een leeg veld verbergt het icoon.
export function useSocials(iconSize = 18) {
  const i = useInstellingen();
  return [
    { label: "Facebook",  href: i.facebook,  color: "#1877F2", icon: <IconFacebook size={iconSize} /> },
    { label: "Instagram", href: i.instagram, color: "#E1306C", icon: <IconInstagram size={iconSize} /> },
    { label: "YouTube",   href: i.youtube,   color: "#FF0000", icon: <IconYoutube size={iconSize + 2} /> },
  ].filter((s) => s.href);
}
