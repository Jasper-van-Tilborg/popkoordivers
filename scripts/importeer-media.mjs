// Eenmalige import van de foto's en video's van www.popkoordivers.nl naar albums en video's.
// Eerst de migratie *_media.sql draaien.
//
//   node --env-file=.env.local scripts/importeer-media.mjs [--proef] [--cache <map>]
//
// Wat erin gaat staat in supabase/archief/media-oude-site.json: per album de foto's uit de
// WordPress-mediabibliotheek, de gedeelde Google Foto's-albums waar de oude Foto's-pagina
// naar linkte, en de video's (YouTube en losse mp4's). `impressie` betekent dat de foto op
// het openbare deel van de oude site stond; die komt ook in de openbare bucket.
//
// Eerst wordt alles gedownload naar de cache (standaard in de tijdelijke map van het systeem).
// Dezelfde foto die vaker is geüpload (andere naam, iets ander formaat) gaat er één keer in:
// de grootste blijft. Foto's worden verkleind tot hooguit 2560 px aan de lange kant, zoals
// WordPress ze ook toonde, en zonder metadata (geen GPS) opgeslagen.
// Veilig om vaker te draaien: wat al is overgezet wordt overgeslagen.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
const proef = args.includes("--proef");
const cache = args.includes("--cache") ? args[args.indexOf("--cache") + 1] : join(tmpdir(), "popkoordivers-media");
mkdirSync(cache, { recursive: true });

const MAX = 2560;
const UA = "popkoordivers-import";
const manifest = JSON.parse(readFileSync(new URL("../supabase/archief/media-oude-site.json", import.meta.url), "utf8"));

// Zelfde regels als safeName in lib/r2.ts en slugify in app/admin/albums/actions.ts
const safeName = (name) =>
  name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9._-]/g, "").replace(/-+/g, "-") || "bestand";
const slugify = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "album";

// ── Downloaden, met cache ─────────────────────────────────────────────────────
async function haal(url, naam) {
  const pad = join(cache, naam);
  if (existsSync(pad)) return readFileSync(pad);
  for (let poging = 1; ; poging++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) throw new Error(`download ${res.status}`);
      const type = res.headers.get("content-type") ?? "";
      if (type.includes("html")) throw new Error("kreeg een webpagina in plaats van een bestand");
      const body = Buffer.from(await res.arrayBuffer());
      writeFileSync(pad, body);
      return body;
    } catch (e) {
      if (poging >= 3) throw new Error(`${url}: ${e.message}`);
      await new Promise((r) => setTimeout(r, 2000 * poging));
    }
  }
}

// De items van een gedeeld Google Foto's-album (de link van de oude site)
async function googleAlbum(link) {
  // Met een simpele user-agent stuurt de korte link direct door naar de deelpagina
  const kort = await fetch(link, { redirect: "manual", headers: { "User-Agent": "curl/8" } });
  const deel = kort.headers.get("location");
  if (!deel?.startsWith("https://photos.google.com/share/")) throw new Error(`${link} verwijst niet naar een gedeeld album`);
  const html = await (await fetch(deel, { headers: { "User-Agent": "Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/130 Safari/537.36" } })).text();
  for (const [, data] of html.matchAll(/AF_initDataCallback\(\{key: 'ds:\d+'[^]*?data:([^]*?), sideChannel: \{\}\}\);<\/script>/g)) {
    let j;
    try { j = JSON.parse(data); } catch { continue; }
    if (!Array.isArray(j?.[1]) || typeof j[1][0]?.[0] !== "string" || !j[1][0][0].startsWith("AF1Qip")) continue;
    const totaal = j[3]?.[21];
    if (typeof totaal === "number" && totaal !== j[1].length) throw new Error(`${link}: ${j[1].length} van ${totaal} items gevonden`);
    return j[1].map((it) => ({
      id: it[0], url: it[1][0], ts: it[2],
      // Video's hebben extra metadata onder deze sleutel
      video: JSON.stringify(it.at(-1) ?? {}).includes("76647426"),
    }));
  }
  throw new Error(`${link}: geen foto's gevonden op de deelpagina`);
}

