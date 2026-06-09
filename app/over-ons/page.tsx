"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";

const sfeerItems = [
  { gradient: "linear-gradient(135deg, rgba(243,106,42,0.2) 0%, #FDE8D8 100%)", label: "Repetitie", sub: "Dinsdag · De Schakel" },
  { gradient: "linear-gradient(135deg, rgba(243,106,42,0.12) 0%, rgba(243,106,42,0.22) 100%)", label: "Optreden", sub: "Op het podium" },
  { gradient: "linear-gradient(135deg, #FDE8D8 0%, rgba(243,106,42,0.08) 60%, rgba(243,106,42,0.18) 100%)", label: "Groepsfoto", sub: "Het hele koor" },
];

export default function OverOnsPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#FFFFFF" }}>

        {/* ── Hero — foto met uitgebreide bento ── */}
        <section style={{ position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/overons_image.jpg" alt="" aria-hidden="true"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }} />
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }} />

          <div style={{ minHeight: "100svh", padding: "140px 24px 60px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", zIndex: 1 }}>

            {/* Heading */}
            <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
              <Reveal delay={0}>
                <RevealText text="Over ons" as="h1" pageDelay={0}
                  style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, color: "#FFFFFF", margin: "0 0 14px" }} />
                <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", lineHeight: 1.7, color: "rgba(255,255,255,0.80)", maxWidth: "480px", margin: "0 0 28px" }}>
                  Swingend popkoor uit Gilze — al meer dan 15 jaar passie voor popmuziek.
                </p>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <a
                    href="/contact#meezingen"
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: "15px", padding: "13px 28px", borderRadius: "35px", textDecoration: "none", border: "1.5px solid var(--primary)", transition: "background 0.2s, border-color 0.2s, transform 0.12s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary-light)"; e.currentTarget.style.borderColor = "var(--primary-light)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--primary)"; e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    Kom meezingen →
                  </a>
                  <a
                    href="/contact#boeken"
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#7C3AED", color: "#fff", fontWeight: 600, fontSize: "15px", padding: "13px 28px", borderRadius: "35px", textDecoration: "none", border: "1.5px solid #7C3AED", transition: "background 0.2s, border-color 0.2s, transform 0.12s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#a855f7"; e.currentTarget.style.borderColor = "#a855f7"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#7C3AED"; e.currentTarget.style.borderColor = "#7C3AED"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    Boek ons optreden
                  </a>
                </div>
              </Reveal>
            </div>

            {/* Bento grid — 2 rijen */}
            <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", paddingTop: "40px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }} className="verhaal-bento">

                {/* Rij 1 */}
                <Reveal delay={80} style={{ gridColumn: "1 / 3", height: "100%" }}>
                  <div style={{ background: "rgba(255,255,255,0.10)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderRadius: "20px", padding: "28px 32px", border: "1px solid rgba(255,255,255,0.15)", height: "100%" }}>
                    <p style={{ fontSize: "clamp(17px, 1.8vw, 22px)", fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.25, color: "#fff", margin: "0 0 10px" }}>
                      Opgericht met passie, gegroeid met plezier
                    </p>
                    <p style={{ fontSize: "14px", lineHeight: 1.75, color: "rgba(255,255,255,0.72)", margin: 0 }}>
                      Wat begon als een klein ensemble van muziekliefhebbers groeide uit tot meer dan 60 stemmen. Met piano, live band en bijpassende choreografie zorgen we voor een complete show.
                    </p>
                  </div>
                </Reveal>

                <Reveal delay={120} style={{ height: "100%" }}>
                  <div style={{ background: "#7C3AED", borderRadius: "20px", padding: "28px 32px", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
                    <p style={{ fontSize: "52px", fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: "-3px", margin: "0 0 4px" }}>2008</p>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.72)", margin: 0 }}>Jaar van oprichting · Gilze</p>
                  </div>
                </Reveal>

                {/* Rij 2 */}
                <Reveal delay={160} style={{ height: "100%" }}>
                  <div style={{ background: "var(--primary)", borderRadius: "20px", padding: "28px 32px", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
                    <p style={{ fontSize: "52px", fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: "-3px", margin: "0 0 4px" }}>60<span style={{ fontSize: "28px" }}>+</span></p>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.80)", margin: 0 }}>zangers & zangeressen · 5 stemgroepen</p>
                  </div>
                </Reveal>

                <Reveal delay={200} style={{ height: "100%" }}>
                  <div style={{ background: "rgba(255,255,255,0.10)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderRadius: "20px", padding: "28px 32px", border: "1px solid rgba(255,255,255,0.15)", height: "100%" }}>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>Dirigent</p>
                    <p style={{ fontSize: "20px", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", margin: "0 0 6px" }}>Tom Mordang</p>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.70)", lineHeight: 1.6, margin: 0 }}>Leidt het koor met een frisse en positieve energie.</p>
                  </div>
                </Reveal>

                <Reveal delay={240} style={{ height: "100%" }}>
                  <div style={{ background: "rgba(255,255,255,0.10)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderRadius: "20px", padding: "28px 32px", border: "1px solid rgba(255,255,255,0.15)", height: "100%" }}>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>Repetities</p>
                    <p style={{ fontSize: "20px", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", margin: "0 0 6px" }}>Dinsdag · 20:00</p>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.70)", lineHeight: 1.6, margin: 0 }}>De Schakel, Gilze — proeven is altijd welkom.</p>
                  </div>
                </Reveal>

              </div>
            </div>
          </div>

          {/* Wave → warm */}
          <div aria-hidden="true" style={{ position: "relative", lineHeight: 0, zIndex: 1 }}>
            <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "80px" }}>
              <path d="M0,80 L0,42 Q360,5 720,38 Q1080,68 1440,22 L1440,80 Z" fill="#FFF8F4" />
            </svg>
          </div>

          <style>{`
            @media (max-width: 768px) {
              .verhaal-bento { grid-template-columns: 1fr 1fr !important; }
              .verhaal-bento > div:first-child { grid-column: 1 / 3 !important; }
            }
            @media (max-width: 480px) {
              .verhaal-bento { grid-template-columns: 1fr !important; }
              .verhaal-bento > div:first-child { grid-column: 1 !important; }
            }
          `}</style>
        </section>

        {/* ── 6. Sfeer ── */}
        <section
          className="section-pad"
          style={{
            background: "#FFF8F4",
            padding: "100px 24px 140px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse 100% 70% at 50% 50%, rgba(243,106,42,0.07) 0%, rgba(255,255,255,0) 70%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>

            <Reveal
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                marginBottom: "48px",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div>
                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "rgba(0,0,0,0.35)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Zo ziet het eruit
                </p>
                <RevealText
                  text="Sfeer in beeld"
                  pageDelay={1050}
                  style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.15, color: "#111", margin: 0 }}
                />
              </div>
              <a
                href="/media"
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--primary)",
                  textDecoration: "none",
                  paddingBottom: "4px",
                  borderBottom: "2px solid rgba(243,106,42,0.25)",
                  transition: "border-color 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(243,106,42,0.25)")}
              >
                Naar foto&apos;s &amp; video&apos;s →
              </a>
            </Reveal>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }} className="sfeer-grid">
              {sfeerItems.map((item, i) => (
                <Reveal key={item.label} delay={i * 100}>
                  <div
                    style={{
                      borderRadius: "20px",
                      overflow: "hidden",
                      position: "relative",
                      aspectRatio: "4/3",
                      cursor: "pointer",
                      background: item.gradient,
                    }}
                    className="card-hover"
                  >
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }} />
                    <div style={{ position: "absolute", top: "16px", left: "16px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          background: "rgba(255,255,255,0.92)",
                          borderRadius: "100px",
                          padding: "4px 12px",
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "#111",
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px" }}>
                      <p style={{ margin: "0 0 2px", fontSize: "15px", fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
                        {item.label}
                      </p>
                      <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.65)" }}>{item.sub}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Wave → cream */}
          <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
            <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "80px" }}>
              <path d="M0,80 L0,48 Q360,12 720,44 Q1080,72 1440,25 L1440,80 Z" fill="#FDE8D8" />
            </svg>
          </div>
        </section>

        {/* ── 7. CTA ── */}
        <section
          className="section-pad"
          style={{
            background: "var(--gradient-section), #FDE8D8",
            padding: "100px 24px 120px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
            <Reveal>
              <RevealText
                text="Kom een keer meezingen"
                pageDelay={1200}
                style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.15, color: "#111", margin: "0 0 20px" }}
              />
              <p
                style={{
                  fontSize: "16px",
                  lineHeight: 1.75,
                  color: "#555",
                  margin: "0 auto 36px",
                  maxWidth: "500px",
                }}
              >
                Nieuwsgierig? Kom gewoon langs op dinsdagavond. Geen auditie, geen verplichtingen — gewoon meezingen en kijken of het iets voor jou is.
              </p>
              <a
                href="/meezingen"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "var(--primary)",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "15px",
                  padding: "14px 28px",
                  borderRadius: "35px",
                  textDecoration: "none",
                  boxShadow: "0 4px 20px rgba(243,106,42,0.28)",
                  transition: "transform 0.12s, opacity 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Meer info →
              </a>
            </Reveal>
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
        @media (min-width: 641px) and (max-width: 900px) {
          .sfeer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .sfeer-grid {
            grid-template-columns: 1fr !important;
          }
        }

        /* ── Mobile overrides ── */
        @media (max-width: 640px) {
          .page-hero {
            padding: 100px 20px 80px !important;
            height: auto !important;
            min-height: 320px !important;
          }
          .section-pad {
            padding-top: 60px !important;
            padding-bottom: 72px !important;
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
        }
      `}</style>
    </>
  );
}
