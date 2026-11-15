import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import DetailKop from "@/components/DetailKop";
import { IconCalendar, IconNewspaper } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import YoutubeVideo from "./YoutubeVideo";

export const dynamic = "force-dynamic";

const YOUTUBE = /https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?\S*?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})\S*/g;
const heeftAfbeelding = (url: string | null) => /^(https?:\/\/|\/)/.test(url ?? "");

// Maakt links in de tekst klikbaar: [tekst](/pad of https://...), losse URL's en e-mailadressen
function linkify(text: string): ReactNode[] {
  return text.split(/(\[[^\]]+\]\((?:https?:\/\/|\/)[^)\s]+\)|https?:\/\/\S*[^\s.,;:!?)]|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g).map((deel, i) => {
    const md = deel.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (md) return md[2].startsWith("/") ? <Link key={i} href={md[2]}>{md[1]}</Link> : <a key={i} href={md[2]} target="_blank" rel="noopener noreferrer">{md[1]}</a>;
    if (/^https?:\/\//.test(deel)) return <a key={i} href={deel} target="_blank" rel="noopener noreferrer">{deel.replace(/^https?:\/\/(www\.)?/, "")}</a>;
    if (/^[\w.+-]+@/.test(deel)) return <a key={i} href={`mailto:${deel}`}>{deel}</a>;
    return deel;
  });
}

// Een alinea met een YouTube-link wordt een video; de tekst ervoor ("Optreden ...:") het onderschrift
function Alinea({ tekst }: { tekst: string }) {
  const videos = [...tekst.matchAll(YOUTUBE)].map((m) => m[1]);
  if (videos.length === 0) return <p className="nd-alinea">{linkify(tekst)}</p>;

  const onderschrift = tekst.replace(YOUTUBE, "").trim().replace(/:$/, "");
  return (
    <figure className="nd-video">
      {onderschrift && <figcaption>{linkify(onderschrift)}</figcaption>}
      {videos.map((id) => (
        <div key={id} className="nd-video-kader">
          <YoutubeVideo id={id} titel={onderschrift || "Video"} />
        </div>
      ))}
    </figure>
  );
}

