import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import DetailKop from "@/components/DetailKop";
import { IconCalendar, IconClock, IconMapPin } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Vandaag in Nederland, als 2026-11-02 (zoals datum_sorteer)
const vandaag = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam" }).format(new Date());

// Dag, maand en weekdag uit datum_sorteer; zonder die datum alleen de tekst zoals ingevoerd
function datumDelen(datum: string, sorteer: string | null) {
  if (!sorteer) return { dag: null, maand: null, jaar: null, weekdag: null, voluit: datum };
  const d = new Date(`${sorteer}T12:00:00Z`);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("nl-NL", { timeZone: "UTC", ...o }).format(d);
  const weekdag = f({ weekday: "long" });
  return {
    dag: f({ day: "numeric" }),
    maand: f({ month: "long" }),
    jaar: f({ year: "numeric" }),
    weekdag,
    voluit: `${weekdag[0].toUpperCase()}${weekdag.slice(1)} ${f({ day: "numeric", month: "long", year: "numeric" })}`,
  };
}

function nogDagen(sorteer: string) {
  const dagen = Math.round((Date.parse(sorteer) - Date.parse(vandaag())) / 86_400_000);
  return dagen <= 0 ? "Vandaag" : dagen === 1 ? "Morgen" : `Over ${dagen} dagen`;
}

