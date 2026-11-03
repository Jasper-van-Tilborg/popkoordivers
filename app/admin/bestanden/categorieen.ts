// De onderdelen van de ledenomgeving die uit Bestanden komen. Elk heeft een
// eigen pagina in de admin (/admin/bestanden/<id>) en een eigen knop in de zijbalk.
export const CATEGORIEEN = [
  { id: "opnames",       label: "Opnames",       enkel: "opname",      uitleg: "Oefenbestanden per stemgroep." },
  { id: "choreo",        label: "Choreografie",  enkel: "choreografie", uitleg: "Bewegingen en opstellingen bij de liedjes." },
  { id: "nieuwsbrieven", label: "Nieuwsbrieven", enkel: "nieuwsbrief", uitleg: "Nieuwsbrieven voor de leden." },
  { id: "alv",           label: "ALV-stukken",   enkel: "ALV-stuk",    uitleg: "Agenda, notulen en jaarstukken van de algemene ledenvergadering." },
] as const;

// Bij deze categorieën hoort elk bestand bij een stemgroep (of bij het hele koor)
export const MET_STEMGROEP: readonly string[] = ["opnames"];

export type CategorieId = (typeof CATEGORIEEN)[number]["id"];
export const categorie = (id: string) => CATEGORIEEN.find((c) => c.id === id);
