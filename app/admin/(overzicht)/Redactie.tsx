import Link from "next/link";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { downloadUrl, getPublicUrl } from "@/lib/r2";
import { IconCalendar, IconNewspaper, IconCamera, IconMapPin, IconClock } from "@/components/icons";
import { IconMuziek, IconPost, IconStukken, IconMicro, IconDans } from "../_components/iconen";
import { DateStub } from "../_components/ui";
import { NL } from "../_components/activiteit";
import { CATEGORIEEN, type CategorieId } from "../bestanden/categorieen";

// Het overzicht voor een redacteur: alles om iets te maken of af te maken.

const CAT_ICOON: Record<CategorieId, ReactNode> = {
  liedjes: <IconMuziek />, nieuwsbrieven: <IconPost />, alv: <IconStukken />, opnames: <IconMicro />, choreo: <IconDans />,
};

const WEBSITE = [
  { href: "/admin/agenda?nieuw", icon: <IconCalendar size={19} />, label: "Optreden" },
  { href: "/admin/nieuws?nieuw", icon: <IconNewspaper size={19} />, label: "Nieuwsbericht" },
  { href: "/admin/albums?nieuw", icon: <IconCamera size={19} />, label: "Fotoalbum" },
];

type Taak = { href: string; titel: string; wat: string };

