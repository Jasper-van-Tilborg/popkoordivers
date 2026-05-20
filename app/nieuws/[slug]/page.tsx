import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { berichten } from "../data";

export function generateStaticParams() {
  return berichten.map((b) => ({ slug: b.slug }));
}

export default async function NieuwsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bericht = berichten.find((b) => b.slug === slug);

  if (!bericht) notFound();

  const paragraphs = bericht.inhoud.split("\n\n").filter(Boolean);

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#FFFFFF" }}>

        {/* ── Hero ── */}
        <section
          style={{
            background: "var(--primary)",
            padding: "140px 24px 100px",
            minHeight: "420px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse 80% 60% at 30% 30%, rgba(255,255,255,0.12) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>

            <Reveal delay={0}>
            <a
              href="/nieuws"
              className="detail-back"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.65)",
                textDecoration: "none",
                marginBottom: "28px",
                transition: "color 0.15s",
              }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Terug naar nieuws
            </a>
            </Reveal>

            <Reveal delay={80}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.65)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Nieuws
              </span>
              <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "rgba(255,255,255,0.35)" }} />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--primary)", background: "#fff", padding: "3px 10px", borderRadius: "100px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {bericht.categorie}
              </span>
            </div>
            </Reveal>

            <Reveal delay={160}>
            <h1 style={{ fontSize: "clamp(28px, 4.5vw, 56px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, color: "#FFFFFF", margin: "0 0 20px", maxWidth: "860px" }}>
              {bericht.titel}
            </h1>
            </Reveal>

            <Reveal delay={220}>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>
              {bericht.datum}
            </p>
            </Reveal>
          </div>

          {/* Wave → white */}
          <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
            <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "60px" }}>
              <path d="M0,60 L0,30 Q360,0 720,25 Q1080,50 1440,15 L1440,60 Z" fill="#FFFFFF" />
            </svg>
          </div>
        </section>

        {/* ── Full-width image ── */}
        <Reveal>
        <section style={{ background: "#FFFFFF", padding: "48px 24px 0" }}>
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              borderRadius: "24px",
              overflow: "hidden",
              aspectRatio: "21/9",
            }}
          >
            <img
              src={`https://picsum.photos/seed/${bericht.afbeelding}-detail/1400/600`}
              alt={bericht.titel}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        </section>
        </Reveal>

        {/* ── Artikel tekst ── */}
        <section style={{ background: "#FFFFFF", padding: "72px 24px 100px" }}>
          <div style={{ maxWidth: "700px", margin: "0 auto" }}>

            {/* Intro / lead */}
            <p
              style={{
                fontSize: "19px",
                lineHeight: 1.75,
                color: "#333",
                fontWeight: 500,
                margin: "0 0 36px",
                paddingBottom: "36px",
                borderBottom: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              {bericht.intro}
            </p>

            {/* Body paragraphs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {paragraphs.map((p, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: "16px",
                    lineHeight: 1.85,
                    color: "#444",
                    margin: 0,
                  }}
                >
                  {p}
                </p>
              ))}
            </div>

            {/* Back link */}
            <div style={{ marginTop: "64px", paddingTop: "32px", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
              <a
                href="/nieuws"
                className="detail-back-btn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(243,106,42,0.08)",
                  color: "var(--primary)",
                  fontWeight: 700,
                  fontSize: "14px",
                  padding: "11px 22px",
                  borderRadius: "35px",
                  textDecoration: "none",
                  border: "1.5px solid rgba(243,106,42,0.2)",
                  transition: "background 0.15s, color 0.15s, transform 0.12s",
                }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                Terug naar nieuws
              </a>
            </div>
          </div>
        </section>

      </main>
      <Footer />

      <style>{`
        .detail-back:hover { color: #fff !important; }
        .detail-back-btn:hover {
          background: var(--primary) !important;
          color: #fff !important;
          transform: translateY(-1px) !important;
        }
      `}</style>
    </>
  );
}
