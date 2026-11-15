interface Bestand {
  id: number;
  naam: string;
  liednummer: number | null;
  ext: string;
}

// Eén rij per lied, met de video en de uitgeschreven bewegingen (Word, PDF) op een vaste
// plek naast elkaar. Bestanden met hetzelfde nummer en dezelfde naam horen bij elkaar; een
// toevoeging tussen haakjes telt niet mee ("Halo (kort)" is de video bij "Halo").
export function choreoLiedjes(items: Bestand[]) {
  type Rij = { titel: string; nummer: number | null; video?: Bestand; tekst?: Bestand };
  const per = new Map<string, Rij>();
  for (const b of items) {
    const kaal = b.naam.replace(/\s*\([^)]*\)\s*$/, "").trim();
    const sleutel = `${b.liednummer ?? ""}|${kaal.toLowerCase()}`;
    const plek = b.ext === "mp4" ? "video" : "tekst";
    const lied = per.get(sleutel);
    if (!lied) per.set(sleutel, { titel: kaal, nummer: b.liednummer, [plek]: b });
    else if (!lied[plek]) lied[plek] = b;
    // Een tweede bestand van dezelfde soort wordt een eigen rij
    else per.set(`${sleutel}|${b.id}`, { titel: kaal, nummer: b.liednummer, [plek]: b });
  }

  const knop = (b?: Bestand) => (b ? { id: b.id, ext: b.ext } : null);
  return [...per.values()].map(({ titel, nummer, video, tekst }) => ({
    id: (video ?? tekst)!.id,
    titel,
    nummer,
    knoppen: [knop(video), knop(tekst)],
  }));
}
