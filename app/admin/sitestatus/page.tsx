import { redirect } from "next/navigation";
import { version as nextVersie } from "next/package.json";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { bucketGebruik } from "@/lib/r2";
import { NL, geleden } from "../_components/activiteit";

const mb = (b: number) => (b < 1e6 ? `${Math.max(0.1, b / 1e6).toFixed(1)} MB` : b < 1e9 ? `${(b / 1e6).toFixed(0)} MB` : `${(b / 1e9).toFixed(2)} GB`);
const tel = (n: number, een: string, meer: string) => `${n} ${n === 1 ? een : meer}`;
const tijd = (iso: string) => new Date(iso).toLocaleString("nl-NL", { timeZone: NL, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

const TABELLEN = [
  { naam: "agenda", label: "Optredens" },
  { naam: "berichten", label: "Nieuwsberichten" },
  { naam: "albums", label: "Albums" },
  { naam: "fotos", label: "Foto's" },
  { naam: "bestanden", label: "Bestanden" },
  { naam: "groepsleden", label: "In bestuur en commissies" },
  { naam: "profiles", label: "Accounts" },
  { naam: "activiteit", label: "Regels in de activiteit" },
] as const;

const OMGEVING = [
  "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY",
  "CLOUDFLARE_R2_ACCOUNT_ID", "CLOUDFLARE_R2_ACCESS_KEY_ID", "CLOUDFLARE_R2_SECRET_ACCESS_KEY",
  "CLOUDFLARE_R2_BUCKET_NAME", "CLOUDFLARE_R2_PRIVATE_BUCKET_NAME", "CLOUDFLARE_R2_PUBLIC_URL",
];

function Meter({ waarde, max }: { waarde: number; max: number }) {
  const p = Math.min(100, (waarde / max) * 100);
  return <span className="adm-meter" aria-hidden="true"><span style={{ width: `${Math.max(p, 1)}%` }} data-vol={p > 80 || undefined} /></span>;
}

export default async function SitestatusPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: ik } = await supabase.from("profiles").select("rol").eq("id", user?.id ?? "").single();
  if (ik?.rol !== "admin") redirect("/admin");

  const nu = new Date();
  const admin = createAdminClient();
  const [status, openbaar, prive, rollen, ...tellingen] = await Promise.all([
    supabase.rpc("sitestatus"),
    bucketGebruik("openbaar").catch(() => null),
    bucketGebruik("prive").catch(() => null),
    admin.from("profiles").select("rol"),
    ...TABELLEN.map((t) => admin.from(t.naam).select("*", { count: "exact", head: true })),
  ]);

  const s = (status.data ?? null) as {
    db_bytes?: number;
    keepalive?: { start: string; status: string } | null;
    keepalive_runs?: { start: string; status: string; bericht: string | null }[] | null;
    keepalive_http?: number | null;
  } | null;
  const keepaliveOk = s?.keepalive?.status === "succeeded" && (s.keepalive_http ?? 200) < 400 && nu.getTime() - new Date(s.keepalive.start).getTime() < 2 * 864e5;
  const opslag = (openbaar?.bytes ?? 0) + (prive?.bytes ?? 0);
  const perRol = (r: string) => (rollen.data ?? []).filter((p) => p.rol === r).length;
  const ontbreekt = OMGEVING.filter((k) => !process.env[k]);

  const ref = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").match(/https:\/\/([^.]+)\./)?.[1];
  const links = [
    { label: "Supabase", uitleg: "database en inloggen", href: ref ? `https://supabase.com/dashboard/project/${ref}` : "https://supabase.com/dashboard" },
    { label: "Cloudflare R2", uitleg: "foto's en bestanden", href: `https://dash.cloudflare.com/${process.env.CLOUDFLARE_R2_ACCOUNT_ID ?? ""}/r2/overview` },
    { label: "Vercel", uitleg: "hosting en deploys", href: "https://vercel.com/jasper-van-tilborgs-projects/popkoordivers" },
    { label: "GitHub", uitleg: "de code", href: "https://github.com/Jasper-van-Tilborg/popkoordivers" },
  ];

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Sitestatus</h1>
          <p className="adm-sub">Hoe de techniek achter de website ervoor staat. Bijgewerkt op {tijd(nu.toISOString())}.</p>
        </div>
      </header>

      <div className="adm-content">
        <div className="adm-grid-overzicht">
          <div>
            <section className="adm-blok">
              <div className="adm-blok-kop"><h2>Supabase actief houden</h2></div>
              <p className="adm-blok-tekst">
                Een gratis Supabase-project wordt na 7 dagen zonder verkeer gepauzeerd. Daarom doet de database elke nacht om 03:00 een verzoek op zichzelf.
              </p>
              <ul className="adm-status-lijst">
                <li data-ok={keepaliveOk || undefined}>
                  <span>Laatste keer</span>
                  <span>{s?.keepalive ? `${keepaliveOk ? "In orde" : "Mislukt"}, ${geleden(s.keepalive.start, nu)}` : "Onbekend"}</span>
                </li>
              </ul>
              {!!s?.keepalive_runs?.length && (
                <ul className="adm-list adm-logboek adm-logboek--datum">
                  {s.keepalive_runs.map((r) => (
                    <li key={r.start}>
                      <time>{tijd(r.start)}</time>
                      <span>{r.status === "succeeded" ? "Gelukt" : `Mislukt${r.bericht ? `: ${r.bericht}` : ""}`}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="adm-blok">
              <div className="adm-blok-kop"><h2>Database</h2></div>
              <ul className="adm-status-lijst">
                <li data-ok={(s?.db_bytes ?? 0) < 400e6 || undefined}>
                  <span>Gebruikt</span>
                  <span>{s?.db_bytes ? `${mb(s.db_bytes)} van 500 MB` : "Onbekend"}</span>
                </li>
              </ul>
              {s?.db_bytes ? <div className="adm-meter-rij"><Meter waarde={s.db_bytes} max={500e6} /></div> : null}
              <dl className="adm-cijfers">
                {TABELLEN.map((t, i) => (
                  <div key={t.naam}><dt>{t.label}</dt><dd>{tellingen[i].count ?? "?"}</dd></div>
                ))}
              </dl>
            </section>
          </div>

          <div>
            <section className="adm-blok">
              <div className="adm-blok-kop"><h2>Opslag (Cloudflare R2)</h2></div>
              <ul className="adm-status-lijst">
                <li data-ok={(openbaar && prive && opslag < 8e9) || undefined}>
                  <span>Gebruikt</span>
                  <span>{openbaar && prive ? `${mb(opslag)} van 10 GB gratis` : "Niet bereikbaar"}</span>
                </li>
              </ul>
              <div className="adm-meter-rij"><Meter waarde={opslag} max={10e9} /></div>
              <dl className="adm-cijfers">
                <div><dt>Website (openbaar)</dt><dd>{openbaar ? `${tel(openbaar.aantal, "bestand", "bestanden")}, ${mb(openbaar.bytes)}` : "?"}</dd></div>
                <div><dt>Ledenomgeving (privé)</dt><dd>{prive ? `${tel(prive.aantal, "bestand", "bestanden")}, ${mb(prive.bytes)}` : "?"}</dd></div>
              </dl>
            </section>

            <section className="adm-blok">
              <div className="adm-blok-kop"><h2>Accounts</h2></div>
              <dl className="adm-cijfers">
                <div><dt>Beheerders</dt><dd>{perRol("admin")}</dd></div>
                <div><dt>Redacteuren</dt><dd>{perRol("redacteur")}</dd></div>
                <div><dt>Leden</dt><dd>{perRol("lid")}</dd></div>
              </dl>
            </section>

            <section className="adm-blok">
              <div className="adm-blok-kop"><h2>Omgeving</h2></div>
              <ul className="adm-status-lijst">
                <li data-ok={ontbreekt.length === 0 || undefined}>
                  <span>Instellingen van de server</span>
                  <span>{ontbreekt.length === 0 ? "Alles ingesteld" : `Ontbreekt: ${ontbreekt.join(", ")}`}</span>
                </li>
              </ul>
              <dl className="adm-cijfers">
                <div><dt>Next.js</dt><dd>{nextVersie}</dd></div>
                <div><dt>Node.js</dt><dd>{process.versions.node}</dd></div>
                <div><dt>Omgeving</dt><dd>{process.env.VERCEL_ENV ?? process.env.NODE_ENV}</dd></div>
              </dl>
            </section>

            <section className="adm-blok">
              <div className="adm-blok-kop"><h2>Dashboards</h2></div>
              <ul className="adm-dashboards">
                {links.map((l) => (
                  <li key={l.label}><a href={l.href} target="_blank" rel="noopener"><strong>{l.label}</strong><span>{l.uitleg}</span></a></li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
