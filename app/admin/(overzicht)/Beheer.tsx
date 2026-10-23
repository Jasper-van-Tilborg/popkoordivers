import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { bucketGebruik } from "@/lib/r2";
import { IconCalendar, IconNewspaper, IconCamera, IconFolder } from "@/components/icons";
import { version as nextVersie } from "next/package.json";
import { NL, Zin, geleden } from "../_components/activiteit";
import { DB_MAX, Meter, OMGEVING, R2_MAX, keepaliveOk as isKeepaliveOk, mb, type Status } from "../_components/status";

// Het overzicht voor een beheerder: hoe de site ervoor staat, wie er bij kan en wat er gebeurde.

const tel = (n: number, een: string, meer: string) => `${n} ${n === 1 ? een : meer}`;
const ROLNAAM = { admin: "Beheerder", redacteur: "Redacteur", lid: "Lid" } as const;

export default async function Beheer({ nu }: { nu: Date }) {
  const supabase = await createClient();
  const vandaag = nu.toLocaleDateString("en-CA", { timeZone: NL });

  const [komend, berichten, albums, fotos, bestanden, activiteit, status, openbaar, prive, auth, profielen] = await Promise.all([
    supabase.from("agenda").select("id", { count: "exact", head: true }).gte("datum_sorteer", vandaag).eq("gepubliceerd", true),
    supabase.from("berichten").select("id", { count: "exact", head: true }).eq("gepubliceerd", true),
    supabase.from("albums").select("id", { count: "exact", head: true }),
    supabase.from("fotos").select("id", { count: "exact", head: true }),
    supabase.from("bestanden").select("id", { count: "exact", head: true }),
    supabase.from("activiteit").select("id, wanneer, wie_naam, actie, soort, item_id, item_naam").order("id", { ascending: false }).limit(8),
    supabase.rpc("sitestatus"),
    bucketGebruik("openbaar").catch(() => null),
    bucketGebruik("prive").catch(() => null),
    createAdminClient().auth.admin.listUsers({ perPage: 1000 }),
    supabase.from("profiles").select("id, naam, rol"),
  ]);

  const s = (status.data ?? null) as Status;
  const keepaliveOk = isKeepaliveOk(s, nu);
  const opslag = (openbaar?.bytes ?? 0) + (prive?.bytes ?? 0);
  const r2Ok = !!openbaar && !!prive;
  const ontbreekt = OMGEVING.filter((k) => !process.env[k]);
  // Alles in orde: de site draait, kan bij database en bestanden, en heeft ruimte genoeg
  const allesOk = keepaliveOk && !status.error && r2Ok && ontbreekt.length === 0 && (s?.db_bytes ?? 0) < 0.8 * DB_MAX && opslag < 0.8 * R2_MAX;

  const perId = new Map((profielen.data ?? []).map((p) => [p.id, p]));
  const gebruikers = (auth.data?.users ?? []).map((u) => ({
    id: u.id, naam: perId.get(u.id)?.naam ?? u.email ?? "Onbekend", rol: perId.get(u.id)?.rol ?? "lid", laatst: u.last_sign_in_at ?? null,
  }));
  const perRol = (r: keyof typeof ROLNAAM) => gebruikers.filter((g) => g.rol === r).length;
  const nooit = gebruikers.filter((g) => !g.laatst).length;
  const laatstIngelogd = gebruikers.filter((g) => g.laatst).sort((a, b) => b.laatst!.localeCompare(a.laatst!)).slice(0, 5);

  const oogopslag = [
    { href: "/admin/agenda", icon: <IconCalendar size={16} />, tekst: `${tel(komend.count ?? 0, "optreden", "optredens")} gepland` },
    { href: "/admin/nieuws", icon: <IconNewspaper size={16} />, tekst: `${tel(berichten.count ?? 0, "bericht", "berichten")} online` },
    { href: "/admin/albums", icon: <IconCamera size={16} />, tekst: `${tel(albums.count ?? 0, "album", "albums")}, ${tel(fotos.count ?? 0, "foto", "foto's")}` },
    { href: "/admin/bestanden/liedjes", icon: <IconFolder size={16} />, tekst: `${tel(bestanden.count ?? 0, "bestand", "bestanden")} voor leden` },
  ];

  return (
    <>
      <section className="adm-oogopslag" aria-label="In één oogopslag">
        {oogopslag.map((o) => <Link key={o.href} href={o.href}>{o.icon}{o.tekst}</Link>)}
      </section>

      <div className="adm-grid-overzicht adm-grid-overzicht--rij">
        <section className="adm-blok">
          <div className="adm-blok-kop">
            <h2>Sitestatus <span className="adm-status-pill" data-ok={allesOk || undefined}>{allesOk ? "Alles in orde" : "Let op"}</span></h2>
            <Link href="/admin/sitestatus">Alle details</Link>
          </div>
          <ul className="adm-status-lijst">
            <li data-ok={keepaliveOk || undefined}>
              <span>Supabase actief houden</span>
              <span>{s?.keepalive ? `${keepaliveOk ? "In orde" : "Mislukt"}, ${geleden(s.keepalive.start, nu)}` : "Onbekend"}</span>
            </li>
            <li data-ok={!status.error || undefined}>
              <span>Database</span>
              <span>{status.error ? "Niet bereikbaar" : "Bereikbaar"}</span>
            </li>
            <li data-ok={r2Ok || undefined}>
              <span>Bestanden (Cloudflare R2)</span>
              <span>{r2Ok ? "Bereikbaar" : "Niet bereikbaar"}</span>
            </li>
            <li data-ok={ontbreekt.length === 0 || undefined}>
              <span>Serverinstellingen</span>
              <span>{ontbreekt.length === 0 ? "Alles ingesteld" : `${ontbreekt.length} ontbreken`}</span>
            </li>
          </ul>
          <p className="adm-blok-voet">{process.env.VERCEL_ENV === "production" || (!process.env.VERCEL_ENV && process.env.NODE_ENV === "production") ? "Productie" : "Test"}, Next.js {nextVersie}</p>
        </section>

        <section className="adm-blok">
          <div className="adm-blok-kop"><h2>Opslag</h2><Link href="/admin/sitestatus">Per tabel en map</Link></div>
          <div className="adm-opslag">
            <div>
              <p className="adm-opslag-kop"><span>Database (Supabase)</span><span>{s?.db_bytes ? `${mb(s.db_bytes)} van ${mb(DB_MAX)}` : "Onbekend"}</span></p>
              <Meter waarde={s?.db_bytes ?? 0} max={DB_MAX} />
            </div>
            <div>
              <p className="adm-opslag-kop"><span>Foto&apos;s en bestanden (Cloudflare R2)</span><span>{r2Ok ? `${mb(opslag)} van ${mb(R2_MAX)}` : "Niet bereikbaar"}</span></p>
              <Meter waarde={opslag} max={R2_MAX} />
              {r2Ok && (
                <p className="adm-opslag-detail">
                  Website {tel(openbaar.aantal, "bestand", "bestanden")} ({mb(openbaar.bytes)}), ledenomgeving {tel(prive.aantal, "bestand", "bestanden")} ({mb(prive.bytes)})
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="adm-grid-overzicht">
        <div>
          <section className="adm-blok">
            <div className="adm-blok-kop"><h2>Gebruikers</h2><Link href="/admin/gebruikers">Alle gebruikers</Link></div>
            <dl className="adm-cijfers adm-cijfers--vier">
              <div><dt>Beheerders</dt><dd>{perRol("admin")}</dd></div>
              <div><dt>Redacteuren</dt><dd>{perRol("redacteur")}</dd></div>
              <div><dt>Leden</dt><dd>{perRol("lid")}</dd></div>
              <div><dt>Nooit ingelogd</dt><dd>{nooit}</dd></div>
            </dl>
            {laatstIngelogd.length > 0 && (
              <>
                <p className="adm-blok-subkop">Laatst ingelogd</p>
                <ul className="adm-activiteit">
                  {laatstIngelogd.map((g) => (
                    <li key={g.id}>
                      <span><Link href={`/admin/gebruikers?id=${g.id}`}>{g.naam}</Link> ({ROLNAAM[g.rol].toLowerCase()})</span>
                      <time dateTime={g.laatst!}>{geleden(g.laatst!, nu)}</time>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>

        <div>
          <section className="adm-blok">
            <div className="adm-blok-kop"><h2>Activiteit</h2><Link href="/admin/activiteit">Alle activiteit</Link></div>
            {!activiteit.data?.length ? (
              <p className="adm-blok-leeg">Nog niets gebeurd. Wijzigingen in de admin verschijnen hier.</p>
            ) : (
              <ul className="adm-activiteit">
                {activiteit.data.map((a) => (
                  <li key={a.id}>
                    <span><Zin a={a} /></span>
                    <time dateTime={a.wanneer}>{geleden(a.wanneer, nu)}</time>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
