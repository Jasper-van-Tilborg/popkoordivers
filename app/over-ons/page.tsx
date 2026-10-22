"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import { useInstellingen } from "@/components/InstellingenProvider";

const infographics = [
  { titel: "Swingend & veelstemmig", sub: "Vijf stemgroepen" },
  { titel: "Eigenwijs", sub: "Met een Divers repertoire" },
  { titel: "Enthousiast samen", sub: "Een hechte club" },
];

const sfeerItems = [
  { gradient: "linear-gradient(135deg, rgba(243,106,42,0.2) 0%, #FDE8D8 100%)", label: "Repetitie", sub: "" },
  { gradient: "linear-gradient(135deg, rgba(243,106,42,0.12) 0%, rgba(243,106,42,0.22) 100%)", label: "Optreden", sub: "Op het podium" },
  { gradient: "linear-gradient(135deg, #FDE8D8 0%, rgba(243,106,42,0.08) 60%, rgba(243,106,42,0.18) 100%)", label: "Groepsfoto", sub: "Het hele koor" },
];

export default function OverOnsPage() {
  const inst = useInstellingen();
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#FFFFFF" }}>

        {/* ── Hero — foto ── */}
        <section style={{ position: "relative", overflow: "hidden", minHeight: "78svh", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/overons_image.jpg" alt="" aria-hidden="true"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }} />
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.25) 100%)" }} />

          <div className="overons-hero-inner" style={{ position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto", width: "100%", padding: "160px 24px 120px" }}>
            <Reveal delay={0}>
              <RevealText text="Over ons" as="h1" pageDelay={0}
                style={{ fontSize: "clamp(44px, 7vw, 88px)", fontWeight: 800, letterSpacing: "-3px", lineHeight: 1, color: "#FFFFFF", margin: "0 0 16px" }} />
              <p style={{ fontSize: "clamp(17px, 1.8vw, 20px)", lineHeight: 1.6, color: "rgba(255,255,255,0.85)", maxWidth: "480px", margin: "0 0 32px" }}>
                Passie voor zingen sinds 2008
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <Link
                  href="/contact#meezingen"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: "15px", padding: "13px 28px", borderRadius: "35px", textDecoration: "none", border: "1.5px solid var(--primary)", transition: "background 0.2s, border-color 0.2s, transform 0.12s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary-light)"; e.currentTarget.style.borderColor = "var(--primary-light)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--primary)"; e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  Kom meezingen →
                </Link>
                <Link
                  href="/agenda"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#7C3AED", color: "#fff", fontWeight: 600, fontSize: "15px", padding: "13px 28px", borderRadius: "35px", textDecoration: "none", border: "1.5px solid #7C3AED", transition: "background 0.2s, border-color 0.2s, transform 0.12s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#a855f7"; e.currentTarget.style.borderColor = "#a855f7"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#7C3AED"; e.currentTarget.style.borderColor = "#7C3AED"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  Waar kun je ons zien
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Wave → wit */}
          <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0, zIndex: 1 }}>
            <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "80px" }}>
              <path d="M0,80 L0,42 Q360,5 720,38 Q1080,68 1440,22 L1440,80 Z" fill="#FFFFFF" />
            </svg>
          </div>
        </section>

        {/* ── Ons verhaal ── */}
        <section className="section-pad" style={{ position: "relative", background: "#FFFFFF", padding: "80px 24px 160px", overflow: "hidden" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

            {/* Verhaal + cijfers */}
            <div className="verhaal-grid" style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: "64px", alignItems: "center" }}>
              <Reveal delay={80}>
                <h2 style={{ fontSize: "clamp(28px, 3.6vw, 44px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.15, color: "#111", margin: "0 0 20px" }}>
                  Opgericht met passie, gegroeid met plezier
                </h2>
                <p style={{ fontSize: "17px", lineHeight: 1.8, color: "#555", margin: 0, maxWidth: "540px" }}>
                  Wat begon als een klein ensemble van muziekliefhebbers groeide uit tot meer dan 60 stemmen. Met piano, live band en bijpassende choreografie zorgen we voor een complete show.
                </p>
              </Reveal>

              <div className="cijfers-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <Reveal delay={140} style={{ height: "100%" }}>
                  <div style={{ background: "#7C3AED", borderRadius: "24px", padding: "32px 28px", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%", minHeight: "200px" }}>
                    <p style={{ fontSize: "clamp(48px, 5vw, 64px)", fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: "-3px", margin: "0 0 10px" }}>2008</p>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.78)", margin: 0, lineHeight: 1.5 }}>Jaar van oprichting · Gilze</p>
                  </div>
                </Reveal>
                <Reveal delay={200} style={{ height: "100%" }}>
                  <div style={{ background: "var(--primary)", borderRadius: "24px", padding: "32px 28px", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%", minHeight: "200px" }}>
                    <p style={{ fontSize: "clamp(48px, 5vw, 64px)", fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: "-3px", margin: "0 0 10px" }}>60<span style={{ fontSize: "0.55em" }}>+</span></p>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.85)", margin: 0, lineHeight: 1.5 }}>zangers & zangeressen · 5 stemgroepen</p>
                  </div>
                </Reveal>
              </div>
            </div>

            {/* Kenmerken */}
            <div className="kenmerken-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px", marginTop: "96px", paddingTop: "40px", borderTop: "1px solid var(--border)" }}>
              {infographics.map((item, i) => (
                <Reveal key={item.titel} delay={i * 80}>
                  <span aria-hidden="true" style={{ display: "block", width: "28px", height: "4px", borderRadius: "4px", background: i === 1 ? "#7C3AED" : "var(--primary)", marginBottom: "18px" }} />
                  <p style={{ fontSize: "18px", fontWeight: 800, color: "#111", letterSpacing: "0.02em", textTransform: "uppercase", lineHeight: 1.25, margin: "0 0 6px" }}>{item.titel}</p>
                  <p style={{ fontSize: "15px", color: "#666", lineHeight: 1.6, margin: 0 }}>{item.sub}</p>
                </Reveal>
              ))}
            </div>

            {/* Dirigent + repetities */}
            <div className="info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "80px" }}>
              <Reveal delay={0} style={{ height: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "24px", background: "#FFF8F4", borderRadius: "24px", padding: "24px", height: "100%", border: "1px solid rgba(243,106,42,0.12)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/tom_mordang.jpg" alt="Tom Mordang" style={{ width: "112px", height: "112px", borderRadius: "18px", objectFit: "cover", flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--primary)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>Dirigent</p>
                    <p style={{ fontSize: "22px", fontWeight: 800, color: "#111", letterSpacing: "-0.5px", margin: "0 0 6px" }}>Tom Mordang</p>
                    <p style={{ fontSize: "14px", color: "#555", lineHeight: 1.6, margin: 0 }}>Leidt het koor met een frisse en positieve energie.</p>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={100} style={{ height: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "24px", background: "#FFF8F4", borderRadius: "24px", padding: "24px", height: "100%", border: "1px solid rgba(243,106,42,0.12)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/deschakel.jpg" alt="CCGR De Schakel" style={{ width: "112px", height: "112px", borderRadius: "18px", objectFit: "cover", flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "#7C3AED", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>Repetities</p>
                    <p style={{ fontSize: "22px", fontWeight: 800, color: "#111", letterSpacing: "-0.5px", margin: "0 0 6px" }}>{inst.repetitie_dag} · {inst.repetitie_tijd}</p>
                    <p style={{ fontSize: "14px", color: "#555", lineHeight: 1.6, margin: 0 }}>{inst.repetitie_locatie} — meezingen is altijd welkom.</p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Wave → warm */}
          <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
            <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "80px" }}>
              <path d="M0,80 L0,48 Q360,12 720,44 Q1080,72 1440,25 L1440,80 Z" fill="#FFF8F4" />
            </svg>
          </div>

          <style>{`
            @media (max-width: 900px) {
              .verhaal-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
              .info-grid { grid-template-columns: 1fr !important; }
            }
            @media (max-width: 640px) {
              .overons-hero-inner { padding: 130px 20px 100px !important; }
              .kenmerken-grid { grid-template-columns: 1fr !important; gap: 28px !important; margin-top: 64px !important; }
              .info-grid { margin-top: 56px !important; }
            }
            @media (max-width: 420px) {
              .cijfers-grid { grid-template-columns: 1fr !important; }
              .info-grid img { width: 80px !important; height: 80px !important; }
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
              <Link
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
              </Link>
            </Reveal>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }} className="sfeer-grid">
              {sfeerItems.map((item, i) => (
                <Reveal key={item.label} delay={i * 100}>
                  <Link
                    href="/media"
                    style={{
                      display: "block",
                      borderRadius: "20px",
                      overflow: "hidden",
                      position: "relative",
                      aspectRatio: "4/3",
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
                      <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.65)" }}>{item.sub || `${inst.repetitie_dag} · ${inst.repetitie_locatie}`}</p>
                    </div>
                  </Link>
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
                Nieuwsgierig? Kom gewoon langs op {inst.repetitie_dag.toLowerCase()}avond. Geen auditie, geen verplichtingen — gewoon meezingen en kijken of het iets voor jou is.
              </p>
              <Link
                href="/contact#meezingen"
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
              </Link>
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
