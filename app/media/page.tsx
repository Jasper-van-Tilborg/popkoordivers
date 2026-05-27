import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import { createClient } from "@/lib/supabase/server";
import { IconPlay } from "@/components/icons";

export const dynamic = "force-dynamic";

interface MediaItem {
  id: number;
  type: "foto" | "video";
  url: string;
  label: string;
  datum: string | null;
  volgorde: number;
}

function youtubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m?.[1] ?? null;
}

const placeholderGradients = [
  "linear-gradient(135deg, rgba(243,106,42,0.18) 0%, #FDE8D8 50%, rgba(243,106,42,0.06) 100%)",
  "linear-gradient(135deg, #FDE8D8 0%, rgba(243,106,42,0.08) 60%, rgba(243,106,42,0.2) 100%)",
  "linear-gradient(135deg, rgba(243,106,42,0.1) 0%, #FFF0E8 50%, rgba(243,106,42,0.15) 100%)",
  "linear-gradient(135deg, rgba(243,106,42,0.22) 0%, rgba(243,106,42,0.04) 100%)",
  "linear-gradient(135deg, #FFF8F4 0%, rgba(243,106,42,0.16) 100%)",
  "linear-gradient(135deg, rgba(243,106,42,0.08) 0%, #FDE8D8 70%, rgba(243,106,42,0.12) 100%)",
];

export default async function MediaPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("media")
    .select("id, type, url, label, datum, volgorde")
    .order("volgorde")
    .order("created_at", { ascending: false });

  const items: MediaItem[] = data ?? [];

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#FFFFFF" }}>

        {/* ── Hero ── */}
        <section
          style={{
            background: "var(--primary)",
            padding: "140px 24px 100px",
            height: "420px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 30% 30%, rgba(255,255,255,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
            <Reveal delay={0}>
              <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.65)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Foto&apos;s &amp; Video&apos;s
              </p>
            </Reveal>
            <RevealText
              text="Foto's & Video's"
              as="h1"
              pageDelay={0}
              style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, color: "#FFFFFF", margin: "0 0 24px" }}
            />
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

            {items.length === 0 ? (
              <Reveal>
                <div
                  style={{
                    textAlign: "center",
                    padding: "80px 24px",
                    background: "#FFF8F4",
                    borderRadius: "20px",
                    border: "1px solid rgba(243,106,42,0.1)",
                  }}
                >
                  <p style={{ fontSize: "17px", color: "#aaa", margin: 0 }}>
                    Foto&apos;s en video&apos;s worden binnenkort toegevoegd.
                  </p>
                </div>
              </Reveal>
            ) : (
              <div
                style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}
                className="media-grid"
              >
                {items.map((item, i) => (
                  <Reveal key={item.id} delay={Math.min(i % 3, 2) * 60}>
                    {item.type === "video" ? (
                      <VideoCard item={item} />
                    ) : (
                      <FotoCard item={item} gradient={placeholderGradients[i % placeholderGradients.length]} />
                    )}
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
      `}</style>
    </>
  );
}

function FotoCard({ item, gradient }: { item: MediaItem; gradient: string }) {
  const isPlaceholder = !item.url || item.url.startsWith("placeholder");
  return (
    <div
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "pointer",
      }}
      className="card-hover"
    >
      <div
        style={{
          aspectRatio: "4/3",
          background: isPlaceholder ? gradient : undefined,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {!isPlaceholder && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.url}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
          />
        )}
      </div>
      <ItemMeta item={item} />
    </div>
  );
}

function VideoCard({ item }: { item: MediaItem }) {
  const vid = youtubeId(item.url);
  return (
    <div
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ position: "relative", aspectRatio: "16/9" }}>
        {vid ? (
          <iframe
            src={`https://www.youtube.com/embed/${vid}`}
            title={item.label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(135deg, rgba(243,106,42,0.12) 0%, #FDE8D8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--primary)",
            }}
          >
            <IconPlay size={32} />
          </div>
        )}
      </div>
      <ItemMeta item={item} />
    </div>
  );
}

function ItemMeta({ item }: { item: MediaItem }) {
  return (
    <div style={{ padding: "14px 16px", background: "#FFFFFF" }}>
      <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#111", lineHeight: 1.3 }}>
        {item.label}
      </p>
      {item.datum && (
        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#aaa", fontWeight: 500 }}>
          {item.datum}
        </p>
      )}
    </div>
  );
}
