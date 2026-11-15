import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import { createClient } from "@/lib/supabase/server";
import { getPublicUrl } from "@/lib/r2";
import VideoSpeler from "@/components/VideoSpeler";
import Galerij from "@/components/Galerij";

export const dynamic = "force-dynamic";

export default async function AlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: album } = await supabase
    .from("albums")
    .select("id, slug, titel, datum")
    .eq("slug", slug)
    .single();

  if (!album) notFound();

  const [{ data: fotosData }, { data: videosData }] = await Promise.all([
    supabase.from("fotos").select("r2_key, klein_key").eq("album_id", album.id).eq("impressies", true)
      .order("volgorde").order("created_at"),
    supabase.from("videos").select("id, titel, youtube_id, r2_key").eq("album_id", album.id).eq("openbaar", true)
      .order("volgorde"),
  ]);
  const videos = videosData ?? [];

  // Klein voor de fotomuur (en als eerste beeld in de lightbox), groot in de lightbox.
  // Bijschriften bevatten soms namen van leden: die blijven op de openbare pagina weg.
  const fotos = (fotosData ?? []).map((f) => ({
    groot: getPublicUrl(f.r2_key),
    klein: getPublicUrl(f.klein_key ?? f.r2_key),
    bijschrift: null,
  }));

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#FFFFFF" }}>

        {/* ── Hero ── */}
        <section className="page-hero" style={{ background: "var(--primary)", padding: "128px 24px 80px", minHeight: "280px", position: "relative", overflow: "hidden" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 30% 30%, rgba(255,255,255,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
            <Reveal direct>
              <Link href="/media" className="detail-terug">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                Terug naar Impressies
              </Link>
            </Reveal>
            <RevealText text={album.titel} as="h1" style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, color: "#FFFFFF", margin: "0 0 16px" }} />
            <Reveal direct delay={180}>
              <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.75)", margin: 0, fontWeight: 500 }}>
                {album.datum}{fotos.length > 0 ? ` · ${fotos.length} foto${fotos.length !== 1 ? "'s" : ""}` : ""}
              </p>
            </Reveal>
          </div>
          <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
            <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "60px" }}>
              <path d="M0,60 L0,30 Q360,0 720,25 Q1080,50 1440,15 L1440,60 Z" fill="#FFFFFF" />
            </svg>
          </div>
        </section>

        {/* ── Gallery ── */}
        <section className="gallery-section" style={{ padding: "60px 24px 120px", background: "#FFFFFF" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            {videos.length > 0 && (
              <div className="album-videos">
                {videos.map((v) => (
                  <div key={v.id}>
                    <VideoSpeler titel={v.titel} youtubeId={v.youtube_id} src={v.r2_key ? getPublicUrl(v.r2_key) : null} className="album-video" />
                    <p style={{ margin: "10px 2px 0", fontSize: "14px", fontWeight: 700, color: "#111" }}>{v.titel}</p>
                  </div>
                ))}
              </div>
            )}
            {fotos.length > 0 ? (
              <Galerij fotos={fotos} titel={album.titel} />
            ) : videos.length === 0 && (
              <p style={{ textAlign: "center", padding: "80px 24px", background: "#FFF8F4", borderRadius: "20px", fontSize: "17px", color: "#737373", margin: 0 }}>Nog geen foto&apos;s in dit album.</p>
            )}
          </div>
        </section>

      </main>
      <Footer />

      <style>{`
        @media (max-width: 640px) {
          .page-hero { padding: 100px 20px 64px !important; height: auto !important; min-height: 240px !important; }
          .gallery-section { padding: 40px 16px 80px !important; }
        }
        .album-videos { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; margin-bottom: 48px; }
        .album-video { border-radius: 16px; }
        @media (max-width: 640px) { .album-videos { grid-template-columns: 1fr; } }
      `}</style>
    </>
  );
}
