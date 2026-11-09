// Haalt het liednummer en de datumcode uit de namen van de geïmporteerde opnames:
// "Back It Up 141119 Alt Band 030" wordt naam "Back It Up Alt Band" met liednummer 30.
// Heeft een bestand geen nummer, maar hebben andere bestanden van hetzelfde lied er
// precies één, dan krijgt het dat nummer. Eerst de migratie *_liednummer.sql draaien.
//
//   node --env-file=.env.local scripts/liednummers-opnames.mjs [--proef]

import { createClient } from "@supabase/supabase-js";

const proef = process.argv.includes("--proef");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data, error } = await supabase.from("bestanden").select("id, naam").eq("categorie", "opnames").like("r2_key", "bestanden/liedjes/wp-%");
if (error) throw error;

const NUMMER = /\s(\d{3})\s*$/;
const titel = (naam) => naam.split(/\s\d{6,7}(?:\s|$)/)[0].trim().toLowerCase();

// Per lied de nummers die erbij voorkomen
const nummers = new Map();
for (const b of data) {
  const m = b.naam.match(NUMMER);
  if (m) nummers.set(titel(b.naam), new Set([...(nummers.get(titel(b.naam)) ?? []), Number(m[1])]));
}

const nieuw = data.map((b) => {
  const m = b.naam.match(NUMMER);
  const bekend = nummers.get(titel(b.naam));
  const liednummer = m ? Number(m[1]) : bekend?.size === 1 ? [...bekend][0] : null;
  const naam = b.naam.replace(NUMMER, "").replace(/\s\d{6,7}(\s|$)/, " ").replace(/\s+/g, " ").trim();
  return { ...b, nieuweNaam: naam, liednummer };
}).filter((b) => b.nieuweNaam !== b.naam || b.liednummer !== null);

console.log(`${data.length} opnames, ${nieuw.length} aan te passen, ${nieuw.filter((b) => b.liednummer === null).length} zonder liednummer`);
for (const b of nieuw.slice(0, 6)) console.log(`  ${b.naam}  →  ${b.liednummer ?? "–"} | ${b.nieuweNaam}`);
if (proef) process.exit(0);

let klaar = 0;
const rij = [...nieuw];
await Promise.all(Array.from({ length: 8 }, async () => {
  for (let b; (b = rij.shift()); ) {
    const { error } = await supabase.from("bestanden").update({ naam: b.nieuweNaam, liednummer: b.liednummer }).eq("id", b.id).eq("naam", b.naam);
    if (error) console.error(b.id, error.message); else klaar++;
  }
}));
console.log(`Klaar: ${klaar} opnames bijgewerkt.`);
