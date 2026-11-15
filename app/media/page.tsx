import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import { createClient } from "@/lib/supabase/server";
import { getPublicUrl } from "@/lib/r2";
import VideoSpeler from "@/components/VideoSpeler";
import AlbumCard from "./AlbumCard";
import Link from "next/link";
import { ALBUM_SOORTEN } from "@/lib/albumsoorten";

export const dynamic = "force-dynamic";


const datumTekst = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ soort?: string }> }) {
  const { soort: gevraagd } = await searchParams;
  const supabase = await createClient();

  // Albums uit albums tabel, met eerste impressies-foto als cover
  const [{ data: albumsData }, { data: videosData }] = await Promise.all([
    supabase.from("albums").select("id, slug, titel, datum, volgorde, soort")
      .order("datum_sorteer", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false }),
    // Alleen openbare video's (RLS); die van een album staan ook op de albumpagina
    supabase.from("videos").select("id, titel, datum, youtube_id, r2_key").eq("openbaar", true)
      .order("datum", { ascending: false, nullsFirst: false }).order("volgorde"),
  ]);
  const videos = videosData ?? [];

  // Haal voor elk album de impressies fotos op
  const albums = await Promise.all(
    (albumsData ?? []).map(async (album) => {
      const { data: fotos } = await supabase
        .from("fotos")
        .select("r2_key, klein_key")
        .eq("album_id", album.id)
        .eq("impressies", true)
        .order("volgorde")
        .order("created_at");
      // Voor de kaart volstaat de kleine versie
      const photos = (fotos ?? []).map((f) => getPublicUrl(f.klein_key ?? f.r2_key));
      return { ...album, photos };
    })
  );

  const metFotos = albums.filter((a) => a.photos.length > 0);
  // Filteren op soort (vanaf Over ons: optredens, groepsfoto's, repetities). Is er
  // van die soort nog niets openbaar, dan gewoon alles.
  const soorten = ALBUM_SOORTEN.filter((s) => metFotos.some((a) => a.soort === s.value));
  const soort = soorten.find((s) => s.value === gevraagd)?.value ?? null;
  const visibleAlbums = soort ? metFotos.filter((a) => a.soort === soort) : metFotos;
  const isEmpty = visibleAlbums.length === 0 && videos.length === 0;

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#FFFFFF" }}>

        {/* ── Hero ── */}
        <section className="page-hero" style={{ background: "var(--primary)", padding: "140px 24px 100px", minHeight: "420px", position: "relative", overflow: "hidden" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 30% 30%, rgba(255,255,255,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
            <RevealText text="Impressies" as="h1" pageDelay={0} style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, color: "#FFFFFF", margin: "0 0 24px" }} />
            <Reveal delay={180}>
              <p style={{ fontSize: "clamp(15px, 1.6vw, 18px)", lineHeight: 1.7, color: "rgba(255,255,255,0.82)", maxWidth: "520px", margin: 0 }}>
                Een kijkje achter de schermen — optredens, repetities en bijzondere momenten van Popkoor Divers.
              </p>
            </Reveal>
          </div>
          <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
            <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "60px" }}>
              <path d="M0,60 L0,30 Q360,0 720,25 Q1080,50 1440,15 L1440,60 Z" fill="#FFFFFF" />
            </svg>
          </div>
        </section>

        {/* ── Media grid ── */}
        <section style={{ padding: "60px 24px 120px", background: "#FFFFFF" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            {isEmpty ? (
              <Reveal>
                <div style={{ textAlign: "center", padding: "80px 24px", background: "#FFF8F4", borderRadius: "20px", border: "1px solid rgba(243,106,42,0.1)" }}>
                  <p style={{ fontSize: "17px", color: "#aaa", margin: 0 }}>Foto&apos;s en video&apos;s worden binnenkort toegevoegd.</p>
                </div>
              </Reveal>
            ) : (
              <>
                {soorten.length > 1 && (
                  <nav aria-label="Soort foto's" className="media-filter">
                    {[{ value: null, meervoud: "Alles" }, ...soorten].map((s) => (
                      <Link key={s.value ?? "alles"} href={s.value ? `/media?soort=${s.value}` : "/media"} scroll={false}
                        aria-current={soort === s.value ? "page" : undefined}>
                        {s.meervoud}
                      </Link>
                    ))}
                  </nav>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }} className="media-grid">
                  {visibleAlbums.map((album, i) => (
                    <Reveal key={album.id} delay={Math.min(i % 3, 2) * 60}>
                      <AlbumCard slug={album.slug} title={album.titel} datum={album.datum} photos={album.photos} />
                    </Reveal>
                  ))}
                </div>
                {!soort && videos.length > 0 && (
                  <>
                    <h2 id="videos" style={{ fontSize: "clamp(26px, 3vw, 36px)", fontWeight: 800, letterSpacing: "-1px", color: "#111", margin: "80px 0 24px" }}>Video&apos;s</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }} className="media-grid">
                      {videos.map((v, i) => (
                        <Reveal key={v.id} delay={Math.min(i % 3, 2) * 60}>
                          <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", background: "#fff" }}>
                            <VideoSpeler titel={v.titel} youtubeId={v.youtube_id} src={v.r2_key ? getPublicUrl(v.r2_key) : null} />
                            <div style={{ padding: "14px 16px" }}>
                              <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#111", lineHeight: 1.3 }}>{v.titel}</p>
                              {v.datum && <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#aaa", fontWeight: 500 }}>{datumTekst(v.datum)}</p>}
                            </div>
                          </div>
                        </Reveal>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </section>

      </main>
      <Footer />

      <style>{`
        .media-filter { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 28px; }
        .media-filter a { padding: 9px 18px; border-radius: 100px; background: #FFF4EE; color: #111; font-size: 14px; font-weight: 700; text-decoration: none; transition: background 0.15s, color 0.15s; }
        .media-filter a:hover { background: #FFE6D8; }
        .media-filter a[aria-current="page"] { background: var(--primary); color: #fff; }
        @media (max-width: 900px) { .media-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 560px) { .media-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 640px) {
          .page-hero { padding: 100px 20px 80px !important; height: auto !important; min-height: 320px !important; }
        }
      `}</style>
    </>
  );
}

