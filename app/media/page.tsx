import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import { createClient } from "@/lib/supabase/server";
import { getPublicUrl } from "@/lib/r2";
import MediaRaster, { type MediaAlbum, type MediaVideo } from "./MediaRaster";

export const dynamic = "force-dynamic";

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ soort?: string }> }) {
  const { soort } = await searchParams;
  const supabase = await createClient();

  const [{ data: albumsData }, { data: fotosData }, { data: videosData }] = await Promise.all([
    supabase.from("albums").select("id, slug, titel, datum, soort")
      .order("datum_sorteer", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false }),
    // Alle impressies-foto's in één keer; per album tellen en de eerste als omslag
    supabase.from("fotos").select("album_id, r2_key, klein_key").eq("impressies", true)
      .order("volgorde").order("created_at"),
    // Alleen openbare video's (RLS); die van een album staan ook op de albumpagina
    supabase.from("videos").select("id, titel, datum, youtube_id, r2_key").eq("openbaar", true)
      .order("datum", { ascending: false, nullsFirst: false }).order("volgorde"),
  ]);

  const albums: MediaAlbum[] = (albumsData ?? []).flatMap((a) => {
    const fotos = (fotosData ?? []).filter((f) => f.album_id === a.id);
    if (fotos.length === 0) return [];
    // Voor de kaart volstaat de kleine versie
    return [{ id: a.id, slug: a.slug, titel: a.titel, datum: a.datum, soort: a.soort, omslag: getPublicUrl(fotos[0].klein_key ?? fotos[0].r2_key), fotos: fotos.length }];
  });
  const videos: MediaVideo[] = (videosData ?? []).map((v) => ({
    id: v.id, titel: v.titel, datum: v.datum, youtubeId: v.youtube_id, src: v.r2_key ? getPublicUrl(v.r2_key) : null,
  }));
  const isEmpty = albums.length === 0 && videos.length === 0;

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#FFFFFF" }}>

        {/* ── Hero ── */}
        <section className="page-hero" style={{ background: "var(--primary)", padding: "128px 24px 80px", minHeight: "280px", position: "relative", overflow: "hidden" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 30% 30%, rgba(255,255,255,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
            <RevealText text="Impressies" as="h1" style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, color: "#FFFFFF", margin: "0 0 24px" }} />
            <Reveal direct delay={180}>
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
              <MediaRaster albums={albums} videos={videos} soort={soort ?? null} />
            )}
          </div>
        </section>

      </main>
      <Footer />

      <style>{`
        .media-filter { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 28px; }
        .media-filter button {
          display: inline-flex; align-items: center; gap: 8px; min-height: 42px; padding: 0 16px 0 18px; border: 0; border-radius: 100px; cursor: pointer;
          font: inherit; font-size: 14px; font-weight: 700; color: #111; background: #FFF4EE;
          transition: background 0.15s, color 0.15s, transform 0.15s;
        }
        .media-filter button span { font-size: 12px; color: #6b6b6b; background: rgba(0,0,0,0.06); padding: 1px 8px; border-radius: 100px; }
        @media (hover: hover) { .media-filter button:hover { background: #FFE6D8; } }
        .media-filter button[aria-pressed="true"] { background: var(--primary); color: #fff; }
        .media-filter button[aria-pressed="true"] span { background: rgba(255,255,255,0.24); color: #fff; }
        .media-wissel { animation: fadeIn 0.2s ease both; }
        .media-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
        .media-kop { font-size: clamp(26px, 3vw, 36px); font-weight: 800; letter-spacing: -1px; color: #111; margin: 80px 0 24px; }
        .media-video { border-radius: 16px; overflow: hidden; border: 1px solid rgba(0,0,0,0.07); box-shadow: 0 2px 8px rgba(0,0,0,0.04); background: #fff; }
        .media-datum { margin: 4px 0 0; font-size: 12px; color: #737373; font-weight: 500; }
        @media (max-width: 900px) { .media-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 560px) { .media-grid { grid-template-columns: minmax(0, 1fr); } }
        @media (max-width: 640px) {
          .page-hero { padding: 100px 20px 64px !important; height: auto !important; min-height: 240px !important; }
        }
      `}</style>
    </>
  );
}

