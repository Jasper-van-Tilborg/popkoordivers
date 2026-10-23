// Gedeeld door het overzicht van beheerders en Beheer → Sitestatus: hoe de
// techniek ervoor staat en hoe vol de opslag is.

export const DB_MAX = 500e6;   // gratis Supabase-database
export const R2_MAX = 10e9;    // gratis opslag bij Cloudflare R2

export const OMGEVING = [
  "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY",
  "CLOUDFLARE_R2_ACCOUNT_ID", "CLOUDFLARE_R2_ACCESS_KEY_ID", "CLOUDFLARE_R2_SECRET_ACCESS_KEY",
  "CLOUDFLARE_R2_BUCKET_NAME", "CLOUDFLARE_R2_PRIVATE_BUCKET_NAME", "CLOUDFLARE_R2_PUBLIC_URL",
];

// 0.2 MB, 13 MB, 1.25 GB, 10 GB
export const mb = (b: number) => (b < 1e6 ? `${Math.max(0.1, b / 1e6).toFixed(1)} MB` : b < 1e9 ? `${(b / 1e6).toFixed(0)} MB` : `${(b / 1e9).toFixed(2).replace(/\.?0+$/, "")} GB`);

// Wat supabase.rpc("sitestatus") teruggeeft
export type Status = {
  db_bytes?: number;
  keepalive?: { start: string; status: string } | null;
  keepalive_runs?: { start: string; status: string; bericht: string | null }[] | null;
  keepalive_http?: number | null;
} | null;

// De keepalive is in orde als de laatste run lukte, niet langer dan twee dagen geleden
export const keepaliveOk = (s: Status, nu: Date) =>
  s?.keepalive?.status === "succeeded" && (s.keepalive_http ?? 200) < 400 && nu.getTime() - new Date(s.keepalive.start).getTime() < 2 * 864e5;

// Een balk die laat zien hoe vol iets is; rood vanaf 80%
export function Meter({ waarde, max }: { waarde: number; max: number }) {
  const p = Math.min(100, (waarde / max) * 100);
  return <span className="adm-meter" aria-hidden="true"><span style={{ width: `${Math.max(p, 1)}%` }} data-vol={p > 80 || undefined} /></span>;
}
