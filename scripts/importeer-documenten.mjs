// Eenmalige import van de nieuwsbrieven en ALV-stukken van www.popkoordivers.nl (WP-Filebase,
// pagina's "Nieuwsbrieven" en "ALV Documenten"): elk bestand naar de privé R2-bucket en een
// rij in `bestanden`, met de datum waarop de nieuwsbrief uitkwam of de datum van de ALV.
// Eerst de migratie *_bestand_datum.sql draaien.
//
//   node --env-file=.env.local scripts/importeer-documenten.mjs [--proef] [--bewaar <uit.json>]
//
// Namen worden "Nieuwsbrief 136"; de datum staat apart. Staat er geen jaar in de naam
// ("Nieuwsbrief 84, 7 Januari"), dan volgt het uit de nieuwsbrief met het volgende nummer.
// Dubbel geüploade nieuwsbrieven gaan er één keer in. Veilig om vaker te draaien.

import { writeFileSync } from "node:fs";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
const proef = args.includes("--proef");
const bewaar = args.includes("--bewaar") ? args[args.indexOf("--bewaar") + 1] : null;

const CONTENT_TYPE = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

// Zelfde regels als safeName in lib/r2.ts
const safeName = (name) =>
  name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9._-]/g, "").replace(/-+/g, "-") || "bestand";

const unescape = (s) => s
  .replace(/&#0?39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#8217;/g, "’");

// Wat niet uit de naam te halen is (nagekeken in de bestanden zelf), op bestandsnaam
const ANDERS = {
  // Een losse nieuwsbrief zonder nummer, over het optreden in Paradiso
  "Nieuwsbrief120_240107-Paradiso-korendagen.docx": { naam: "Nieuwsbrief Paradiso Korendagen", datum: "2024-01-07" },
  // Hoort bij nieuwsbrief 117 over het jubileum
  "Setlist-15-jarig-Julileumconcert-2023.pdf": { naam: "Setlist 15-jarig jubileumconcert 2023", datum: "2023-04-19" },
  "Setlist-17-december-2022-met-Vlijt-en-Eendracht.pdf": { naam: "Setlist 17 december 2022 met Vlijt en Eendracht", datum: "2022-12-17" },
  "planning-divers-nov.-april-22-23.pdf": { naam: "Repetitieschema november 2022 t/m april 2023", datum: "2022-11-15" },
  "NL-Basis-aandachtspunten-protocol-koorzingen.pdf": { naam: "Protocol koorzingen: basis-aandachtspunten", datum: "2020-05-29" },
  // De stukken voor de ALV van 19 maart 2024
  "Fin-verslag-2023-en-begroting-2024-en-2025-2-2.pdf": { naam: "Financieel verslag 2023 en begroting 2024 en 2025", datum: "2024-03-19" },
  "Agenda-ALV-PD-19-maart-2024.pdf": { naam: "Agenda ALV 19 maart 2024", datum: "2024-03-19" },
  "jaarplanning-2024-1.pdf": { naam: "Jaarplanning 2024", datum: "2024-03-19" },
  "jaarverslag-2023-1.pdf": { naam: "Jaarverslag 2023", datum: "2024-03-19" },
  "Verslag-Algemene-Leden-Vergadering-2023-1.pdf": { naam: "Verslag ALV 2023", datum: "2024-03-19" },
};

const PAGINAS = [
  { id: 1721, categorie: "nieuwsbrieven" },
  { id: 1730, categorie: "alv" },
];

const MAANDEN = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
const twee = (n) => String(n).padStart(2, "0");

// { j, m, d } uit "2025.01.29", "11-04-2021", "7 Juni 2020" of "7 Januari" (dan zonder jaar)
function datumUit(tekst) {
  let m = tekst.match(/(\d{4})[.-](\d{2})[.-](\d{2})/);
  if (m) return { j: +m[1], m: +m[2], d: +m[3] };
  m = tekst.match(/(\d{2})[.-](\d{2})[.-](\d{4})/);
  if (m) return { j: +m[3], m: +m[2], d: +m[1] };
  m = tekst.toLowerCase().match(new RegExp(`(\\d{1,2})[\\s-]+(${MAANDEN.join("|")})(?:[\\s-]+(\\d{4}))?`));
  if (m) return { j: m[3] ? +m[3] : null, m: MAANDEN.indexOf(m[2]) + 1, d: +m[1] };
  return null;
}

// De pagina's zoals WordPress ze toont: één tabel met alle bestanden, nieuwste eerst
const auth = Buffer.from(`${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`).toString("base64");
const wp = [];
for (const p of PAGINAS) {
  const res = await fetch(`https://www.popkoordivers.nl/wp-json/wp/v2/pages/${p.id}?context=edit`, {
    headers: { Authorization: `Basic ${auth}`, "User-Agent": "popkoordivers-import" },
  });
  if (!res.ok) throw new Error(`WordPress gaf ${res.status} voor pagina ${p.id}`);
  const html = (await res.json()).content.rendered;
  const rijen = [...html.matchAll(/<tr><td><a href="([^"]+)">(.*?)<\/a><\/td>/g)];
  if (!rijen.length) throw new Error(`Geen bestanden gevonden op pagina ${p.id}`);
  wp.push(...rijen.map(([, url, naam]) => ({ categorie: p.categorie, naam: unescape(naam).trim(), url })));
}
if (bewaar) writeFileSync(bewaar, JSON.stringify(wp, null, 1) + "\n");

const dubbel = [];
const gezien = new Set();
const rijen = [];
for (const b of wp) {
  const bestandsnaam = decodeURIComponent(new URL(b.url).pathname.split("/").pop());
  const ext = bestandsnaam.split(".").pop().toLowerCase();
  const anders = ANDERS[bestandsnaam];
  const nummer = anders ? null : Number(b.naam.match(/nieuwsbrief\D{0,3}(\d{2,3})/i)?.[1]) || null;
  // Een nieuwsbrief die vaker is geüpload: de bovenste (nieuwste upload) blijft
  if (nummer && gezien.has(nummer)) { dubbel.push(b); continue; }
  if (nummer) gezien.add(nummer);
  rijen.push({
    ...b, ext, nummer,
    naam: anders?.naam ?? (nummer ? `Nieuwsbrief ${nummer}` : b.naam),
    datum: anders?.datum ?? null,
    gevonden: anders ? null : datumUit(b.naam) ?? datumUit(bestandsnaam),
    key: `bestanden/${b.categorie}/wp-${safeName(bestandsnaam)}`,
  });
}

// Het jaar dat ontbreekt: van de nieuwste nummers naar de oudste. Ligt de dag later
// in het jaar dan die van de volgende nieuwsbrief, dan is het een jaar eerder.
let volgende = null;
for (const r of rijen.filter((r) => r.nummer).sort((a, b) => b.nummer - a.nummer)) {
  const g = r.gevonden;
  if (!g) continue;
  if (!g.j && volgende) g.j = g.m * 100 + g.d > volgende.m * 100 + volgende.d ? volgende.j - 1 : volgende.j;
  if (g.j) volgende = g;
}
for (const r of rijen) if (!r.datum && r.gevonden?.j) r.datum = `${r.gevonden.j}-${twee(r.gevonden.m)}-${twee(r.gevonden.d)}`;

const fouten = [
  ...rijen.filter((r) => !CONTENT_TYPE[r.ext]).map((r) => `onbekende bestandsoort: ${r.url}`),
  ...rijen.filter((r) => !r.datum).map((r) => `geen datum: ${r.naam} (${r.url})`),
];
if (fouten.length) {
  console.error(fouten.join("\n"));
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});
const bucket = process.env.CLOUDFLARE_R2_PRIVATE_BUCKET_NAME;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data: bestaand, error } = await supabase.from("bestanden").select("r2_key").in("categorie", PAGINAS.map((p) => p.categorie)).like("r2_key", "bestanden/%/wp-%");
if (error) throw error;
const al = new Set(bestaand.map((b) => b.r2_key));
const todo = rijen.filter((r) => !al.has(r.key));

