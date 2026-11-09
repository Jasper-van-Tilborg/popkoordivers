// Zet de namen van de opnames terug zoals ze op de oude site (WordPress, pagina Opnames)
// stonden, met stempartij en liednummer. De lijst komt van wp_opnames.py:
//
//   node --env-file=.env.local scripts/herstel-opnamenamen.mjs <opnames-wordpress.json> [--proef]
//
// Koppelt op de R2-key die de import maakte (tabblad + bestandsnaam).

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const [pad, ...rest] = process.argv.slice(2);
const proef = rest.includes("--proef");
const safeName = (name) =>
  name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9._-]/g, "").replace(/-+/g, "-") || "bestand";

const wp = JSON.parse(readFileSync(pad, "utf8"));
const naamVoor = new Map(wp.map((b) => {
  const bestandsnaam = decodeURIComponent(new URL(b.url).pathname.split("/").pop());
  return [`bestanden/liedjes/wp-${safeName(b.tabblad)}-${safeName(bestandsnaam)}`, b.naam];
}));

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data, error } = await supabase.from("bestanden").select("id, naam, r2_key").like("r2_key", "bestanden/liedjes/wp-%");
if (error) throw error;

const anders = data.filter((b) => naamVoor.has(b.r2_key) && naamVoor.get(b.r2_key) !== b.naam);
const zonder = data.filter((b) => !naamVoor.has(b.r2_key));
console.log(`${data.length} geïmporteerd, ${anders.length} krijgen hun oude naam terug, ${zonder.length} niet gevonden op de oude site`);
for (const b of anders.slice(0, 8)) console.log(`  ${b.naam}  →  ${naamVoor.get(b.r2_key)}`);
if (proef) process.exit(0);

let klaar = 0;
const rij = [...anders];
await Promise.all(Array.from({ length: 8 }, async () => {
  for (let b; (b = rij.shift()); ) {
    const { error } = await supabase.from("bestanden").update({ naam: naamVoor.get(b.r2_key) }).eq("id", b.id);
    if (error) console.error(b.id, error.message); else klaar++;
  }
}));
console.log(`Klaar: ${klaar} namen teruggezet.`);
