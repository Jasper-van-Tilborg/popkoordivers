import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";
import { getInstellingen } from "@/lib/instellingen";
import { IconClock, IconMapPin, IconFolder, IconPlay, IconSparkle, IconCamera, IconUsers } from "@/components/icons";
import { Kop, Sectie } from "./Kop";
import PaginaLink from "./PaginaLink";
import { STEMGROEPEN, bestanden, sessie } from "./data";

const IconMuziek = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
);
const Pijl = () => (
  <span className="leden-tegel-pijl" aria-hidden="true">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
  </span>
);

const CATEGORIE: Record<string, string> = { liedjes: "Bladmuziek", nieuwsbrieven: "Nieuwsbrief", alv: "ALV-stuk", opnames: "Opname", choreo: "Choreografie" };
const tel = (n: number, een: string, meer: string) => `${n} ${n === 1 ? een : meer}`;

function Tegel({ href, icoon, titel, tekst, groot, children }: { href: string; icoon: ReactNode; titel: string; tekst: string; groot?: boolean; children?: ReactNode }) {
  return (
    <PaginaLink href={href} className={`leden-kaart leden-tegel${groot ? " leden-tegel--groot" : ""}`}>
      <span className="leden-tegel-icoon">{icoon}</span>
      <p className="leden-tegel-titel">{titel}</p>
      <p className="leden-tegel-tekst">{tekst}</p>
      {children}
      <Pijl />
    </PaginaLink>
  );
}

// Het overzicht: welkom, de repetitie en een tegel naar elke pagina.
export default async function OverzichtPage() {
  const { supabase, naam, stemgroep } = await sessie();
  const [inst, alles, albums, groepen] = await Promise.all([
    getInstellingen(),
    bestanden(["liedjes", "nieuwsbrieven", "alv", "opnames", "choreo"]),
    supabase.from("albums").select("id", { count: "exact", head: true }),
    supabase.from("groepen").select("soort"),
  ]);

  const van = (c: string) => alles.filter((b) => b.categorie === c);
  const voorStem = (s: string | null) => van("liedjes").filter((b) => !s || !b.stemgroep || b.stemgroep === s);
  const liedjes = voorStem(stemgroep);
  const stukken = [...van("nieuwsbrieven"), ...van("alv")];
  const commissies = (groepen.data ?? []).filter((g) => g.soort === "commissie").length;
  const voornaam = naam?.split(" ")[0];

  return (
    <>
      <Kop titel={voornaam ? `Welkom, ${voornaam}` : "Welkom"} tekst="Bladmuziek, opnames, nieuwsbrieven en foto's: alles voor repetities en optredens op één plek.">
        <div className="leden-chips">
          <span className="leden-chip"><IconClock size={14} /> {inst.repetitie_dag}, {inst.repetitie_tijd}</span>
          <span className="leden-chip"><IconMapPin size={14} /> {inst.repetitie_locatie}</span>
        </div>
      </Kop>

      <section className="leden-section" style={{ paddingTop: 8 }}>
        <div className="leden-binnen">
          <Reveal>
            <nav className="leden-tegels" aria-label="Pagina's van de ledenomgeving">
              <Tegel
                href="/leden/bladmuziek"
                groot
                icoon={<IconMuziek />}
                titel="Bladmuziek"
                tekst={stemgroep ? `${tel(liedjes.length, "liedje", "liedjes")} voor ${stemgroep}, en de rest per stemgroep.` : `${tel(liedjes.length, "liedje", "liedjes")}, per stemgroep.`}
              >
                {liedjes.length > 0 && (
                  <ul className="leden-tegel-lijst">
                    {liedjes.slice(0, 3).map((l) => (
                      <li key={l.id}><span className="leden-tegel-noot"><IconMuziek size={14} /></span><span>{l.naam}</span></li>
                    ))}
                  </ul>
                )}
                <span className="leden-tegel-stemmen">
                  {STEMGROEPEN.map((s) => (
                    <span key={s} data-eigen={s === stemgroep || undefined}>{s} <strong>{voorStem(s).length}</strong></span>
                  ))}
                </span>
              </Tegel>
              <Tegel href="/leden/opnames" icoon={<IconPlay size={20} />} titel="Opnames & choreo" tekst={`${tel(van("opnames").length, "opname", "opnames")} en ${tel(van("choreo").length, "choreografie", "choreografieën")} om mee te oefenen.`} />
              <Tegel href="/leden/nieuwsbrieven" icoon={<IconFolder size={20} />} titel="Nieuwsbrieven & ALV" tekst={stukken[0] ? `Nieuwste: ${stukken.sort((a, b) => b.created_at.localeCompare(a.created_at))[0].naam}` : "Nieuwsbrieven en stukken voor de ledenvergadering."} />
              <Tegel href="/leden/fotos" icoon={<IconCamera size={20} />} titel="Foto's" tekst={`${tel(albums.count ?? 0, "album", "albums")} en de afgelopen optredens.`} />
              <Tegel href="/leden/wie-is-wie" icoon={<IconUsers size={20} />} titel="Wie is wie" tekst={`Het bestuur, ${tel(commissies, "commissie", "commissies")} en het smoelenboek.`} />
            </nav>
          </Reveal>
        </div>
      </section>

      {alles.length > 0 && (
        <Sectie titel="Laatst toegevoegd">
          <div className="leden-kaart" style={{ overflow: "hidden" }}>
            {alles.slice(0, 5).map((b) => (
              <a key={b.id} href={b.url} target="_blank" rel="noopener" className="leden-row">
                <span className="leden-row__icon">{b.categorie === "opnames" ? <IconPlay size={14} /> : b.categorie === "choreo" ? <IconSparkle size={14} /> : b.categorie === "liedjes" ? <IconMuziek size={16} /> : <IconFolder size={16} />}</span>
                <span className="leden-row__title">
                  {b.naam}
                  <span className="leden-row__sub">{CATEGORIE[b.categorie] ?? b.categorie}{b.stemgroep ? `, ${b.stemgroep}` : ""}</span>
                </span>
                <span className="leden-row__action">Openen</span>
              </a>
            ))}
          </div>
        </Sectie>
      )}
    </>
  );
}