// Twee vingerafdrukken van het beeld: een dHash (64 bits) om snel kandidaten te vinden en
// 64×64 grijswaarden om te bevestigen. Dezelfde foto in een ander formaat of opnieuw
// gecomprimeerd (WhatsApp) verschilt gemiddeld < 3 grijswaarden; een andere foto meer.
async function vingerafdruk(buf) {
  const px = await sharp(buf).rotate().greyscale().resize(9, 8, { fit: "fill" }).raw().toBuffer();
  let bits = 0n;
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) bits = (bits << 1n) | (px[y * 9 + x] > px[y * 9 + x + 1] ? 1n : 0n);
  return { bits, grijs: await sharp(buf).rotate().greyscale().resize(64, 64, { fit: "fill" }).raw().toBuffer() };
}
function zelfdeFoto(a, b) {
  // Serieopnames vanaf een statief zijn ook met deze toets bijna gelijk; een Google-album
  // is door iemand samengesteld, dus daarbinnen is niets dubbel.
  if (a.google && b.google) return false;
  let x = a.hash.bits ^ b.hash.bits, bits = 0;
  while (x) { bits += Number(x & 1n); x >>= 1n; }
  if (bits > 6) return false;
  let som = 0;
  for (let i = 0; i < a.hash.grijs.length; i++) som += Math.abs(a.hash.grijs[i] - b.hash.grijs[i]);
  return som / a.hash.grijs.length < 3;
}

async function verklein(buf) {
  return sharp(buf).rotate().resize(MAX, MAX, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 86, mozjpeg: true }).toBuffer();
}

async function inParallel(lijst, n, werk) {
  const rij = [...lijst];
  await Promise.all(Array.from({ length: n }, async () => { for (let x; (x = rij.shift()); ) await werk(x); }));
}

// ── 1. Alles ophalen en per album ontdubbelen ─────────────────────────────────
const plan = [];
for (const a of manifest.albums) {
  const kandidaten = a.fotos.map((f) => ({
    bron: f.url, cache: `wp-${f.wp}-${safeName(f.url.split("/").pop())}`,
    keyNaam: `wp-${f.wp}.jpg`, impressie: f.impressie, bijschrift: f.bijschrift ?? null,
  }));
  if (a.google) {
    const items = await googleAlbum(a.google.link);
    for (const it of items) {
      if (it.video) { console.warn(`  let op: video in ${a.titel} overgeslagen (${it.id})`); continue; }
      kandidaten.push({ bron: `${it.url}=d`, cache: `gp-${it.id}.jpg`, keyNaam: `gp-${it.id}.jpg`, impressie: a.google.impressie, bijschrift: null, google: true });
    }
  }
  plan.push({ ...a, slug: slugify(`${a.titel}-${a.sorteer}`), kandidaten });
}

const alleFotos = plan.flatMap((a) => a.kandidaten);
let geladen = 0;
await inParallel(alleFotos, 4, async (k) => {
  const buf = await haal(k.bron, k.cache);
  const meta = await sharp(buf).metadata();
  k.pixels = (meta.width ?? 0) * (meta.height ?? 0);
  k.hash = await vingerafdruk(buf);
  if (++geladen % 25 === 0 || geladen === alleFotos.length) console.log(`  opgehaald ${geladen}/${alleFotos.length}`);
});

let dubbel = 0;
for (const a of plan) {
  const groepen = [];
  for (const k of a.kandidaten) {
    const g = groepen.find((g) => g.some((x) => zelfdeFoto(x, k)));
    if (g) g.push(k); else groepen.push([k]);
  }
  // Per groep blijft de grootste, op de plek van de eerste; impressie als één van hen dat was
  a.fotos = groepen.map((g) => {
    const beste = g.reduce((m, k) => (k.pixels > m.pixels ? k : m));
    dubbel += g.length - 1;
    return { ...beste, impressie: g.some((k) => k.impressie), bijschrift: g.find((k) => k.bijschrift)?.bijschrift ?? null };
  });
}

const losseVideos = [...manifest.videos.map((v) => ({ ...v, album: null })),
  ...plan.flatMap((a) => (a.videos ?? []).map((v) => ({ ...v, album: a.slug })))];

console.log(`${plan.length} albums, ${plan.reduce((n, a) => n + a.fotos.length, 0)} foto's (${dubbel} dubbele eruit), ${losseVideos.length} video's`);

// ── 2. Wat er al staat ────────────────────────────────────────────────────────
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data: bestaandeAlbums, error: e1 } = await supabase.from("albums").select("id, slug").in("slug", plan.map((a) => a.slug));
if (e1) throw e1;
const albumId = new Map(bestaandeAlbums.map((a) => [a.slug, a.id]));
const { data: bestaandeFotos, error: e2 } = await supabase.from("fotos").select("r2_key").in("album_id", [...albumId.values()]);
if (e2) throw e2;
const fotoAl = new Set(bestaandeFotos.map((f) => f.r2_key));
const { data: bestaandeVideos, error: e3 } = await supabase.from("videos").select("youtube_id, r2_key");
if (e3 && !proef) throw e3; // bij een proef vóór de migratie bestaat de tabel nog niet
const videoAl = new Set((bestaandeVideos ?? []).flatMap((v) => [v.youtube_id, v.r2_key].filter(Boolean)));

