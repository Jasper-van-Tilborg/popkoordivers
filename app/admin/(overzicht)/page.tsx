import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { IconCalendar, IconNewspaper, IconCamera, IconFolder, IconMapPin, IconClock } from "@/components/icons";
import { DateStub } from "../_components/ui";

const NL = "Europe/Amsterdam";

export default async function OverzichtPage() {
  const supabase = await createClient();
  const nu = new Date();
  const vandaag = nu.toLocaleDateString("en-CA", { timeZone: NL }); // "2026-10-23"

  const [{ data: { user } }, komend, berichten, albums, fotos, profielen, bestanden] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("agenda").select("id, titel, datum_sorteer, locatie, tijd, gepubliceerd").gte("datum_sorteer", vandaag).order("datum_sorteer"),
    supabase.from("berichten").select("id, slug, titel, datum, afbeelding, gepubliceerd, created_at").order("created_at", { ascending: false }),
    supabase.from("albums").select("id"),
    supabase.from("fotos").select("album_id, impressies"),
    supabase.from("profiles").select("id, naam, stemgroep"),
    supabase.from("bestanden").select("categorie"),
  ]);

  const optredens = komend.data ?? [];
  const nieuws = berichten.data ?? [];
  const leden = profielen.data ?? [];
  const ik = leden.find((p) => p.id === user?.id);
  const voornaam = ik?.naam?.split(" ")[0];

  // Wat er aandacht nodig heeft, met een link naar waar je het oplost
  const aandacht: { tekst: string; href: string; link: string }[] = [];
  const verborgen = optredens.filter((o) => !o.gepubliceerd).length;
  if (verborgen) aandacht.push({ tekst: `${verborgen} komend${verborgen === 1 ? " optreden is" : "e optredens zijn"} nog verborgen.`, href: "/admin/agenda", link: "Naar de agenda" });
  const onvolledig = optredens.filter((o) => o.gepubliceerd && !o.locatie && !o.tijd).length;
  if (onvolledig) aandacht.push({ tekst: `Bij ${onvolledig} optreden${onvolledig === 1 ? "" : "s"} staan nog geen locatie en tijd.`, href: "/admin/agenda", link: "Aanvullen" });
  const zonderSter = (albums.data ?? []).filter((a) => !(fotos.data ?? []).some((f) => f.album_id === a.id && f.impressies)).length;
  if (zonderSter) aandacht.push({ tekst: `${zonderSter} album${zonderSter === 1 ? " staat" : "s staan"} nog niet op de website: geef een paar foto's een ster.`, href: "/admin/albums", link: "Naar media" });
  const zonderStem = leden.filter((p) => !p.stemgroep).length;
  if (zonderStem) aandacht.push({ tekst: `${zonderStem} ${zonderStem === 1 ? "lid heeft" : "leden hebben"} nog geen stemgroep.`, href: "/admin/leden", link: "Naar leden" });
  if (!(bestanden.data ?? []).length) aandacht.push({ tekst: "Er staan nog geen bladmuziek of nieuwsbrieven in de ledenomgeving.", href: "/admin/bestanden?nieuw", link: "Bestand toevoegen" });
  const laatste = nieuws.find((b) => b.gepubliceerd);
  if (laatste && nu.getTime() - new Date(laatste.created_at).getTime() > 60 * 864e5) aandacht.push({ tekst: `Het laatste nieuwsbericht is van ${laatste.datum}.`, href: "/admin/nieuws?nieuw", link: "Nieuw bericht" });

  const datumTekst = nu.toLocaleDateString("nl-NL", { timeZone: NL, weekday: "long", day: "numeric", month: "long" });
  const uur = Number(nu.toLocaleString("nl-NL", { timeZone: NL, hour: "numeric", hour12: false }));
  const groet = uur < 12 ? "Goedemorgen" : uur < 18 ? "Goedemiddag" : "Goedenavond";

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>{groet}{voornaam ? `, ${voornaam}` : ""}</h1>
          <p className="adm-sub">{datumTekst.charAt(0).toUpperCase() + datumTekst.slice(1)}</p>
        </div>
      </header>

      <div className="adm-content">
        <nav className="adm-acties" aria-label="Snel aan de slag">
          <Link className="adm-actie" href="/admin/agenda?nieuw"><span className="adm-actie-icoon"><IconCalendar size={18} /></span>Optreden toevoegen</Link>
          <Link className="adm-actie" href="/admin/nieuws?nieuw"><span className="adm-actie-icoon"><IconNewspaper size={18} /></span>Nieuwsbericht plaatsen</Link>
          <Link className="adm-actie" href="/admin/albums?nieuw"><span className="adm-actie-icoon"><IconCamera size={18} /></span>Fotoalbum maken</Link>
          <Link className="adm-actie" href="/admin/bestanden?nieuw"><span className="adm-actie-icoon"><IconFolder size={18} /></span>Bestand toevoegen</Link>
        </nav>

        <div className="adm-grid-overzicht">
          <div>
            <section className="adm-blok">
              <div className="adm-blok-kop"><h2>Komende optredens</h2><Link href="/admin/agenda">Hele agenda</Link></div>
              {optredens.length === 0 ? (
                <p className="adm-blok-leeg">Er staat niets gepland. <Link href="/admin/agenda?nieuw">Voeg het volgende optreden toe.</Link></p>
              ) : (
                <ul className="adm-list">
                  {optredens.slice(0, 4).map((o) => (
                    <li key={o.id} className="adm-row" data-hidden={!o.gepubliceerd || undefined}>
                      <DateStub iso={o.datum_sorteer} />
                      <div className="adm-main-col">
                        <Link className="adm-title" href={`/admin/agenda?id=${o.id}`}>{o.titel}</Link>
                        <div className="adm-meta">
                          {o.locatie && <span><IconMapPin size={13} />{o.locatie}</span>}
                          {o.tijd && <span><IconClock size={13} />{o.tijd}</span>}
                          {!o.locatie && !o.tijd && <span className="adm-missing">Locatie en tijd nog onbekend</span>}
                        </div>
                      </div>
                      <span className={o.gepubliceerd ? "adm-pill" : "adm-pill adm-pill--brand"}>{o.gepubliceerd ? "Online" : "Verborgen"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="adm-blok">
              <div className="adm-blok-kop"><h2>Laatste nieuws</h2><Link href="/admin/nieuws">Alle berichten</Link></div>
              {nieuws.length === 0 ? (
                <p className="adm-blok-leeg">Nog geen berichten. <Link href="/admin/nieuws?nieuw">Plaats het eerste.</Link></p>
              ) : (
                <ul className="adm-list">
                  {nieuws.slice(0, 3).map((b) => (
                    <li key={b.id} className="adm-row adm-row--thumb" data-hidden={!b.gepubliceerd || undefined}>
                      <span className="adm-thumb">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {/^(https?:\/\/|\/)/.test(b.afbeelding) && <img src={b.afbeelding} alt="" loading="lazy" />}
                      </span>
                      <div className="adm-main-col">
                        <Link className="adm-title" href={`/admin/nieuws?id=${b.id}`}>{b.titel}</Link>
                        <div className="adm-meta"><span>{b.datum}</span></div>
                      </div>
                      <span className="adm-pill">{b.gepubliceerd ? "Online" : "Verborgen"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div>
            <section className="adm-blok">
              <div className="adm-blok-kop"><h2>Aandacht nodig</h2></div>
              {aandacht.length === 0 ? (
                <p className="adm-blok-leeg">Alles is bijgewerkt.</p>
              ) : (
                <ul className="adm-aandacht">
                  {aandacht.map((a) => (
                    <li key={a.tekst}><span>{a.tekst} <Link href={a.href}>{a.link}</Link></span></li>
                  ))}
                </ul>
              )}
            </section>

            <section className="adm-blok">
              <div className="adm-blok-kop"><h2>Op de website</h2></div>
              <ul className="adm-aandacht adm-aandacht--feiten">
                <li><span>{optredens.filter((o) => o.gepubliceerd).length} optredens gepland</span></li>
                <li><span>{nieuws.filter((b) => b.gepubliceerd).length} nieuwsberichten online</span></li>
                <li><span>{(albums.data ?? []).length - zonderSter} van {(albums.data ?? []).length} albums met foto&apos;s op de website</span></li>
                <li><span>{leden.length} accounts, {(bestanden.data ?? []).length} bestanden voor leden</span></li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
