// De onderdelen van de ledenomgeving die uit Bestanden komen. Elk heeft een
// eigen pagina in de admin (/admin/bestanden/<id>) en een eigen knop in de zijbalk.
export const CATEGORIEEN = [
  { id: "liedjes",       label: "Bladmuziek",    enkel: "bladmuziek",  uitleg: "Bladmuziek en oefenbestanden, per stemgroep. Staat in de ledenomgeving onder Liedjes per stemgroep." },
  { id: "nieuwsbrieven", label: "Nieuwsbrieven", enkel: "nieuwsbrief", uitleg: "Nieuwsbrieven voor de leden." },
  { id: "alv",           label: "ALV-stukken",   enkel: "ALV-stuk",    uitleg: "Agenda, notulen en jaarstukken van de algemene ledenvergadering." },
  { id: "opnames",       label: "Opnames",       enkel: "opname",      uitleg: "Geluids- en video-opnames om mee te oefenen." },
  { id: "choreo",        label: "Choreografie",  enkel: "choreografie", uitleg: "Bewegingen en opstellingen bij de liedjes." },
] as const;

export type CategorieId = (typeof CATEGORIEEN)[number]["id"];
export const categorie = (id: string) => CATEGORIEEN.find((c) => c.id === id);
