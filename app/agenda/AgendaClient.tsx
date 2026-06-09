"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";

interface AgendaItem {
  id: number;
  titel: string;
  datum: string;
  datum_sorteer: string | null;
  tijd: string | null;
  locatie: string | null;
  label: string | null;
  label_kleur: string | null;
  beschrijving: string | null;
  link: string | null;
  fotos_url: string | null;
}

interface Props {
  komend: AgendaItem[];
  archief: AgendaItem[];
}

const maanden: Record<string, string> = {
  januari: "jan", februari: "feb", maart: "mrt", april: "apr",
  mei: "mei", juni: "jun", juli: "jul", augustus: "aug",
  september: "sep", oktober: "okt", november: "nov", december: "dec",
};

function parseDatum(datum: string) {
  const parts = datum.toLowerCase().split(/\s+/);
  const month = parts.find((p) => maanden[p]);
  const year  = parts.find((p) => /^\d{4}$/.test(p));
  const day   = parts.find((p) => /^\d{1,2}$/.test(p));
  return { day: day ?? "", month: month ? maanden[month] : datum.slice(0, 3), year: year ?? "" };
}

export default function AgendaClient({ komend, archief }: Props) {
  const [tab, setTab] = useState<"komend" | "archief">("komend");

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#FFFFFF" }}>

        {/* ── Hero ── */}
        <section className="page-hero" style={{ background: "var(--primary)", padding: "140px 24px 100px", minHeight: "420px", position: "relative", overflow: "hidden" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 30% 30%, rgba(255,255,255,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
            <RevealText
              text="Agenda"
              as="h1"
              pageDelay={0}
              style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, color: "#FFFFFF", margin: "0 0 24px" }}
            />
            <Reveal delay={200}>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setTab("komend")}
                  style={{ background: tab === "komend" ? "#FFFFFF" : "rgba(255,255,255,0.15)", color: tab === "komend" ? "var(--primary)" : "rgba(255,255,255,0.85)", border: "none", borderRadius: "35px", padding: "9px 20px", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "background 0.2s, color 0.2s" }}
                >
                  Komend ({komend.length})
                </button>
                <button
                  onClick={() => setTab("archief")}
                  style={{ background: tab === "archief" ? "#FFFFFF" : "rgba(255,255,255,0.15)", color: tab === "archief" ? "var(--primary)" : "rgba(255,255,255,0.85)", border: "none", borderRadius: "35px", padding: "9px 20px", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "background 0.2s, color 0.2s" }}
                >
                  Archief ({archief.length})
                </button>
              </div>
            </Reveal>
          </div>

          <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
            <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "60px" }}>
              <path d="M0,60 L0,30 Q360,0 720,25 Q1080,50 1440,15 L1440,60 Z" fill="#FFFFFF" />
            </svg>
          </div>
        </section>

        {/* ── Content ── */}
        <section className="section-pad" style={{ padding: "60px 24px 100px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

            {tab === "komend" && (
              <>

                {komend.length === 0 ? (
                  <Reveal>
                    <p style={{ fontSize: "15px", color: "#aaa", padding: "40px 0" }}>Nog geen optredens gepland.</p>
                  </Reveal>
                ) : (
                  <>
                    <Reveal delay={80}>
                      <p style={{ fontSize: "12px", fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 20px" }}>
                        Aankomend · {komend.length} optreden{komend.length !== 1 ? "s" : ""}
                      </p>
                    </Reveal>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "80px" }}>
                      {komend.map((event, i) => (
                        <EventRow key={event.id} event={event} i={i} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {tab === "archief" && (
              <>
                <Reveal>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                      <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#111", margin: "0 0 4px", letterSpacing: "-0.5px" }}>Archief</h2>
                      <p style={{ fontSize: "14px", color: "#888", margin: 0 }}>Afgelopen optredens</p>
                    </div>
                    <a href="/media" style={{ fontSize: "13px", fontWeight: 600, color: "var(--primary)", textDecoration: "none", borderBottom: "2px solid rgba(243,106,42,0.25)", paddingBottom: "2px" }}>
                      Naar foto&apos;s &amp; video&apos;s →
                    </a>
                  </div>
                </Reveal>

                {archief.length === 0 ? (
                  <Reveal>
                    <p style={{ fontSize: "15px", color: "#aaa", padding: "40px 0" }}>Nog geen afgelopen optredens.</p>
                  </Reveal>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {archief.map((item, i) => (
                      <Reveal key={item.id} delay={i * 60}>
                        <div style={{ background: "#FFFFFF", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: "0 0 4px", fontSize: "17px", fontWeight: 700, color: "#111", letterSpacing: "-0.02em", lineHeight: 1.3 }}>
                              {item.titel}
                            </p>
                            {item.locatie && (
                              <span style={{ fontSize: "13px", color: "#888", fontWeight: 500 }}>{item.locatie}</span>
                            )}
                          </div>
                          <p style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#aaa", flexShrink: 0, textAlign: "right" }}>
                            {item.datum}
                          </p>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Booking CTA */}
            <Reveal>
              <div
                id="boeken"
                className="booking-cta"
                style={{ marginTop: "80px", background: "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(124,58,237,0.04) 100%)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: "20px", padding: "48px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", flexWrap: "wrap" }}
              >
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: "12px", fontWeight: 700, color: "#7C3AED", letterSpacing: "0.08em", textTransform: "uppercase" }}>Iets te vieren?</p>
                  <h3 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, color: "#111", margin: 0, letterSpacing: "-0.02em" }}>Boek ons voor jouw optreden</h3>
                </div>
                <a
                  href="/contact#boeken"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#7C3AED", color: "#fff", fontWeight: 700, fontSize: "15px", padding: "14px 28px", borderRadius: "35px", textDecoration: "none", boxShadow: "0 4px 20px rgba(124,58,237,0.28)", transition: "transform 0.12s, opacity 0.15s", whiteSpace: "nowrap" }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  Aanvraag doen →
                </a>
              </div>
            </Reveal>

          </div>
        </section>

      </main>
      <Footer />

      <style>{`
        @media (max-width: 640px) {
          .page-hero { padding: 100px 20px 80px !important; height: auto !important; min-height: 320px !important; }
          .section-pad { padding-top: 48px !important; padding-bottom: 60px !important; padding-left: 20px !important; padding-right: 20px !important; }
          .booking-cta { padding: 28px 20px !important; }
          .agenda-card {
            flex-direction: column !important;
            align-items: flex-start !important;
            padding: 20px !important;
          }
        }
      `}</style>
    </>
  );
}

function EventRow({ event, i }: { event: AgendaItem; i: number }) {
  return (
    <Reveal delay={i * 120}>
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "16px",
          border: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          padding: "24px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
        }}
        className="agenda-card"
      >
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: "0 0 8px", fontSize: "19px", fontWeight: 800, color: "#111", letterSpacing: "-0.03em", lineHeight: 1.25 }}>
            {event.titel}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {event.locatie && (
              <span style={{ fontSize: "13px", color: "#777", fontWeight: 500 }}>{event.locatie}</span>
            )}
            {event.locatie && event.tijd && (
              <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#ccc", flexShrink: 0, display: "inline-block" }} />
            )}
            {event.tijd && (
              <span style={{ fontSize: "13px", color: "#aaa", fontWeight: 500 }}>{event.tijd}</span>
            )}
          </div>
        </div>
        <p style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "var(--primary)", letterSpacing: "-0.5px", lineHeight: 1, flexShrink: 0, textAlign: "right" }}>
          {event.datum}
        </p>
      </div>
    </Reveal>
  );
}
