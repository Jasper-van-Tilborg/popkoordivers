// Maakt de kleine versie (800 px, voor rasters en albumomslagen) van albumfoto's die er
// nog geen hebben. Nieuwe uploads in de admin krijgen hem al vanzelf. Eerst de
// migratie *_foto_klein.sql draaien.
//
//   node --env-file=.env.local scripts/maak-klein.mjs [--proef]
//
// Veilig om vaker te draaien: foto's met een kleine versie worden overgeslagen.

import sharp from "sharp";
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";

const proef = process.argv.includes("--proef");
const KLEIN = 800;

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID, secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY },
});
const PRIVE = process.env.CLOUDFLARE_R2_PRIVATE_BUCKET_NAME;
const OPENBAAR = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const { data: fotos, error } = await supabase.from("fotos").select("id, album_id, r2_key, impressies").is("klein_key", null);
if (error) throw error;
console.log(`${fotos.length} foto's zonder kleine versie${proef ? " (proef)" : ""}`);
if (proef) process.exit(0);

let klaar = 0, mislukt = 0;
const rij = [...fotos];
await Promise.all(Array.from({ length: 6 }, async () => {
  for (let f; (f = rij.shift()); ) {
    // albums/<id>/<naam>.jpg → albums/<id>/klein/<naam>.jpg
    const key = `albums/${f.album_id}/klein/${f.r2_key.split("/").pop().replace(/\.[^.]+$/, "")}.jpg`;
    try {
      const res = await s3.send(new GetObjectCommand({ Bucket: PRIVE, Key: f.r2_key }));
      const groot = Buffer.from(await res.Body.transformToByteArray());
      const klein = await sharp(groot).rotate().resize(KLEIN, KLEIN, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
      await s3.send(new PutObjectCommand({ Bucket: PRIVE, Key: key, Body: klein, ContentType: "image/jpeg" }));
      if (f.impressies) await s3.send(new PutObjectCommand({ Bucket: OPENBAAR, Key: key, Body: klein, ContentType: "image/jpeg" }));
      const { error } = await supabase.from("fotos").update({ klein_key: key }).eq("id", f.id);
      if (error) {
        await s3.send(new DeleteObjectCommand({ Bucket: PRIVE, Key: key })).catch(() => {});
        if (f.impressies) await s3.send(new DeleteObjectCommand({ Bucket: OPENBAAR, Key: key })).catch(() => {});
        throw new Error(error.message);
      }
      if (++klaar % 25 === 0) console.log(`  ${klaar}/${fotos.length}`);
    } catch (e) {
      mislukt++;
      console.error(`  MISLUKT ${f.r2_key}: ${e.message}`);
    }
  }
}));
console.log(`Klaar: ${klaar} kleine versies gemaakt, ${mislukt} mislukt.`);
