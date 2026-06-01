import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  type _Object,
} from "@aws-sdk/client-s3";

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
const PUBLIC_BASE = (process.env.CLOUDFLARE_R2_PUBLIC_URL ?? "").replace(/\/$/, "");

export async function uploadFile(
  body: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  await client.send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType })
  );
  return key;
}

export async function deleteFile(key: string): Promise<void> {
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export async function listFiles(prefix: string): Promise<_Object[]> {
  const res = await client.send(
    new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix })
  );
  return res.Contents ?? [];
}

export function getPublicUrl(key: string): string {
  return `${PUBLIC_BASE}/${key}`;
}
