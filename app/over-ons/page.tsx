"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

const statCards = [
  {
    label: "Stemmen",
    value: "60",
    sub: "Verdeeld over 5 stemgroepen: alt, mezzo, sopraan, tenor en bas.",
    big: true,
  },
  {
    label: "Dirigent",
    value: "Tom Mordang",
    sub: "Leidt het koor ononderbroken sinds de oprichting in 2008.",
    big: false,
  },
  {
    label: "Begeleiding",
    value: "Piano + band",
    sub: "Piano, live band en bijpassende choreografie bij elk optreden.",
    big: false,
  },
];

const sfeerItems = [
  { seed: "divers-rep-1", label: "Repetitie", sub: "Dinsdag · De Schakel" },
  { seed: "divers-optreden-1", label: "Optreden", sub: "Op het podium" },
  { seed: "divers-groep-1", label: "Groepsfoto", sub: "Het hele koor" },
];

export default function OverOnsPage() {
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
              background:
                "radial-gradient(ellipse 80% 60% at 30% 30%, rgba(255,255,255,0.12) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
            <Reveal delay={0}>
              <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.65)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Over ons
              </p>
            </Reveal>
            <Reveal delay={100}>
              <h1 style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, color: "#FFFFFF", margin: "0 0 24px" }}>
                Over ons
              </h1>
            </Reveal>
            <Reveal delay={180}>
              <p style={{ fontSize: "clamp(15px, 1.6vw, 18px)", lineHeight: 1.7, color: "rgba(255,255,255,0.82)", maxWidth: "520px", margin: 0 }}>
                Leer ons kennen — wie we zijn, waar we vandaan komen en wat ons elke dinsdagavond bij elkaar brengt.
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

        {/* ── 2. Intro blok ── */}
        <section style={{ background: "#FFFFFF", padding: "100px 24px 80px" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
            <Reveal>
              <h2
                style={{
                  fontSize: "clamp(26px, 4vw, 50px)",
                  fontWeight: 800,
                  letterSpacing: "-2px",
                  lineHeight: 1.15,
                  color: "#111",
                  margin: 0,
                }}
              >
                Een swingend koor uit Gilze met 60 stemmen, piano, band en bijpassende choreo.
              </h2>
            </Reveal>
          </div>
        </section>

        {/* ── 3. Ons verhaal ── */}
        <section
          style={{
            background: "#FFFFFF",
            padding: "20px 24px 120px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}
              className="over-ons-grid"
            >
              {/* Left: text */}
              <Reveal>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(243,106,42,0.09)",
                    border: "1px solid rgba(243,106,42,0.18)",
                    borderRadius: "100px",
                    padding: "4px 14px",
                    marginBottom: "20px",
                  }}
                >
                  <span style={{ fontSize: "10px", color: "var(--primary)", fontWeight: 700, letterSpacing: "0.08em" }}>
                    ONS VERHAAL
                  </span>
                </div>
                <h2
                  style={{
                    fontSize: "clamp(26px, 3.5vw, 40px)",
                    fontWeight: 800,
                    letterSpacing: "-1.5px",
                    lineHeight: 1.15,
                    color: "#111",
                    margin: "0 0 28px",
                  }}
                >
                  Opgericht met passie, gegroeid met plezier
                </h2>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 0" }}>
                  {[
                    "Opgericht in 2008 in Gilze",
                    "Gegroeid van klein ensemble naar 60 stemmen",
                    "Altijd met dezelfde passie: popmuziek die mensen bij elkaar brengt",
                  ].map((item, i, arr) => (
                    <li
                      key={item}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "14px",
                        padding: "14px 0",
                        borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
                      }}
                    >
                      <span
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          background: "var(--primary)",
                          flexShrink: 0,
                          marginTop: "9px",
                        }}
                      />
                      <span style={{ fontSize: "16px", color: "#555", lineHeight: 1.65 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>

              {/* Right: image */}
              <Reveal delay={120}>
                <div
                  style={{
                    borderRadius: "24px",
                    overflow: "hidden",
                    aspectRatio: "4/3",
                    position: "relative",
                  }}
                >
                  <img
                    src="https://picsum.photos/seed/popkoor-verhaal/700/525"
                    alt="Koor in repetitie"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "20px",
                      left: "20px",
                      background: "rgba(255,255,255,0.92)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      borderRadius: "12px",
                      padding: "10px 16px",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#111" }}>Popkoor Divers</p>
                    <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#888" }}>Gilze · opgericht 2008</p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Wave → warm */}
          <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
            <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "80px" }}>
              <path d="M0,80 L0,42 Q360,5 720,38 Q1080,68 1440,22 L1440,80 Z" fill="#FFF8F4" />
            </svg>
          </div>
        </section>

        {/* ── 4. Het koor vandaag ── */}
        <section
          style={{
            background: "#FFF8F4",
            padding: "100px 24px 120px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse 100% 70% at 50% 50%, rgba(243,106,42,0.06) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>

            <Reveal style={{ textAlign: "center", marginBottom: "56px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(243,106,42,0.09)",
                  border: "1px solid rgba(243,106,42,0.18)",
                  borderRadius: "100px",
                  padding: "4px 14px",
                  marginBottom: "16px",
                }}
              >
                <span style={{ fontSize: "10px", color: "var(--primary)", fontWeight: 700, letterSpacing: "0.08em" }}>
                  HET KOOR VANDAAG
                </span>
              </div>
              <h2
                style={{
                  fontSize: "clamp(28px, 4vw, 44px)",
                  fontWeight: 800,
                  letterSpacing: "-1.5px",
                  lineHeight: 1.15,
                  color: "#111",
                  margin: 0,
                }}
              >
                Wie zingt er mee?
              </h2>
            </Reveal>

            {/* Stat cards */}
            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "56px" }}
              className="stat-cards-grid"
            >
              {statCards.map((card, i) => (
                <Reveal key={card.label} delay={i * 100}>
                  <div
                    style={{
                      background: "#FFFFFF",
                      borderRadius: "20px",
                      padding: "36px 28px",
                      border: "1px solid rgba(0,0,0,0.07)",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                      height: "100%",
                      transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    className="card-hover"
                  >
                    <p
                      style={{
                        margin: "0 0 6px",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "var(--primary)",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      {card.label}
                    </p>
                    <p
                      style={{
                        margin: "0 0 14px",
                        fontSize: card.big ? "48px" : "22px",
                        fontWeight: 800,
                        color: "#111",
                        lineHeight: 1.05,
                        letterSpacing: card.big ? "-2px" : "-0.5px",
                      }}
                    >
                      {card.value}
                    </p>
                    <p style={{ margin: 0, fontSize: "14px", color: "#666", lineHeight: 1.65 }}>{card.sub}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <p
                style={{
                  maxWidth: "660px",
                  margin: "0 auto",
                  fontSize: "16px",
                  lineHeight: 1.8,
                  color: "#555",
                  textAlign: "center",
                }}
              >
                Divers onderscheidt zich door een professionele aanpak én een warme, open sfeer. We repeteren wekelijks onder vakkundige leiding, zingen voor volle zalen en zorgen samen voor een show die publiek én koor bijblijft.
              </p>
            </Reveal>
          </div>

          {/* Wave → white */}
          <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
            <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "80px" }}>
              <path d="M0,80 L0,48 Q360,12 720,44 Q1080,72 1440,25 L1440,80 Z" fill="#FFFFFF" />
            </svg>
          </div>
        </section>

        {/* ── 5. Repetities ── */}
        <section
          style={{
            background: "#FFFFFF",
            padding: "100px 24px 120px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}
              className="over-ons-grid"
            >
              {/* Left: image */}
              <Reveal>
                <div
                  style={{
                    borderRadius: "24px",
                    overflow: "hidden",
                    aspectRatio: "4/3",
                    position: "relative",
                  }}
                >
                  <img
                    src="https://picsum.photos/seed/popkoor-rep/700/525"
                    alt="Repetitie in De Schakel"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "20px",
                      left: "20px",
                      background: "rgba(255,255,255,0.92)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      borderRadius: "12px",
                      padding: "10px 16px",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#111" }}>De Schakel</p>
                    <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#888" }}>Gilze</p>
                  </div>
                </div>
              </Reveal>

              {/* Right: text */}
              <Reveal delay={120}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(243,106,42,0.09)",
                    border: "1px solid rgba(243,106,42,0.18)",
                    borderRadius: "100px",
                    padding: "4px 14px",
                    marginBottom: "20px",
                  }}
                >
                  <span style={{ fontSize: "10px", color: "var(--primary)", fontWeight: 700, letterSpacing: "0.08em" }}>
                    REPETITIES
                  </span>
                </div>
                <h2
                  style={{
                    fontSize: "clamp(26px, 3.5vw, 40px)",
                    fontWeight: 800,
                    letterSpacing: "-1.5px",
                    lineHeight: 1.15,
                    color: "#111",
                    margin: "0 0 28px",
                  }}
                >
                  Elke dinsdag om 20:00
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
                  {[
                    { icon: "🕗", text: "Elke dinsdag 20:00" },
                    { icon: "📍", text: "De Schakel, Gilze" },
                    { icon: "🎵", text: "Vrijblijvend komen proeven is altijd mogelijk" },
                  ].map((item) => (
                    <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "10px",
                          background: "rgba(243,106,42,0.09)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "17px",
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </div>
                      <span style={{ fontSize: "15px", color: "#444", fontWeight: 500, lineHeight: 1.5 }}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
                <a
                  href="/meezingen"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "var(--primary)",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "14px",
                    padding: "12px 24px",
                    borderRadius: "35px",
                    textDecoration: "none",
                    transition: "opacity 0.15s, transform 0.12s",
                    boxShadow: "0 4px 16px rgba(243,106,42,0.28)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.87";
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
          </div>

          {/* Wave → warm */}
          <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
            <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "80px" }}>
              <path d="M0,80 L0,55 Q360,20 720,50 Q1080,76 1440,35 L1440,80 Z" fill="#FFF8F4" />
            </svg>
          </div>
        </section>

        {/* ── 6. Sfeer ── */}
        <section
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
                <h2
                  style={{
                    fontSize: "clamp(28px, 4vw, 44px)",
                    fontWeight: 800,
                    letterSpacing: "-1.5px",
                    lineHeight: 1.15,
                    color: "#111",
                    margin: 0,
                  }}
                >
                  Sfeer in beeld
                </h2>
              </div>
              <a
                href="#"
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
                <Reveal key={item.seed} delay={i * 100}>
                  <div
                    style={{
                      borderRadius: "20px",
                      overflow: "hidden",
                      position: "relative",
                      aspectRatio: "4/3",
                      cursor: "pointer",
                    }}
                    className="card-hover"
                  >
                    <img
                      src={`https://picsum.photos/seed/${item.seed}/600/450`}
                      alt={item.label}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        transition: "transform 0.4s ease",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
                      }}
                    />
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
          style={{
            background: "var(--gradient-section), #FDE8D8",
            padding: "100px 24px 120px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
            <Reveal>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(243,106,42,0.12)",
                  border: "1px solid rgba(243,106,42,0.25)",
                  borderRadius: "100px",
                  padding: "4px 14px",
                  marginBottom: "20px",
                }}
              >
                <span style={{ fontSize: "10px", color: "var(--primary)", fontWeight: 700, letterSpacing: "0.08em" }}>
                  WORD LID
                </span>
              </div>
              <h2
                style={{
                  fontSize: "clamp(28px, 4vw, 44px)",
                  fontWeight: 800,
                  letterSpacing: "-1.5px",
                  lineHeight: 1.15,
                  color: "#111",
                  margin: "0 0 20px",
                }}
              >
                Kom een keer meezingen
              </h2>
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
        @media (max-width: 768px) {
          .over-ons-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .stat-cards-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 641px) and (max-width: 900px) {
          .stat-cards-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .sfeer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .sfeer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
