import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { berichten } from "./data";

export default function NieuwsPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#FFFFFF" }}>

        {/* ── 1. Hero ── */}
        <section
          style={{
            background: "var(--primary)",
            padding: "140px 24px 100px",
            height: "420px",
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
              <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.65)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Nieuws
              </p>
            </Reveal>
            <Reveal delay={100}>
              <h1 style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, color: "#FFFFFF", margin: "0 0 24px" }}>
                Nieuws
              </h1>
            </Reveal>
            <Reveal delay={180}>
              <p style={{ fontSize: "clamp(15px, 1.6vw, 18px)", lineHeight: 1.7, color: "rgba(255,255,255,0.82)", maxWidth: "520px", margin: 0 }}>
                Het laatste nieuws van Popkoor Divers — optredens, nieuwe leden en alles wat er speelt.
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

        {/* ── 2. Nieuwsoverzicht ── */}
        <section
          style={{
            background: "var(--gradient-section), #FFF8F4",
            padding: "80px 24px 120px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>

            <Reveal style={{ marginBottom: "48px" }}>
              <p style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: 700, color: "var(--primary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Alle berichten
              </p>
              <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.15, color: "#111", margin: 0 }}>
                Laatste nieuws
              </h2>
            </Reveal>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }} className="nieuws-grid">
              {berichten.map((bericht, i) => (
                <Reveal key={bericht.id} delay={Math.min(i % 3, 2) * 80}>
                  <a
                    href={`/nieuws/${bericht.slug}`}
                    style={{ display: "block", textDecoration: "none", height: "100%" }}
                  >
                    <article
                      style={{
                        background: "#FFFFFF",
                        borderRadius: "20px",
                        overflow: "hidden",
                        border: "1px solid rgba(0,0,0,0.07)",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        transition: "transform 0.2s, box-shadow 0.2s",
                      }}
                      className="card-hover"
                    >
                      {/* Image */}
                      <div style={{ aspectRatio: "16/9", overflow: "hidden", flexShrink: 0 }}>
                        <img
                          src={`https://picsum.photos/seed/${bericht.afbeelding}/800/450`}
                          alt={bericht.titel}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
                        />
                      </div>

                      {/* Content */}
                      <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--primary)" }}>
                            {bericht.datum}
                          </span>
                          <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#ccc", flexShrink: 0 }} />
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {bericht.categorie}
                          </span>
                        </div>

                        <h3
                          style={{
                            fontSize: "17px",
                            fontWeight: 800,
                            color: "#111",
                            letterSpacing: "-0.02em",
                            lineHeight: 1.3,
                            margin: "0 0 10px",
                          }}
                        >
                          {bericht.titel}
                        </h3>

                        <p
                          className="nieuws-intro"
                          style={{
                            fontSize: "14px",
                            lineHeight: 1.65,
                            color: "#666",
                            margin: "0 0 20px",
                            flex: 1,
                          }}
                        >
                          {bericht.intro}
                        </p>

                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "var(--primary)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            marginTop: "auto",
                          }}
                        >
                          Lees meer →
                        </span>
                      </div>
                    </article>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Wave → footer */}
          <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
            <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "80px" }}>
              <path d="M0,80 L0,55 Q360,20 720,50 Q1080,76 1440,35 L1440,80 Z" fill="#111111" />
            </svg>
          </div>
        </section>

      </main>
      <Footer />

      <style>{`
        .nieuws-intro {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @media (max-width: 900px) {
          .nieuws-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 580px) {
          .nieuws-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
