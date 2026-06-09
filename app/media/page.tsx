import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import { createClient } from "@/lib/supabase/server";
import { getPublicUrl } from "@/lib/r2";
import AlbumCard from "./AlbumCard";

export const dynamic = "force-dynamic";


export default async function MediaPage() {
  const supabase = await createClient();

  // Albums uit albums tabel, met eerste impressies-foto als cover
  const { data: albumsData } = await supabase
    .from("albums")
    .select("id, slug, titel, datum, volgorde")
    .order("created_at", { ascending: false });

  // Haal voor elk album de impressies fotos op
  const albums = await Promise.all(
    (albumsData ?? []).map(async (album) => {
      const { data: fotos } = await supabase
        .from("fotos")
        .select("r2_key")
        .eq("album_id", album.id)
        .eq("impressies", true)
        .order("volgorde")
        .order("created_at");
      const photos = (fotos ?? []).map((f) => getPublicUrl(f.r2_key));
      return { ...album, photos };
    })
  );

  const visibleAlbums = albums.filter((a) => a.photos.length > 0);
  const isEmpty = visibleAlbums.length === 0;

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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }} className="media-grid">
                {visibleAlbums.map((album, i) => (
                  <Reveal key={album.id} delay={Math.min(i % 3, 2) * 60}>
                    <AlbumCard slug={album.slug} title={album.titel} datum={album.datum} photos={album.photos} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>

      </main>
      <Footer />

      <style>{`
        @media (max-width: 900px) { .media-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 560px) { .media-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 640px) {
          .page-hero { padding: 100px 20px 80px !important; height: auto !important; min-height: 320px !important; }
        }
      `}</style>
    </>
  );
}

