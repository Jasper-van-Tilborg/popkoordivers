// Eenmalige import van de opnames van www.popkoordivers.nl (WP-Filebase, pagina "Opnames")
// naar Opnames: elk bestand naar de privé R2-bucket en een rij in `bestanden`.
//
//   node --env-file=.env.local scripts/importeer-opnames.mjs <inventaris.csv> [--proef] [--max N]
//
// De inventaris is een CSV (;) met de kolommen overzetten, tabblad, stemgroep, naam, type, grootte, url.
// Veilig om vaker te draaien: bestanden die al zijn overgezet worden overgeslagen.

import { readFileSync } from "node:fs";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
const csvPad = args.find((a) => !a.startsWith("--"));
const proef = args.includes("--proef");
const max = args.includes("--max") ? Number(args[args.indexOf("--max") + 1]) : Infinity;
if (!csvPad) {
  console.error("Gebruik: node --env-file=.env.local scripts/importeer-opnames.mjs <inventaris.csv> [--proef] [--max N]");
  process.exit(1);
}

const STEMGROEPEN = ["Sopraan", "Mezzo", "Alt", "Tenor", "Bas"];
const CONTENT_TYPE = { mp3: "audio/mpeg", m4a: "audio/mp4", wav: "audio/wav", wma: "audio/x-ms-wma", mp4: "video/mp4", pdf: "application/pdf" };

// Zelfde regels als safeName in lib/r2.ts
const safeName = (name) =>
  name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9._-]/g, "").replace(/-+/g, "-") || "bestand";

function leesCsv(tekst) {
  const regels = [];
  let rij = [], veld = "", quote = false;
  for (let i = 0; i < tekst.length; i++) {
    const c = tekst[i];
    if (quote) {
      if (c === '"' && tekst[i + 1] === '"') { veld += '"'; i++; }
      else if (c === '"') quote = false;
      else veld += c;
    } else if (c === '"') quote = true;
    else if (c === ";") { rij.push(veld); veld = ""; }
    else if (c === "\n") { rij.push(veld.replace(/\r$/, "")); regels.push(rij); rij = []; veld = ""; }
    else veld += c;
  }
  if (veld || rij.length) { rij.push(veld); regels.push(rij); }
  const [kop, ...rest] = regels;
  return rest.filter((r) => r.length === kop.length).map((r) => Object.fromEntries(kop.map((k, i) => [k.trim(), r[i].trim()])));
}

const rijen = leesCsv(readFileSync(csvPad, "utf8").replace(/^﻿/, ""))
  .filter((r) => r.overzetten.toLowerCase() !== "nee")
  .map((r) => {
    const bestandsnaam = decodeURIComponent(new URL(r.url).pathname.split("/").pop());
    return {
      ...r,
      stemgroep: STEMGROEPEN.includes(r.stemgroep) ? r.stemgroep : null,
      key: `bestanden/liedjes/wp-${safeName(r.tabblad)}-${safeName(bestandsnaam)}`,
    };
  });

const onbekend = rijen.filter((r) => r.stemgroep === null && r.tabblad !== "Compleet");
if (onbekend.length) {
  console.error("Onbekende stemgroep:", onbekend.map((r) => `${r.tabblad} / ${r.naam}`));
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

const { data: bestaand, error } = await supabase.from("bestanden").select("r2_key").like("r2_key", "bestanden/liedjes/wp-%");
if (error) throw error;
const al = new Set(bestaand.map((b) => b.r2_key));
const todo = rijen.filter((r) => !al.has(r.key)).slice(0, max);

console.log(`${rijen.length} in de inventaris, ${al.size} al overgezet, ${todo.length} nu aan de beurt${proef ? " (proef)" : ""}`);
if (proef) {
  for (const r of todo.slice(0, 20)) console.log(`  ${r.stemgroep ?? "Alle stemgroepen"} | ${r.naam} → ${r.key}`);
  process.exit(0);
}

let klaar = 0, mislukt = 0;
async function zetOver(r) {
  const res = await fetch(r.url);
  if (!res.ok) throw new Error(`download ${res.status}`);
  const body = Buffer.from(await res.arrayBuffer());
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: r.key, Body: body, ContentType: CONTENT_TYPE[r.type] ?? "application/octet-stream" }));
  const { error } = await supabase.from("bestanden").insert({ naam: r.naam, categorie: "opnames", stemgroep: r.stemgroep, r2_key: r.key });
  if (error) {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: r.key })).catch(() => {});
    throw new Error(error.message);
  }
}

// Vier tegelijk; rustig genoeg voor de oude server
const wachtrij = [...todo];
await Promise.all(Array.from({ length: 4 }, async () => {
  for (let r; (r = wachtrij.shift()); ) {
    try {
      await zetOver(r);
      klaar++;
      console.log(`[${klaar + mislukt}/${todo.length}] ${r.stemgroep ?? "Alle"} | ${r.naam}`);
    } catch (e) {
      mislukt++;
      console.error(`[${klaar + mislukt}/${todo.length}] MISLUKT ${r.naam}: ${e.message}`);
    }
  }
}));

console.log(`Klaar: ${klaar} overgezet, ${mislukt} mislukt.${mislukt ? " Draai het script opnieuw om de mislukte opnieuw te proberen." : ""}`);
