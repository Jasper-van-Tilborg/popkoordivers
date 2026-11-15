import { gewoon, isVideo, type Document } from "../documenten";

// Net als bij de opnames is een lied geen eigen rij: het zijn de bestanden met
// hetzelfde liednummer (of, zonder nummer, met dezelfde naam).

export interface ChoreoLied {
  sleutel: string;
  nummer: number | null;
  titel: string;
  videos: Document[];
  beschrijvingen: Document[];
}

export const choreoSleutel = (nummer: number | null, naam: string) => (nummer ? `n${nummer}` : `t${gewoon(naam.trim())}`);
export const choreoHref = (sleutel: string) => `/admin/bestanden/choreo/${encodeURIComponent(sleutel)}`;

export function groepeerChoreo(items: Document[]): ChoreoLied[] {
  const per = new Map<string, Document[]>();
  for (const d of items) {
    const k = choreoSleutel(d.liednummer, d.naam);
    per.set(k, [...(per.get(k) ?? []), d]);
  }
  return [...per].map(([sleutel, lijst]) => ({
    sleutel,
    nummer: lijst[0].liednummer,
    // "Halo" en "Halo (kort)": de kortste naam is de titel van het lied
    titel: lijst.map((d) => d.naam).sort((a, b) => a.length - b.length)[0],
    videos: lijst.filter((d) => isVideo(d.ext)),
    beschrijvingen: lijst.filter((d) => !isVideo(d.ext)),
  })).sort((a, b) => (b.nummer ?? 0) - (a.nummer ?? 0) || a.titel.localeCompare(b.titel, "nl"));
}
