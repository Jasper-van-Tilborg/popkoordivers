import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import { createClient } from "@/lib/supabase/server";
import { getPublicUrl } from "@/lib/r2";
import Gallery from "./Gallery";

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

  const { data: fotosData } = await supabase
    .from("fotos")
    .select("r2_key")
    .eq("album_id", album.id)
    .eq("impressies", true)
    .order("volgorde")
    .order("created_at");

  const photos = (fotosData ?? []).map((f) => getPublicUrl(f.r2_key));

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#FFFFFF" }}>

        {/* ── Hero ── */}
        <section className="page-hero" style={{ background: "var(--primary)", padding: "140px 24px 100px", minHeight: "420px", position: "relative", overflow: "hidden" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 30% 30%, rgba(255,255,255,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
            <Reveal delay={0}>
              <a href="/media" className="album-back-link">← Terug naar Impressies</a>
            </Reveal>
            <RevealText text={album.titel} as="h1" pageDelay={0} style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, color: "#FFFFFF", margin: "0 0 16px" }} />
            <Reveal delay={180}>
              <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.75)", margin: 0, fontWeight: 500 }}>
                {album.datum}{photos.length > 0 ? ` · ${photos.length} foto${photos.length !== 1 ? "'s" : ""}` : ""}
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
            <Gallery photos={photos} />
          </div>
        </section>

      </main>
      <Footer />

      <style>{`
        @media (max-width: 640px) {
          .page-hero { padding: 100px 20px 80px !important; height: auto !important; min-height: 320px !important; }
          .gallery-section { padding: 40px 16px 80px !important; }
        }
        .album-back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: rgba(255,255,255,0.7);
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          margin-bottom: 20px;
          letter-spacing: 0.02em;
          transition: color 0.15s;
        }
        .album-back-link:hover { color: #fff; }
      `}</style>
    </>
  );
}