export default async function NieuwsDetailPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ van?: string }> }) {
  const [{ slug }, { van }] = await Promise.all([params, searchParams]);
  // Vanaf de ledenhome terug naar de ledenhome
  const terug = van === "leden" ? { href: "/leden", label: "Terug naar overzicht" } : { href: "/nieuws", label: "Terug naar nieuws" };
  const supabase = await createClient();
  const [{ data: bericht }, { data: anderen }] = await Promise.all([
    supabase.from("berichten").select("*").eq("slug", slug).eq("gepubliceerd", true).single(),
    supabase.from("berichten").select("id, slug, titel, datum, afbeelding").eq("gepubliceerd", true).neq("slug", slug).order("created_at", { ascending: false }).limit(3),
  ]);

  if (!bericht) notFound();

  const alineas = bericht.inhoud.split(/\n\s*\n/).map((a) => a.trim()).filter(Boolean);
  const meer = anderen ?? [];

  return (
    <>
      <Navbar />
      <main className="detail">

        <DetailKop
          terug={terug}
          meta={<>
            <span><IconCalendar size={16} /> {bericht.datum}</span>
            {bericht.categorie && bericht.categorie !== "Nieuws" && <span className="detail-chip">{bericht.categorie}</span>}
          </>}
          titel={bericht.titel}
          intro={bericht.intro}
        />

        {/* ── Het artikel, op een kaart die over de kop heen valt ── */}
        <section className="detail-kaart-vlak">
          <Reveal direct delay={200}>
            <article className="detail-kaart">
              {heeftAfbeelding(bericht.afbeelding) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={bericht.afbeelding} alt="" className="nd-afbeelding" />
              )}
              <div className="nd-tekst">
                {alineas.map((a, i) => <Alinea key={i} tekst={a} />)}
              </div>
            </article>
          </Reveal>
        </section>

        {/* ── Meer nieuws ── */}
        {meer.length > 0 && (
          <section className="detail-meer">
            <div className="detail-binnen">
              <h2>Meer nieuws</h2>
              <div className="detail-meer-rij">
                {meer.map((b, i) => (
                  <Reveal key={b.id} delay={i * 80}>
                    <Link href={`/nieuws/${b.slug}`} className="detail-meer-kaart">
                      <span className="nd-meer-beeld">
                        {heeftAfbeelding(b.afbeelding) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={b.afbeelding} alt="" loading="lazy" />
                        ) : (
                          <IconNewspaper size={30} />
                        )}
                      </span>
                      <span className="nd-meer-tekst">
                        <span className="nd-meer-datum">{b.datum}</span>
                        <span className="nd-meer-titel">{b.titel}</span>
                        <span className="nd-meer-lees">Lees verder →</span>
                      </span>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

      </main>
      <Footer />

      <style>{`
        .nd-afbeelding { display: block; width: 100%; aspect-ratio: 16/9; object-fit: cover; }
        .nd-tekst { padding: 48px 64px 52px; display: flex; flex-direction: column; gap: 26px; }
        .nd-alinea { margin: 0; max-width: 68ch; font-size: 18px; line-height: 1.8; color: #2b2b2b; white-space: pre-line; }
        .nd-tekst a { color: #B54412; font-weight: 600; text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 3px; word-break: break-word; }
        @media (hover: hover) { .nd-tekst a:hover { color: var(--primary); } }
        .nd-video { margin: 0; display: flex; flex-direction: column; gap: 14px; }
        .nd-video figcaption { font-size: 19px; font-weight: 800; color: #111; letter-spacing: -0.3px; line-height: 1.35; }
        .nd-video-kader { position: relative; aspect-ratio: 16/9; border-radius: 18px; overflow: hidden; background: #111; box-shadow: 0 10px 30px -12px rgba(17,17,17,0.35); }
        .nd-video-kader iframe, .nd-video-start { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
        .nd-video-start { padding: 0; background: #111; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .nd-video-start img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .nd-video-knop { position: relative; width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding-left: 4px; color: #fff; background: var(--primary); box-shadow: 0 8px 24px -6px rgba(0,0,0,0.5); transition: transform 0.2s var(--ease-out); }
        @media (hover: hover) { .nd-video-start:hover .nd-video-knop { transform: scale(1.08); } }
        .nd-video-start:active .nd-video-knop { transform: scale(0.94); transition-duration: 0.1s; }
        .nd-video-start:focus-visible { outline: 3px solid var(--primary); outline-offset: 3px; }

        .nd-meer-beeld { aspect-ratio: 16/9; overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: #B54412; background: linear-gradient(135deg, #FDE8D8 0%, #FFF3EC 100%); }
        .nd-meer-beeld img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .nd-meer-tekst { display: flex; flex-direction: column; gap: 6px; padding: 20px 22px 22px; flex: 1; }
        .nd-meer-datum { font-size: 14px; font-weight: 700; color: #B54412; }
        .nd-meer-titel { font-size: 19px; font-weight: 800; line-height: 1.3; letter-spacing: -0.3px; color: #111; }
        .nd-meer-lees { margin-top: auto; padding-top: 8px; font-size: 15px; font-weight: 700; color: #B54412; }

        @media (max-width: 640px) {
          .nd-tekst { padding: 28px 22px 30px; gap: 22px; }
          .nd-alinea { font-size: 17.5px; }
          .nd-video figcaption { font-size: 17.5px; }
          .nd-video-kader { border-radius: 14px; }
          .nd-video-knop { width: 60px; height: 60px; }

          /* Meer nieuws: compacte rij met een kleine foto */
          .detail-meer-rij { gap: 12px; }
          .detail-meer-kaart { flex-direction: row; align-items: stretch; border-radius: 18px; }
          .nd-meer-beeld { width: 96px; aspect-ratio: auto; min-height: 96px; }
          .nd-meer-tekst { padding: 14px 16px; gap: 4px; justify-content: center; }
          .nd-meer-datum { font-size: 13px; }
          .nd-meer-titel { font-size: 16.5px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
          .nd-meer-lees { display: none; }
        }
      `}</style>
    </>
  );
}
