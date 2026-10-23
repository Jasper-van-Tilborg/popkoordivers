import Link from "next/link";

// Gedeeld door het overzicht en Beheer → Activiteit: één regel uit het logboek als gewone zin.

export interface ActiviteitRegel {
  id: number;
  wanneer: string;
  wie_naam: string | null;
  actie: string;
  soort: string;
  item_id: string | null;
  item_naam: string | null;
}

export const NL = "Europe/Amsterdam";

export function geleden(iso: string, nu: Date) {
  const s = (nu.getTime() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "zojuist";
  if (s < 3600) return `${Math.floor(s / 60)} min geleden`;
  if (s < 86400) return `${Math.floor(s / 3600)} uur geleden`;
  if (s < 172800) return "gisteren";
  return new Date(iso).toLocaleDateString("nl-NL", { timeZone: NL, day: "numeric", month: "long" });
}

// Waar een regel naartoe linkt
export function linkVoor(soort: string, id: string | null) {
  if (!id) return null;
  return ({
    optreden: `/admin/agenda?id=${id}`,
    bericht: `/admin/nieuws?id=${id}`,
    album: `/admin/albums/${id}`,
    foto: `/admin/albums/${id}`,
    bestand: `/admin/bestanden?id=${id}`,
    lid: `/admin/gebruikers?id=${id}`,
    groep: `/admin/organisatie?id=${id}`,
  } as Record<string, string>)[soort] ?? null;
}

const soortNaam: Record<string, string> = {
  optreden: "het optreden", bericht: "het bericht", album: "het album", bestand: "het bestand", lid: "het account van",
};

export function Zin({ a }: { a: ActiviteitRegel }) {
  const href = linkVoor(a.soort, a.item_id);
  const naam = a.item_naam ? (href ? <Link href={href}>{`"${a.item_naam}"`}</Link> : `"${a.item_naam}"`) : null;
  const wie = <strong>{a.wie_naam ?? "Iemand"}</strong>;
  if (a.soort === "instellingen") return <>{wie} heeft de website-instellingen {a.actie}.</>;
  if (a.soort === "groep") return <>{wie} heeft {naam} {a.actie}.</>;
  if (a.soort === "foto") return <>{wie} heeft een foto uit {naam} {a.actie}.</>;
  if (a.soort === "album" && a.actie.endsWith("toegevoegd")) return <>{wie} heeft {a.actie.replace(/ toegevoegd$/, "")} toegevoegd aan {naam}.</>;
  if (a.actie === "nieuw wachtwoord") return <>{wie} heeft een nieuw wachtwoord ingesteld voor {naam}.</>;
  return <>{wie} heeft {soortNaam[a.soort] ?? a.soort} {naam} {a.actie}.</>;
}
