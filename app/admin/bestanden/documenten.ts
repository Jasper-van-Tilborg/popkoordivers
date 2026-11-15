import { bestandLink } from "./actions";

// Gedeeld door Choreografie, Nieuwsbrieven en ALV-stukken.

export interface Document {
  id: number;
  naam: string;
  liednummer: number | null;
  datum: string | null;
  ext: string;
  created_at: string;
}

export const nr = (n: number | null | undefined) => (n ? String(n).padStart(3, "0") : "");

const SOORT: Record<string, string> = { mp4: "Video", mov: "Video", m4v: "Video", webm: "Video", pdf: "PDF", docx: "Word", doc: "Word", mp3: "Geluid", jpg: "Afbeelding", jpeg: "Afbeelding", png: "Afbeelding" };
export const soort = (ext: string) => SOORT[ext] ?? ext.toUpperCase();
export const isVideo = (ext: string) => soort(ext) === "Video";

// Zoeken zonder op hoofdletters of accenten te letten
export const gewoon = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export const ext = (bestandsnaam: string) => bestandsnaam.split(".").pop()!.toLowerCase();

// Openen in een nieuw tabblad of downloaden. Het tabblad gaat meteen open (anders
// houdt de browser het tegen, omdat de link pas na een tel binnen is).
export async function openBestand(id: number, opslaan = false) {
  const tab = opslaan ? null : window.open("about:blank", "_blank");
  const url = await bestandLink(id, opslaan);
  if (!url) { tab?.close(); return false; }
  if (opslaan) window.location.assign(url);
  else if (tab) { tab.opener = null; tab.location.href = url; }
  else window.open(url, "_blank", "noopener");
  return true;
}
