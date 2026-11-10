import type { Database } from "@/lib/database.types";

// Een lied bestaat niet als eigen rij in de database: het zijn de opnames met
// hetzelfde liednummer (of, zonder nummer, met dezelfde titel voor de stem).

export type Stemgroep = Database["public"]["Enums"]["stemgroep_type"];
export const STEMMEN = ["Sopraan", "Mezzo", "Alt", "Tenor", "Bas", "Compleet"] as const;
export type Stem = (typeof STEMMEN)[number];

export interface Opname {
  id: number;
  naam: string;
  stemgroep: Stemgroep | null;
  liednummer: number | null;
  ext: string;
  created_at: string;
}

export interface Lied {
  sleutel: string;
  nummer: number | null;
  titel: string;
  opnames: Opname[];
}

export const nr = (n: number | null | undefined) => (n ? String(n).padStart(3, "0") : "");
export const stemVan = (o: Pick<Opname, "stemgroep">): Stem => o.stemgroep ?? "Compleet";
export const naarStemgroep = (s: Stem): Stemgroep | null => (s === "Compleet" ? null : s);

// Wat de browser zelf kan afspelen
const SPEELBAAR = ["mp3", "m4a", "wav", "ogg", "aac", "mp4", "flac"];
export const speelbaar = (ext: string) => SPEELBAAR.includes(ext);

// Eén woord uit een naam of bestandsnaam als stem: "Alt", "alt2", "Sopraan1", "bass"
function stemWoord(woord: string): Stem | null {
  const w = woord.toLowerCase();
  if (/^(sopraan|soprano|sop)\d*$/.test(w)) return "Sopraan";
  if (/^mezzo\d*$/.test(w)) return "Mezzo";
  if (/^(alt|alto)\d*$/.test(w)) return "Alt";
  if (/^tenor\d*$/.test(w)) return "Tenor";
  if (/^(bas|bass)\d*$/.test(w)) return "Bas";
  if (/^(compleet|tutti|allen)$/.test(w)) return "Compleet";
  return null;
}

// Woorden die na de titel komen maar geen stem zijn ("Jingle Bells Mannen")
const GEEN_TITEL = /^(mannen|vrouwen|bariton|oefentrack|oefenband|instrumentaal)$/i;

// "Viva La Vida Sopraan1 VocalTrack" → "Viva La Vida": alles vóór de stem
export function titelVan(naam: string) {
  const woorden = naam.trim().split(/\s+/);
  const i = woorden.findIndex((w, i) => {
    const kern = w.split(/[^A-Za-z0-9]+/)[0];
    return stemWoord(kern) || (i > 0 && GEEN_TITEL.test(kern));
  });
  return i > 0 ? woorden.slice(0, i).join(" ") : naam.trim();
}

// De titel die bij de meeste opnames van een lied hoort
function meestVoorkomend(opnames: Opname[]) {
  const tel = new Map<string, number>();
  for (const o of opnames) { const t = titelVan(o.naam); tel.set(t, (tel.get(t) ?? 0) + 1); }
  return [...tel].sort((a, b) => b[1] - a[1] || a[0].length - b[0].length)[0]?.[0] ?? "";
}

export const sleutelVoor = (nummer: number | null, titel: string) => (nummer ? `n${nummer}` : `t${titel.toLowerCase()}`);

export function groepeer(opnames: Opname[]): Lied[] {
  const groepen = new Map<string, Opname[]>();
  for (const o of opnames) {
    const k = sleutelVoor(o.liednummer, titelVan(o.naam));
    groepen.set(k, [...(groepen.get(k) ?? []), o]);
  }
  return [...groepen].map(([sleutel, lijst]) => ({
    sleutel,
    nummer: lijst[0].liednummer,
    titel: meestVoorkomend(lijst),
    opnames: lijst.sort((a, b) => a.naam.localeCompare(b.naam, "nl")),
  })).sort((a, b) => (b.nummer ?? 0) - (a.nummer ?? 0) || a.titel.localeCompare(b.titel, "nl"));
}

const hoofdletter = (w: string) => (/^[a-z]/.test(w) ? w[0].toUpperCase() + w.slice(1) : w);

// Wat er uit een bestandsnaam te halen is:
// "Back-it-up_141119_alt_band.mp3" → titel "Back It Up", stem Alt, rest "Band"
// "Pompeii Alt 2 086.mp3"          → titel "Pompeii", stem Alt, rest "2", nummer 86
export function leesBestandsnaam(bestandsnaam: string) {
  const woorden = bestandsnaam.replace(/\.[^.]+$/, "").split(/[\s_\-.]+/).filter((w) => w && !/^\d{6,8}$/.test(w));
  const nummerWoord = woorden.find((w) => /^\d{3}$/.test(w));
  const zonderNummer = woorden.filter((w) => w !== nummerWoord);
  const i = zonderNummer.findIndex((w) => stemWoord(w));
  return {
    titel: (i > 0 ? zonderNummer.slice(0, i) : i < 0 ? zonderNummer : []).map(hoofdletter).join(" "),
    stem: i >= 0 ? stemWoord(zonderNummer[i]) : null,
    // "Sopraan1" houdt zijn cijfer: "Sopraan 1"
    rest: i >= 0 ? [zonderNummer[i].replace(/^\D+/, ""), ...zonderNummer.slice(i + 1).map(hoofdletter)].filter(Boolean).join(" ") : "",
    nummer: nummerWoord ? Number(nummerWoord) : null,
  };
}

// De naam zoals de leden hem zien: "Back It Up Alt Band"
export const naamVoor = (titel: string, stem: Stem | "", rest: string) => [titel.trim(), stem, rest].filter(Boolean).join(" ");

export const tijd = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");

// Wat een opname onderscheidt binnen zijn vakje in de tabel: de naam zonder
// titel en stem. "Back It Up Alt Band" → "Band", "Pompeii Alt-2" → "2".
export function kortLabel(o: Opname, titel: string) {
  let rest = o.naam.trim();
  if (titel && rest.toLowerCase().startsWith(titel.toLowerCase())) rest = rest.slice(titel.length).trim();
  const [eerste = "", ...verder] = rest.split(/\s+/);
  const letters = eerste.match(/^[A-Za-z]+/)?.[0] ?? "";
  if (letters.toLowerCase() === stemVan(o).toLowerCase()) {
    rest = [eerste.slice(letters.length).replace(/^[^A-Za-z0-9]+/, ""), ...verder].filter(Boolean).join(" ");
  }
  return rest.replace(/^[-–:·\s]+/, "");
}