export default async function AgendaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: event }, { data: komend }] = await Promise.all([
    supabase.from("agenda").select("*").eq("id", Number(id)).eq("gepubliceerd", true).single(),
    supabase.from("agenda").select("id, titel, datum, datum_sorteer, locatie").eq("gepubliceerd", true).neq("id", Number(id)).gte("datum_sorteer", vandaag()).order("datum_sorteer").limit(3),
  ]);

  if (!event) notFound();

  const isKomend = !event.datum_sorteer || event.datum_sorteer >= vandaag();
  const datum = datumDelen(event.datum, event.datum_sorteer);
  const meer = komend ?? [];
  const route = event.locatie && `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.locatie)}`;

  return (
    <>
      <Navbar />
      <main className="detail">

        <DetailKop
          terug={{ href: "/agenda", label: "Terug naar agenda" }}
          meta={<>
            <span className="detail-chip">{isKomend ? "Komend optreden" : "Afgelopen optreden"}</span>
            {isKomend && event.datum_sorteer && <span>{nogDagen(event.datum_sorteer)}</span>}
          </>}
          titel={event.titel}
        />

        <section className="detail-kaart-vlak">
          <Reveal>
            <article className="detail-kaart">
              <div className="ad-kern">
                <div className="ad-datum" aria-hidden="true">
                  {datum.dag ? (
                    <>
                      <span className="ad-datum-weekdag">{datum.weekdag}</span>
                      <strong>{datum.dag}</strong>
                      <span>{datum.maand}</span>
                      <span className="ad-datum-jaar">{datum.jaar}</span>
                    </>
                  ) : (
                    <IconCalendar size={34} />
                  )}
                </div>
                <dl className="ad-feiten">
                  <div>
                    <dt><IconCalendar size={18} /> Datum</dt>
                    <dd>{datum.voluit}</dd>
                  </div>
                  {event.tijd && (
                    <div>
                      <dt><IconClock size={18} /> Tijd</dt>
                      <dd>{event.tijd} uur</dd>
                    </div>
                  )}
                  {event.locatie && (
                    <div>
                      <dt><IconMapPin size={18} /> Locatie</dt>
                      <dd>
                        {event.locatie}
                        {route && <a href={route} target="_blank" rel="noopener noreferrer" className="ad-route">Route plannen →</a>}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {(event.beschrijving || event.link || event.fotos_url || !isKomend) && (
                <div className="ad-verder">
                  {event.beschrijving && <p className="ad-beschrijving">{event.beschrijving}</p>}
                  {(event.link || event.fotos_url || !isKomend) && (
                    <div className="ad-knoppen">
                      {event.link && (
                        <a href={event.link} target="_blank" rel="noopener noreferrer" className="btn btn--primary">Meer info en kaartjes →</a>
                      )}
                      {event.fotos_url ? (
                        <a href={event.fotos_url} className="btn btn--soft">Foto&apos;s bekijken →</a>
                      ) : !isKomend && (
                        <Link href="/leden/fotos#optredens" className="btn btn--soft">Foto&apos;s in de ledenomgeving →</Link>
                      )}
                    </div>
                  )}
                </div>
              )}
            </article>
          </Reveal>
        </section>

        {meer.length > 0 && (
          <section className="detail-meer">
            <div className="detail-binnen">
              <h2>{isKomend ? "Meer optredens" : "Onze komende optredens"}</h2>
              <div className="detail-meer-rij">
                {meer.map((o, i) => {
                  const d = datumDelen(o.datum, o.datum_sorteer);
                  return (
                    <Reveal key={o.id} delay={i * 80}>
                      <Link href={`/agenda/${o.id}`} className="detail-meer-kaart ad-meer-kaart">
                        <span className="ad-meer-datum">
                          <strong>{d.dag}</strong>
                          <span>{d.maand?.slice(0, 3)}</span>
                        </span>
                        <span className="ad-meer-tekst">
                          <span className="ad-meer-titel">{o.titel}</span>
                          <span className="ad-meer-sub">{[d.voluit, o.locatie].filter(Boolean).join(" · ")}</span>
                        </span>
                      </Link>
                    </Reveal>
                  );
                })}
              </div>
              <Link href="/agenda" className="ad-alles">Bekijk de hele agenda →</Link>
            </div>
          </section>
        )}

      </main>
      <Footer />

      <style>{`
        .ad-kern { display: flex; align-items: center; gap: 36px; padding: 40px 48px; }
        .ad-datum {
          flex-shrink: 0; width: 156px; padding: 18px 12px 16px; border-radius: 24px; text-align: center;
          display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 156px;
          background: linear-gradient(160deg, #F36A2A 0%, #D4561E 100%); color: #fff; box-shadow: 0 12px 28px -10px rgba(212,86,30,0.55);
        }
        .ad-datum strong { font-family: var(--font-display), var(--font-manrope), sans-serif; font-size: 64px; font-weight: 800; line-height: 1; letter-spacing: -2px; margin: 4px 0 2px; }
        .ad-datum span { font-size: 18px; font-weight: 700; }
        .ad-datum .ad-datum-weekdag { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.9; }
        .ad-datum .ad-datum-jaar { font-size: 14px; font-weight: 600; opacity: 0.85; }

        .ad-feiten { margin: 0; display: flex; flex-direction: column; gap: 18px; min-width: 0; }
        .ad-feiten dt { display: flex; align-items: center; gap: 8px; margin-bottom: 3px; font-size: 13px; font-weight: 800; letter-spacing: 0.07em; text-transform: uppercase; color: #B54412; }
        .ad-feiten dd { margin: 0; font-size: 19px; font-weight: 600; line-height: 1.4; color: #111; }
        .ad-route { display: inline-block; margin-left: 12px; font-size: 16px; font-weight: 700; color: #B54412; text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 3px; }
        .ad-route:hover { color: var(--primary); }

        .ad-verder { padding: 32px 48px 40px; border-top: 1px solid rgba(0,0,0,0.07); display: flex; flex-direction: column; gap: 26px; }
        .ad-beschrijving { margin: 0; font-size: 18px; line-height: 1.8; color: #2b2b2b; white-space: pre-line; }
        .ad-knoppen { display: flex; flex-wrap: wrap; gap: 12px; }
        .ad-knoppen .btn { font-size: 16px; min-height: 50px; }

        .ad-meer-kaart { flex-direction: row; align-items: center; gap: 16px; padding: 18px; }
        .ad-meer-datum {
          flex-shrink: 0; width: 68px; height: 68px; border-radius: 18px; display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: rgba(243,106,42,0.12); color: #B54412;
        }
        .ad-meer-datum strong { font-family: var(--font-display), var(--font-manrope), sans-serif; font-size: 28px; font-weight: 800; line-height: 1; }
        .ad-meer-datum span { font-size: 14px; font-weight: 700; }
        .ad-meer-tekst { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .ad-meer-titel { font-size: 18px; font-weight: 800; line-height: 1.3; letter-spacing: -0.3px; color: #111; }
        .ad-meer-sub { font-size: 15px; color: #555; line-height: 1.4; }
        .ad-alles { display: inline-block; margin-top: 24px; font-size: 17px; font-weight: 700; color: #B54412; text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 3px; }

        @media (max-width: 640px) {
          .ad-kern { flex-direction: column; align-items: stretch; gap: 24px; padding: 22px; }
          .ad-datum { width: auto; min-height: 0; flex-direction: row; gap: 10px; padding: 16px 20px; border-radius: 18px; }
          .ad-datum strong { font-size: 40px; margin: 0; }
          .ad-datum .ad-datum-weekdag { order: -1; }
          .ad-feiten dd { font-size: 18px; }
          .ad-route { display: block; margin: 4px 0 0; }
          .ad-verder { padding: 24px 22px 28px; }
          .ad-beschrijving { font-size: 17.5px; }
          .ad-knoppen .btn { width: 100%; justify-content: center; }
        }
      `}</style>
    </>
  );
}
