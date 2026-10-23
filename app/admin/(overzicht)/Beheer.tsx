import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { bucketGebruik } from "@/lib/r2";
import { IconCalendar, IconNewspaper, IconCamera, IconFolder } from "@/components/icons";
import { NL, Zin, geleden } from "../_components/activiteit";

// Het overzicht voor een beheerder: hoe de site ervoor staat, wie er bij kan en wat er gebeurde.

const mb = (b: number) => (b < 1e6 ? `${Math.max(0.1, b / 1e6).toFixed(1)} MB` : b < 1e9 ? `${(b / 1e6).toFixed(0)} MB` : `${(b / 1e9).toFixed(2)} GB`);
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

  const s = (status.data ?? null) as { db_bytes?: number; keepalive?: { start: string; status: string } | null; keepalive_http?: number | null } | null;
  const keepaliveOk = s?.keepalive?.status === "succeeded" && (s.keepalive_http ?? 200) < 400 && nu.getTime() - new Date(s.keepalive.start).getTime() < 2 * 864e5;
  const opslag = (openbaar?.bytes ?? 0) + (prive?.bytes ?? 0);

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

      <div className="adm-grid-overzicht">
        <div>
          <section className="adm-blok">
            <div className="adm-blok-kop"><h2>Sitestatus</h2><Link href="/admin/sitestatus">Alle details</Link></div>
            <ul className="adm-status-lijst">
              <li data-ok={keepaliveOk || undefined}>
                <span>Supabase actief houden</span>
                <span>{s?.keepalive ? `${keepaliveOk ? "In orde" : "Mislukt"}, ${geleden(s.keepalive.start, nu)}` : "Onbekend"}</span>
              </li>
              <li data-ok={(s?.db_bytes ?? 0) < 400e6 || undefined}>
                <span>Database</span>
                <span>{s?.db_bytes ? `${mb(s.db_bytes)} van 500 MB` : "Onbekend"}</span>
              </li>
              <li data-ok={(openbaar && prive && opslag < 8e9) || undefined}>
                <span>Opslag (Cloudflare R2)</span>
                <span>{openbaar && prive ? `${mb(opslag)} van 10 GB` : "Niet bereikbaar"}</span>
              </li>
            </ul>
          </section>

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
