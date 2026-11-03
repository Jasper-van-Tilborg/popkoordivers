import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";
import Link from "next/link";
import { IconCalendar, IconFolder, IconMapPin, IconNewspaper, IconSparkle, IconCamera, IconUsers } from "@/components/icons";
import { Kop, Sectie } from "./Kop";
import PaginaLink from "./PaginaLink";
import { db, sessie } from "./data";

const IconMuziek = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
);
const Pijl = () => (
  <span className="leden-tegel-pijl" aria-hidden="true">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
  </span>
);

function Tegel({ href, icoon, titel, groot, children }: { href: string; icoon: ReactNode; titel: string; groot?: boolean; children?: ReactNode }) {
  return (
    <PaginaLink href={href} className={`leden-kaart leden-tegel${groot ? " leden-tegel--groot" : ""}`}>
      <span className="leden-tegel-icoon">{icoon}</span>
      <p className="leden-tegel-titel">{titel}</p>
      {children}
      <Pijl />
    </PaginaLink>
  );
}

// Vandaag in Nederland, als 2026-11-02 (zoals datum_sorteer in de agenda)
const vandaag = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam" }).format(new Date());

function aftellen(datum: string) {
  const dagen = Math.round((Date.parse(datum) - Date.parse(vandaag())) / 86_400_000);
  if (dagen <= 0) return { getal: null, tekst: "Vandaag" };
  if (dagen === 1) return { getal: null, tekst: "Morgen" };
  return { getal: dagen, tekst: "dagen" };
}

// Het overzicht: welkom, het volgende optreden, een tegel naar elke pagina,
// de agenda en het nieuws van de website.
export default async function OverzichtPage() {
  const supabase = await db();
  const ik = sessie();
  const [{ naam }, opnames, { data: optredens }, { data: berichten }] = await Promise.all([
    ik,
    // Voor de tegel: drie opnames voor de eigen stem (of voor het hele koor)
    ik.then(async ({ stemgroep }) => {
      let q = supabase.from("bestanden").select("id, naam").eq("categorie", "opnames");
      if (stemgroep) q = q.or(`stemgroep.is.null,stemgroep.eq.${stemgroep}`);
      const { data } = await q.order("created_at", { ascending: false }).limit(3);
      return data ?? [];
    }),
    supabase.from("agenda").select("id, titel, datum, datum_sorteer, tijd, locatie").eq("gepubliceerd", true).gte("datum_sorteer", vandaag()).order("datum_sorteer").limit(4),
    supabase.from("berichten").select("id, slug, titel, datum").eq("gepubliceerd", true).order("created_at", { ascending: false }).limit(3),
  ]);
  const komend = optredens ?? [];
  const volgende = komend[0];
  const nieuws = berichten ?? [];
  const teller = volgende?.datum_sorteer ? aftellen(volgende.datum_sorteer) : null;

  const voornaam = naam?.split(" ")[0];

  return (
    <>
      <Kop titel={voornaam ? `Welkom, ${voornaam}` : "Welkom"} />

      {volgende && teller && (
        <Sectie>
          <Link href={`/agenda/${volgende.id}`} className="leden-kaart leden-aftel">
            <span className="leden-aftel-teller">
              {teller.getal !== null && <strong>{teller.getal}</strong>}
              <span>{teller.tekst}</span>
            </span>
            <span className="leden-aftel-info">
              <span className="leden-aftel-label">Ons volgende optreden</span>
              <span className="leden-aftel-titel">{volgende.titel}</span>
              <span className="leden-aftel-details">
                <span><IconCalendar size={17} /> {[volgende.datum, volgende.tijd].filter(Boolean).join(", ")}</span>
                {volgende.locatie && <span><IconMapPin size={17} /> {volgende.locatie}</span>}
              </span>
            </span>
            <Pijl />
          </Link>
        </Sectie>
      )}

      {/* Op de telefoon niet: daar staan de pagina's al in de balk onderin */}
      <section className="leden-section leden-tegels-sectie" style={{ paddingTop: 8 }}>
        <div className="leden-binnen">
          <Reveal>
            <nav className="leden-tegels" aria-label="Pagina's van de ledenomgeving">
              <Tegel
                href="/leden/opnames"
                groot
                icoon={<IconMuziek />}
                titel="Opnames"
              >
                {opnames.length > 0 && (
                  <ul className="leden-tegel-lijst">
                    {opnames.map((l) => (
                      <li key={l.id}><span className="leden-tegel-noot"><IconMuziek size={14} /></span><span>{l.naam}</span></li>
                    ))}
                  </ul>
                )}
              </Tegel>
              <Tegel href="/leden/choreo" icoon={<IconSparkle size={20} />} titel="Choreografie" />
              <Tegel href="/leden/nieuwsbrieven" icoon={<IconFolder size={20} />} titel="Nieuwsbrieven & ALV" />
              <Tegel href="/leden/fotos" icoon={<IconCamera size={20} />} titel="Foto's" />
              <Tegel href="/leden/wie-is-wie" icoon={<IconUsers size={20} />} titel="Wie is wie" />
            </nav>
          </Reveal>
        </div>
      </section>

      <Sectie>
        <div className="leden-twee">
          <div className="leden-kaart" style={{ overflow: "hidden" }}>
            <h2 className="leden-kaart-titel">Onze komende optredens</h2>
            {komend.length === 0 ? (
              <p className="leden-leeg" style={{ padding: "18px 24px" }}>Nog niets gepland.</p>
            ) : komend.map((o) => (
              <Link key={o.id} href={`/agenda/${o.id}`} className="leden-row">
                <span className="leden-row__icon"><IconCalendar size={16} /></span>
                <span className="leden-row__title">
                  {o.titel}
                  <span className="leden-row__sub">{[o.datum, o.locatie].filter(Boolean).join(", ")}</span>
                </span>
                <span className="leden-row__action">Bekijken</span>
              </Link>
            ))}
          </div>
          <div className="leden-kaart" style={{ overflow: "hidden" }}>
            <h2 className="leden-kaart-titel">Nieuws</h2>
            {nieuws.length === 0 ? (
              <p className="leden-leeg" style={{ padding: "18px 24px" }}>Nog geen nieuws.</p>
            ) : nieuws.map((n) => (
              <Link key={n.id} href={`/nieuws/${n.slug}`} className="leden-row">
                <span className="leden-row__icon"><IconNewspaper size={16} /></span>
                <span className="leden-row__title">
                  {n.titel}
                  <span className="leden-row__sub">{n.datum}</span>
                </span>
                <span className="leden-row__action">Lezen</span>
              </Link>
            ))}
          </div>
        </div>
      </Sectie>
    </>
  );
}
