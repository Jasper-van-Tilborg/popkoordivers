import Link from "next/link";
import { redirect } from "next/navigation";
import { huidigeSessie } from "@/lib/auth";
import { NL, Zin, type ActiviteitRegel } from "../_components/activiteit";

const PER_PAGINA = 50;

const FILTERS = [
  { id: "",          label: "Alles",          soorten: null },
  { id: "agenda",    label: "Agenda",         soorten: ["optreden"] },
  { id: "nieuws",    label: "Nieuws",         soorten: ["bericht"] },
  { id: "media",     label: "Media",          soorten: ["album", "foto"] },
  { id: "bestanden", label: "Ledenomgeving",  soorten: ["bestand", "groep"] },
  { id: "gebruikers", label: "Gebruikers",    soorten: ["lid"] },
];

const dagTitel = (iso: string, nu: Date) => {
  const dag = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: NL });
  const gisteren = new Date(nu.getTime() - 864e5);
  if (dag(new Date(iso)) === dag(nu)) return "Vandaag";
  if (dag(new Date(iso)) === dag(gisteren)) return "Gisteren";
  const t = new Date(iso).toLocaleDateString("nl-NL", { timeZone: NL, weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return t.charAt(0).toUpperCase() + t.slice(1);
};

export default async function ActiviteitPage({ searchParams }: { searchParams: Promise<{ soort?: string; wie?: string; voor?: string }> }) {
  const { soort = "", wie = "", voor } = await searchParams;
  const ik = await huidigeSessie();
  if (ik?.rol !== "admin") redirect("/admin");
  const { supabase } = ik;

  const filter = FILTERS.find((f) => f.id === soort) ?? FILTERS[0];
  let q = supabase.from("activiteit").select("id, wanneer, wie, wie_naam, actie, soort, item_id, item_naam").order("id", { ascending: false }).limit(PER_PAGINA + 1);
  if (filter.soorten) q = q.in("soort", filter.soorten);
  if (wie) q = q.eq("wie", wie);
  if (voor) q = q.lt("id", Number(voor));
  const [{ data }, { data: mensen }] = await Promise.all([
    q,
    supabase.from("activiteit").select("wie, wie_naam").order("id", { ascending: false }).limit(500),
  ]);

  const regels = (data ?? []).slice(0, PER_PAGINA) as (ActiviteitRegel & { wie: string | null })[];
  const meer = (data ?? []).length > PER_PAGINA;
  const personen = [...new Map((mensen ?? []).filter((m) => m.wie).map((m) => [m.wie!, m.wie_naam ?? "Onbekend"])).entries()];
  const nu = new Date();

  const dagen: { titel: string; regels: typeof regels }[] = [];
  for (const r of regels) {
    const titel = dagTitel(r.wanneer, nu);
    const laatste = dagen[dagen.length - 1];
    if (laatste?.titel === titel) laatste.regels.push(r);
    else dagen.push({ titel, regels: [r] });
  }

  const url = (p: Record<string, string | undefined>) => {
    const s = new URLSearchParams(Object.entries({ soort, wie, ...p }).filter(([, v]) => v) as [string, string][]).toString();
    return `/admin/activiteit${s ? `?${s}` : ""}`;
  };

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Activiteit</h1>
          <p className="adm-sub">Wie wat heeft gedaan in de admin. Alleen beheerders zien dit.</p>
        </div>
      </header>

      <div className="adm-toolbar">
        <nav className="adm-filters" aria-label="Soort">
          {FILTERS.map((f) => (
            <Link key={f.id} href={url({ soort: f.id || undefined, voor: undefined })} aria-current={f.id === filter.id ? "true" : undefined}>{f.label}</Link>
          ))}
        </nav>
        {personen.length > 1 && (
          <nav className="adm-filters" aria-label="Persoon">
            <Link href={url({ wie: undefined, voor: undefined })} aria-current={!wie ? "true" : undefined}>Iedereen</Link>
            {personen.map(([id, naam]) => (
              <Link key={id} href={url({ wie: id, voor: undefined })} aria-current={wie === id ? "true" : undefined}>{naam}</Link>
            ))}
          </nav>
        )}
      </div>

      <div className="adm-content">
        {dagen.length === 0 ? (
          <div className="adm-empty"><p className="adm-empty-title">Geen activiteit gevonden</p><p>Wijzigingen in de admin verschijnen hier vanzelf.</p></div>
        ) : dagen.map((d) => (
          <section key={d.titel} className="adm-group">
            <h2 className="adm-group-title">{d.titel}</h2>
            <ul className="adm-list adm-logboek">
              {d.regels.map((r) => (
                <li key={r.id}>
                  <time dateTime={r.wanneer}>{new Date(r.wanneer).toLocaleTimeString("nl-NL", { timeZone: NL, hour: "2-digit", minute: "2-digit" })}</time>
                  <span><Zin a={r} /></span>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {meer && (
          <div style={{ marginTop: 20 }}>
            <Link className="adm-btn adm-btn--ghost" href={url({ voor: String(regels[regels.length - 1].id) })}>Oudere activiteit</Link>
          </div>
        )}
      </div>
    </div>
  );
}
