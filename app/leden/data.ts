export const stemgroepen = ["Alt", "Mezzo", "Sopraan", "Tenor", "Bas"] as const;
export type Stemgroep = (typeof stemgroepen)[number];

export interface Lied {
  titel: string;
  componist?: string;
  pdfUrl?: string;
}

export const liedjes: Record<Stemgroep, Lied[]> = {
  Alt: [
    { titel: "Dancing Queen", componist: "ABBA" },
    { titel: "Bohemian Rhapsody", componist: "Queen" },
    { titel: "I Will Survive", componist: "Gloria Gaynor" },
    { titel: "Rolling in the Deep", componist: "Adele" },
    { titel: "Proud Mary", componist: "Tina Turner" },
  ],
  Mezzo: [
    { titel: "Total Eclipse of the Heart", componist: "Bonnie Tyler" },
    { titel: "I Will Always Love You", componist: "Whitney Houston" },
    { titel: "Valerie", componist: "Amy Winehouse" },
    { titel: "Somebody That I Used to Know", componist: "Gotye" },
    { titel: "Stay With Me", componist: "Sam Smith" },
  ],
  Sopraan: [
    { titel: "Angels", componist: "Robbie Williams" },
    { titel: "Don't Stop Me Now", componist: "Queen" },
    { titel: "Perfect", componist: "Ed Sheeran" },
    { titel: "Shallow", componist: "Lady Gaga" },
    { titel: "Fix You", componist: "Coldplay" },
  ],
  Tenor: [
    { titel: "Hey Jude", componist: "The Beatles" },
    { titel: "With or Without You", componist: "U2" },
    { titel: "Uptown Funk", componist: "Bruno Mars" },
    { titel: "Mr. Brightside", componist: "The Killers" },
    { titel: "Seven Nation Army", componist: "The White Stripes" },
  ],
  Bas: [
    { titel: "Under Pressure", componist: "Queen & David Bowie" },
    { titel: "Don't Stop Believin'", componist: "Journey" },
    { titel: "Wonderwall", componist: "Oasis" },
    { titel: "Sweet Child O'Mine", componist: "Guns N' Roses" },
    { titel: "Living on a Prayer", componist: "Bon Jovi" },
  ],
};

export interface Nieuwsbrief {
  datum: string;
  titel: string;
  pdfUrl?: string;
}

export const nieuwsbrieven: Nieuwsbrief[] = [
  { datum: "Oktober 2026", titel: "Nieuwsbrief herfst 2026" },
  { datum: "Juni 2026", titel: "Nieuwsbrief zomer 2026" },
  { datum: "Maart 2026", titel: "Nieuwsbrief voorjaar 2026" },
  { datum: "December 2025", titel: "Nieuwsbrief winter 2025" },
  { datum: "September 2025", titel: "Nieuwsbrief herfst 2025" },
  { datum: "Mei 2025", titel: "Nieuwsbrief zomer 2025" },
];

export interface BestuursLid {
  naam: string;
  rol: string;
  initialen: string;
}

export const bestuur: BestuursLid[] = [
  { naam: "Annemarie de Groot", rol: "Voorzitter", initialen: "AG" },
  { naam: "Peter van den Berg", rol: "Secretaris", initialen: "PB" },
  { naam: "Marieke Smits", rol: "Penningmeester", initialen: "MS" },
  { naam: "Tom Mordang", rol: "Dirigent", initialen: "TM" },
  { naam: "Linda Jansen", rol: "Ledencoördinator", initialen: "LJ" },
  { naam: "Hans Willems", rol: "PR & Communicatie", initialen: "HW" },
];

export interface Lid {
  naam: string;
  stemgroep: Stemgroep;
  initialen: string;
}

export const leden: Lid[] = [
  { naam: "Anna Bakker", stemgroep: "Alt", initialen: "AB" },
  { naam: "Marjan de Vries", stemgroep: "Alt", initialen: "MV" },
  { naam: "Sanne Hendriks", stemgroep: "Alt", initialen: "SH" },
  { naam: "Ria Peeters", stemgroep: "Mezzo", initialen: "RP" },
  { naam: "Carla Vermeer", stemgroep: "Mezzo", initialen: "CV" },
  { naam: "Joke van Dam", stemgroep: "Mezzo", initialen: "JD" },
  { naam: "Lisa van der Meer", stemgroep: "Sopraan", initialen: "LM" },
  { naam: "Emma Bos", stemgroep: "Sopraan", initialen: "EB" },
  { naam: "Floor Mulder", stemgroep: "Sopraan", initialen: "FM" },
  { naam: "Jan de Boer", stemgroep: "Tenor", initialen: "JB" },
  { naam: "Erik Lammers", stemgroep: "Tenor", initialen: "EL" },
  { naam: "Rob van Leeuwen", stemgroep: "Tenor", initialen: "RL" },
  { naam: "Gerard Kuipers", stemgroep: "Bas", initialen: "GK" },
  { naam: "Frank Hofman", stemgroep: "Bas", initialen: "FH" },
  { naam: "Kees van Wijk", stemgroep: "Bas", initialen: "KW" },
];

export interface Opname {
  titel: string;
  datum: string;
  type: "audio" | "video";
  url?: string;
}

export const opnames: Opname[] = [
  { titel: "Najaarsconcert 2025 — volledige opname", datum: "November 2025", type: "video" },
  { titel: "VÓLkoren Festival — set 1", datum: "Juni 2025", type: "video" },
  { titel: "Kerstconcert 2024 — Hallelujah", datum: "December 2024", type: "audio" },
  { titel: "Jubileum 15 jaar — hoogtepunten", datum: "November 2023", type: "video" },
];

export interface ChoreoItem {
  titel: string;
  lied: string;
  url?: string;
}

export const choreo: ChoreoItem[] = [
  { titel: "Choreo Dancing Queen", lied: "Dancing Queen — ABBA" },
  { titel: "Choreo Uptown Funk", lied: "Uptown Funk — Bruno Mars" },
  { titel: "Choreo I Will Survive", lied: "I Will Survive — Gloria Gaynor" },
  { titel: "Choreo Don't Stop Me Now", lied: "Don't Stop Me Now — Queen" },
];

export interface OudOptreden {
  titel: string;
  datum: string;
  locatie: string;
  seed: string;
}

export const oudeOptredens: OudOptreden[] = [
  { titel: "Najaarsconcert 2025", datum: "November 2025", locatie: "De Schakel, Gilze", seed: "concert-2025" },
  { titel: "VÓLkoren Festival", datum: "Juni 2025", locatie: "Middelburg", seed: "volkoren-2025" },
  { titel: "Kerstconcert 2024", datum: "December 2024", locatie: "Petruskerk, Gilze", seed: "kerst-2024" },
  { titel: "Jubileum 15 jaar", datum: "November 2023", locatie: "De Schakel, Gilze", seed: "jubileum-2023" },
  { titel: "Zomerborrel 2023", datum: "Juni 2023", locatie: "De Schakel, Gilze", seed: "zomer-2023" },
  { titel: "Koningsdag 2023", datum: "April 2023", locatie: "Centrum Gilze", seed: "koningsdag-2023" },
];
