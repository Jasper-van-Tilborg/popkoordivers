// Eenmalige import van de choreografie van www.popkoordivers.nl (WP-Filebase, pagina "Choreo")
// naar Choreografie: elk bestand naar de privé R2-bucket en een rij in `bestanden`.
//
//   node --env-file=.env.local scripts/importeer-choreo.mjs [--proef] [--bewaar <uit.json>]
//
// Haalt de pagina zelf op met WP_USER en WP_APP_PASSWORD. De namen gaan zonder "CHOREO",
// datumcode en soort ("video", "doc"): "CHOREO Skyfall 230111 video 064" wordt naam
// "Skyfall" met liednummer 64. Of het een video of een beschrijving is, zegt de bestandsoort.
// Veilig om vaker te draaien: bestanden die al zijn overgezet worden overgeslagen.

import { writeFileSync } from "node:fs";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
const proef = args.includes("--proef");
const bewaar = args.includes("--bewaar") ? args[args.indexOf("--bewaar") + 1] : null;

const CONTENT_TYPE = {
  mp4: "video/mp4",
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

// De pagina Choreo (452) zoals WordPress hem toont: één tabel met alle bestanden
const auth = Buffer.from(`${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`).toString("base64");
const res = await fetch("https://www.popkoordivers.nl/wp-json/wp/v2/pages/452?context=edit", {
  headers: { Authorization: `Basic ${auth}`, "User-Agent": "popkoordivers-import" },
});
if (!res.ok) throw new Error(`WordPress gaf ${res.status}`);
const html = (await res.json()).content.rendered;
const wp = [...html.matchAll(/<tr><td><a href="([^"]+)">(.*?)<\/a><\/td>/g)].map(([, url, naam]) => ({ naam: unescape(naam).trim(), url }));
if (!wp.length) throw new Error("Geen bestanden gevonden op de pagina Choreo");
if (bewaar) writeFileSync(bewaar, JSON.stringify(wp, null, 1) + "\n");

const NUMMER = /\s(\d{3})$/;
const rijen = wp.map((b) => {
  const bestandsnaam = decodeURIComponent(new URL(b.url).pathname.split("/").pop());
  const nummer = b.naam.match(NUMMER)?.[1];
  const naam = b.naam
    .replace(/^CHOREO\s+/i, "")
    .replace(NUMMER, "")
    .replace(/(^|\s)\d{6,8}(?=\s|$)/g, "")
    .replace(/(^|\s)(video|doc)(?=\s|$)/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const ext = bestandsnaam.split(".").pop().toLowerCase();
  return { ...b, naam, liednummer: nummer ? Number(nummer) : null, ext, key: `bestanden/choreo/wp-${safeName(bestandsnaam)}` };
});

const onbekend = rijen.filter((r) => !CONTENT_TYPE[r.ext]);
if (onbekend.length) {
  console.error("Onbekende bestandsoort:", onbekend.map((r) => r.url));
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

const { data: bestaand, error } = await supabase.from("bestanden").select("r2_key").like("r2_key", "bestanden/choreo/wp-%");
if (error) throw error;
const al = new Set(bestaand.map((b) => b.r2_key));
const todo = rijen.filter((r) => !al.has(r.key));

console.log(`${rijen.length} op de oude site, ${al.size} al overgezet, ${todo.length} nu aan de beurt${proef ? " (proef)" : ""}`);
if (proef) {
  for (const r of todo) console.log(`  ${String(r.liednummer ?? "").padStart(3, "0")} | ${r.naam} | ${r.ext} → ${r.key}`);
  process.exit(0);
}

let klaar = 0, mislukt = 0;
async function zetOver(r) {
  const res = await fetch(r.url);
  if (!res.ok) throw new Error(`download ${res.status}`);
  const body = Buffer.from(await res.arrayBuffer());
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: r.key, Body: body, ContentType: CONTENT_TYPE[r.ext] }));
  const { error } = await supabase.from("bestanden").insert({ naam: r.naam, categorie: "choreo", liednummer: r.liednummer, r2_key: r.key });
  if (error) {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: r.key })).catch(() => {});
    throw new Error(error.message);
  }
}

// Drie tegelijk; de video's zijn groot en de oude server is niet de snelste
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