console.log(`${wp.length} op de oude site, ${dubbel.length} dubbel, ${al.size} al overgezet, ${todo.length} nu aan de beurt${proef ? " (proef)" : ""}`);
if (proef) {
  for (const r of todo) console.log(`  ${r.categorie.padEnd(13)} ${r.datum} | ${r.naam} | ${r.ext} → ${r.key}`);
  for (const r of dubbel) console.log(`  dubbel, overgeslagen: ${r.naam} (${r.url})`);
  process.exit(0);
}

let klaar = 0, mislukt = 0;
async function zetOver(r) {
  const res = await fetch(r.url, { headers: { "User-Agent": "popkoordivers-import" } });
  if (!res.ok) throw new Error(`download ${res.status}`);
  const body = Buffer.from(await res.arrayBuffer());
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: r.key, Body: body, ContentType: CONTENT_TYPE[r.ext] }));
  const { error } = await supabase.from("bestanden").insert({ naam: r.naam, categorie: r.categorie, datum: r.datum, r2_key: r.key });
  if (error) {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: r.key })).catch(() => {});
    throw new Error(error.message);
  }
}

// Drie tegelijk; de oude server is niet de snelste
const wachtrij = [...todo];
await Promise.all(Array.from({ length: 3 }, async () => {
  for (let r; (r = wachtrij.shift()); ) {
    try {
      await zetOver(r);
      klaar++;
      console.log(`[${klaar + mislukt}/${todo.length}] ${r.naam} (${r.ext})`);
    } catch (e) {
      mislukt++;
      console.error(`[${klaar + mislukt}/${todo.length}] MISLUKT ${r.naam}: ${e.message}`);
    }
  }
}));

console.log(`Klaar: ${klaar} overgezet, ${mislukt} mislukt.${mislukt ? " Draai het script opnieuw om de mislukte opnieuw te proberen." : ""}`);
