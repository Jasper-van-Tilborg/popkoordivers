import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Twee buckets:
// - openbaar: alles wat op de publieke website staat (nieuwsfoto's, impressies)
// - prive:    alles uit de ledenomgeving (albumfoto's, bladmuziek, nieuwsbrieven)
export type Bucket = "openbaar" | "prive";

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKETS: Record<Bucket, string> = {
  openbaar: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
  prive: process.env.CLOUDFLARE_R2_PRIVATE_BUCKET_NAME!,
};
const PUBLIC_BASE = (process.env.CLOUDFLARE_R2_PUBLIC_URL ?? "").replace(/\/$/, "");

export function getPublicUrl(key: string): string {
  return `${PUBLIC_BASE}/${key}`;
}

// Omgekeerd: de key van een URL uit de openbare bucket (null als het een andere URL is)
export function keyFromPublicUrl(url: string): string | null {
  return PUBLIC_BASE && url.startsWith(`${PUBLIC_BASE}/`) ? url.slice(PUBLIC_BASE.length + 1) : null;
}

// Tijdelijke link waarmee de browser zelf een bestand uploadt (geen limiet van Vercel)
export function uploadUrl(bucket: Bucket, key: string, contentType: string): Promise<string> {
  return getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: BUCKETS[bucket], Key: key, ContentType: contentType }),
    { expiresIn: 600 }
  );
}

// Tijdelijke link om een bestand uit de privé bucket te openen
export function downloadUrl(key: string, expiresIn = 3600): Promise<string> {
  return getSignedUrl(client, new GetObjectCommand({ Bucket: BUCKETS.prive, Key: key }), { expiresIn });
}

export async function deleteFile(bucket: Bucket, key: string): Promise<void> {
  await client.send(new DeleteObjectCommand({ Bucket: BUCKETS[bucket], Key: key }));
}

// Zet een kopie van een privé bestand in de openbare bucket, onder dezelfde key
export async function copyToPublic(key: string): Promise<void> {
  await client.send(
    new CopyObjectCommand({ Bucket: BUCKETS.openbaar, Key: key, CopySource: `${BUCKETS.prive}/${encodeURIComponent(key)}` })
  );
}

// Veilige bestandsnaam voor in een key: "Mijn foto (1).JPG" → "mijn-foto-1.jpg"
export function safeName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9._-]/g, "").replace(/-+/g, "-") || "bestand";
}

// Hoeveel er in een bucket staat (voor de sitestatus op het overzicht)
export async function bucketGebruik(bucket: Bucket): Promise<{ aantal: number; bytes: number }> {
  let aantal = 0, bytes = 0, token: string | undefined;
  do {
    const r = await client.send(new ListObjectsV2Command({ Bucket: BUCKETS[bucket], ContinuationToken: token }));
    for (const o of r.Contents ?? []) { aantal++; bytes += o.Size ?? 0; }
    token = r.IsTruncated ? r.NextContinuationToken : undefined;
  } while (token);
  return { aantal, bytes };
}
