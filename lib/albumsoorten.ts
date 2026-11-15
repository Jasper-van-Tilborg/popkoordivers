// De soort van een album (albums.soort): om op de website op te filteren
export const ALBUM_SOORTEN = [
  { value: "optreden", label: "Optreden", meervoud: "Optredens" },
  { value: "groepsfoto", label: "Groepsfoto", meervoud: "Groepsfoto's" },
  { value: "repetitie", label: "Repetitie", meervoud: "Repetities" },
  { value: "overig", label: "Overig", meervoud: "Overig" },
] as const;

export type AlbumSoort = (typeof ALBUM_SOORTEN)[number]["value"];

export const isAlbumSoort = (s: unknown): s is AlbumSoort => ALBUM_SOORTEN.some((x) => x.value === s);