export default async function Redactie({ nu }: { nu: Date }) {
  const supabase = await createClient();
  const vandaag = nu.toLocaleDateString("en-CA", { timeZone: NL });

  const [komend, concepten, albums, fotos, bestanden] = await Promise.all([
    supabase.from("agenda").select("id, titel, datum_sorteer, locatie, tijd, gepubliceerd").gte("datum_sorteer", vandaag).order("datum_sorteer"),
    supabase.from("berichten").select("id, titel").eq("gepubliceerd", false).order("created_at", { ascending: false }),
    supabase.from("albums").select("id, titel, datum").order("created_at", { ascending: false }),
    supabase.from("fotos").select("album_id, r2_key, impressies").order("volgorde").order("created_at"),
    supabase.from("bestanden").select("categorie, naam, created_at").order("created_at", { ascending: false }),
  ]);

  const optredens = komend.data ?? [];
  const alleFotos = fotos.data ?? [];

  // De vier nieuwste albums, met een omslag en het aantal foto's
  const recent = await Promise.all((albums.data ?? []).slice(0, 4).map(async (a) => {
    const eigen = alleFotos.filter((f) => f.album_id === a.id);
    const imp = eigen.find((f) => f.impressies);
    const cover = imp ? getPublicUrl(imp.r2_key) : eigen[0] ? await downloadUrl(eigen[0].r2_key) : null;
    return { ...a, aantal: eigen.length, cover };
  }));

  // Wat nog af moet, elk met een link naar precies dat item
  const taken: Taak[] = [
    ...(concepten.data ?? []).map((b) => ({ href: `/admin/nieuws?id=${b.id}`, titel: b.titel || "Bericht zonder titel", wat: "Concept, nog niet geplaatst" })),
    ...optredens.filter((o) => !o.gepubliceerd).map((o) => ({ href: `/admin/agenda?id=${o.id}`, titel: o.titel, wat: "Verborgen op de website" })),
    ...optredens.filter((o) => o.gepubliceerd && !o.locatie && !o.tijd).map((o) => ({ href: `/admin/agenda?id=${o.id}`, titel: o.titel, wat: "Locatie en tijd ontbreken" })),
    ...(albums.data ?? []).filter((a) => !alleFotos.some((f) => f.album_id === a.id)).map((a) => ({ href: `/admin/albums/${a.id}`, titel: a.titel, wat: "Album zonder foto's" })),
  ];

  const perCategorie = CATEGORIEEN.map((c) => {
    const eigen = (bestanden.data ?? []).filter((b) => b.categorie === c.id);
    return { ...c, aantal: eigen.length, laatste: eigen[0] ?? null };
  });

  return (
    <>
      <section className="adm-blok adm-maken" aria-labelledby="maken-kop">
        <div className="adm-blok-kop"><h2 id="maken-kop">Nieuw maken</h2></div>
        <div className="adm-maken-groepen">
          <div>
            <p className="adm-maken-titel">Website</p>
            <nav className="adm-maken-rij" aria-label="Nieuw op de website">
              {WEBSITE.map((w) => <Link key={w.href} className="adm-actie" href={w.href}><span className="adm-actie-icoon">{w.icon}</span>{w.label}</Link>)}
            </nav>
          </div>
          <div>
            <p className="adm-maken-titel">Ledenomgeving</p>
            <nav className="adm-maken-rij adm-maken-rij--leden" aria-label="Nieuw in de ledenomgeving">
              {CATEGORIEEN.map((c) => <Link key={c.id} className="adm-actie" href={`/admin/bestanden/${c.id}?nieuw`}><span className="adm-actie-icoon">{CAT_ICOON[c.id]}</span>{c.label}</Link>)}
            </nav>
          </div>
        </div>
      </section>

      <div className="adm-grid-overzicht">
        <div>
          <section className="adm-blok">
            <div className="adm-blok-kop"><h2>Foto&apos;s toevoegen</h2><Link href="/admin/albums">Alle albums</Link></div>
            {recent.length === 0 ? (
              <p className="adm-blok-leeg">Nog geen albums. <Link href="/admin/albums?nieuw">Maak het eerste fotoalbum.</Link></p>
            ) : (
              <ul className="adm-list">
                {recent.map((a) => (
                  <li key={a.id} className="adm-row adm-row--thumb">
                    <span className="adm-thumb">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {a.cover ? <img src={a.cover} alt="" loading="lazy" /> : <IconCamera size={18} />}
                    </span>
                    <div className="adm-main-col">
                      <Link className="adm-title" href={`/admin/albums/${a.id}`}>{a.titel}</Link>
                      <div className="adm-meta"><span>{a.aantal === 1 ? "1 foto" : `${a.aantal} foto's`}</span>{a.datum && <span>{a.datum}</span>}</div>
                    </div>
                    <span className="adm-pill adm-pill--actie">Foto&apos;s toevoegen</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="adm-blok">
            <div className="adm-blok-kop"><h2>Binnenkort</h2><Link href="/admin/agenda">Hele agenda</Link></div>
            {optredens.length === 0 ? (
              <p className="adm-blok-leeg">Er staat niets gepland. <Link href="/admin/agenda?nieuw">Voeg het volgende optreden toe.</Link></p>
            ) : (
              <ul className="adm-list">
                {optredens.slice(0, 3).map((o) => (
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
                    {!o.gepubliceerd && <span className="adm-pill">Verborgen</span>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div>
          <section className="adm-blok">
            <div className="adm-blok-kop"><h2>Nog af te maken</h2></div>
            {taken.length === 0 ? (
              <p className="adm-blok-leeg">Alles staat online. Er wacht niets op je.</p>
            ) : (
              <ul className="adm-list">
                {taken.slice(0, 6).map((t) => (
                  <li key={t.href + t.wat} className="adm-row adm-row--tekst">
                    <div className="adm-main-col">
                      <Link className="adm-title" href={t.href}>{t.titel}</Link>
                      <div className="adm-meta"><span>{t.wat}</span></div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="adm-blok">
            <div className="adm-blok-kop"><h2>Ledenomgeving</h2></div>
            <ul className="adm-list">
              {perCategorie.map((c) => (
                <li key={c.id} className="adm-row adm-row--icoon">
                  <span className="adm-actie-icoon">{CAT_ICOON[c.id]}</span>
                  <div className="adm-main-col">
                    <Link className="adm-title" href={`/admin/bestanden/${c.id}`}>{c.label}</Link>
                    <div className="adm-meta">
                      <span>{c.aantal === 1 ? "1 bestand" : `${c.aantal} bestanden`}</span>
                      {c.laatste && <span>Laatst: {c.laatste.naam}</span>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
