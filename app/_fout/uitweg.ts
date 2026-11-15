// Waar iemand heen kan als een pagina niet bestaat: de hoofdknop past bij het adres
// waar hij vandaan kwam (een oud nieuwsbericht → alle nieuws), de rest is een vaste rij.

export interface Uitweg { href: string; label: string }

const SITE: (Uitweg & { kort: string })[] = [
  { href: "/agenda", label: "Naar de agenda", kort: "Agenda" },
  { href: "/nieuws", label: "Naar alle nieuws", kort: "Nieuws" },
  { href: "/media", label: "Naar Impressies", kort: "Impressies" },
  { href: "/contact", label: "Naar contact", kort: "Contact" },
  { href: "/", label: "Naar de homepage", kort: "Home" },
];

// Eerste stuk van het pad: "/nieuws/oud-bericht" → "/nieuws"
const begin = (pad: string | null) => `/${(pad ?? "").split("/").filter(Boolean)[0] ?? ""}`;

export function siteUitweg(pad: string | null): { hoofd: Uitweg; rest: Uitweg[] } {
  const b = begin(pad);
  const hoofd = SITE.find((s) => s.href !== "/" && s.href === b) ?? SITE[SITE.length - 1];
  const rest = SITE.filter((s) => s !== hoofd).slice(0, 4).map((s) => ({ href: s.href, label: s.kort }));
  return { hoofd: { href: hoofd.href, label: hoofd.label }, rest };
}

const LEDEN: Record<string, Uitweg> = {
  fotos: { href: "/leden/fotos", label: "Naar Foto's" },
  opnames: { href: "/leden/opnames", label: "Naar Opnames" },
  choreo: { href: "/leden/choreo", label: "Naar Choreografie" },
  nieuwsbrieven: { href: "/leden/nieuwsbrieven", label: "Naar Nieuwsbrieven" },
};

export function ledenUitweg(pad: string | null): Uitweg {
  const deel = (pad ?? "").split("/").filter(Boolean)[1];
  return (deel && LEDEN[deel]) || { href: "/leden", label: "Naar de ledenhome" };
}

// De admin: terug naar het onderdeel uit de zijbalk waar het adres onder valt
const ADMIN: Uitweg[] = [
  { href: "/admin/agenda", label: "Naar Agenda" },
  { href: "/admin/nieuws", label: "Naar Nieuws" },
  { href: "/admin/bestanden/opnames", label: "Naar Opnames" },
  { href: "/admin/bestanden/choreo", label: "Naar Choreografie" },
  { href: "/admin/bestanden/nieuwsbrieven", label: "Naar Nieuwsbrieven" },
  { href: "/admin/bestanden/alv", label: "Naar ALV-stukken" },
  { href: "/admin/albums", label: "Naar Foto's & video's" },
  { href: "/admin/organisatie", label: "Naar Wie is wie" },
  { href: "/admin/gebruikers", label: "Naar Gebruikers" },
  { href: "/admin/activiteit", label: "Naar Activiteit" },
  { href: "/admin/sitestatus", label: "Naar Sitestatus" },
];

export function adminUitweg(pad: string | null): Uitweg {
  const p = pad ?? "";
  return ADMIN.find((a) => p === a.href || p.startsWith(`${a.href}/`)) ?? { href: "/admin", label: "Naar het overzicht" };
}