if (proef) {
  for (const a of plan) {
    const nieuw = albumId.has(a.slug) ? a.fotos.filter((f) => !fotoAl.has(`albums/${albumId.get(a.slug)}/${f.keyNaam}`)).length : a.fotos.length;
    console.log(`  ${a.sorteer} ${a.titel.padEnd(42)} ${String(a.fotos.length).padStart(3)} foto's, ${a.fotos.filter((f) => f.impressie).length} openbaar, ${nieuw} nieuw${albumId.has(a.slug) ? "" : " (nieuw album)"}`);
    for (const f of a.fotos.filter((f) => f.bijschrift)) console.log(`      «${f.bijschrift}»`);
  }
  for (const v of losseVideos) {
    const key = v.youtube ?? `videos/wp-${v.wp}.mp4`;
    console.log(`  video ${v.datum} ${v.openbaar ? "openbaar" : "leden   "} ${v.youtube ? "YouTube" : "mp4    "} ${v.titel}${v.album ? ` → ${v.album}` : ""}${videoAl.has(key) ? " (staat er al)" : ""}`);
  }
  process.exit(0);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID, secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY },
});
const PRIVE = process.env.CLOUDFLARE_R2_PRIVATE_BUCKET_NAME;
const OPENBAAR = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const zet = (bucket, key, body, type) => s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: type }));
const weg = (bucket, key) => s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key })).catch(() => {});

// ── 3. Albums en foto's ───────────────────────────────────────────────────────
let klaar = 0, mislukt = 0;
for (const a of plan) {
  if (!albumId.has(a.slug)) {
    const { data, error } = await supabase.from("albums")
      .insert({ slug: a.slug, titel: a.titel, datum: a.datum, datum_sorteer: a.sorteer }).select("id").single();
    if (error) throw new Error(`album ${a.titel}: ${error.message}`);
    albumId.set(a.slug, data.id);
  }
  const id = albumId.get(a.slug);
  const todo = a.fotos.map((f, volgorde) => ({ ...f, volgorde, key: `albums/${id}/${f.keyNaam}` })).filter((f) => !fotoAl.has(f.key));
  await inParallel(todo, 4, async (f) => {
    try {
      const body = await verklein(readFileSync(join(cache, f.cache)));
      await zet(PRIVE, f.key, body, "image/jpeg");
      if (f.impressie) await zet(OPENBAAR, f.key, body, "image/jpeg");
      const { error } = await supabase.from("fotos").insert({
        album_id: id, r2_key: f.key, impressies: f.impressie, volgorde: f.volgorde, bijschrift: f.bijschrift,
      });
      if (error) {
        await weg(PRIVE, f.key);
        if (f.impressie) await weg(OPENBAAR, f.key);
        throw new Error(error.message);
      }
      klaar++;
    } catch (e) {
      mislukt++;
      console.error(`  MISLUKT ${a.titel} ${f.keyNaam}: ${e.message}`);
    }
  });
  console.log(`  ${a.titel}: ${a.fotos.length - todo.length} stonden er al, ${todo.length} nu aan de beurt`);
}

// ── 4. Video's ────────────────────────────────────────────────────────────────
const volgordeVideo = new Map();
for (const v of losseVideos) {
  const key = v.youtube ? null : `videos/wp-${v.wp}.mp4`;
  if (videoAl.has(v.youtube ?? key)) continue;
  try {
    if (key) {
      const body = await haal(v.url, `wp-${v.wp}.mp4`);
      await zet(PRIVE, key, body, "video/mp4");
      if (v.openbaar) await zet(OPENBAAR, key, body, "video/mp4");
    }
    const albumSleutel = v.album ?? "";
    const volgorde = volgordeVideo.get(albumSleutel) ?? 0;
    volgordeVideo.set(albumSleutel, volgorde + 1);
    const { error } = await supabase.from("videos").insert({
      titel: v.titel, datum: v.datum, openbaar: v.openbaar, volgorde,
      album_id: v.album ? albumId.get(v.album) : null,
      youtube_id: v.youtube ?? null, r2_key: key,
    });
    if (error) {
      if (key) { await weg(PRIVE, key); if (v.openbaar) await weg(OPENBAAR, key); }
      throw new Error(error.message);
    }
    klaar++;
    console.log(`  video: ${v.titel}`);
  } catch (e) {
    mislukt++;
    console.error(`  MISLUKT video ${v.titel}: ${e.message}`);
  }
}

console.log(`Klaar: ${klaar} overgezet, ${mislukt} mislukt.${mislukt ? " Draai het script opnieuw om de mislukte opnieuw te proberen." : ""}`);
