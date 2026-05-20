"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

const upcoming = [
  {
    month: "nov",
    year: "2026",
    label: "Eerstvolgend",
    labelColor: "var(--primary)",
    venue: "De Schakel, Gilze",
    title: "Najaarsconcert",
    description: "Spetterend optreden met gastoptredens",
    time: "20:00",
    locationType: "Op locatie",
    cta: "Kaartjes →",
    ctaHref: "#",
  },
  {
    month: "dec",
    year: "2026",
    label: "Op uitnodiging",
    labelColor: "#6366f1",
    venue: "Zonnebloem jubileum, Tilburg",
    title: "Jubileum Zonnebloem",
    description: "Uitgenodigd gastoptreden tijdens het jubileum",
    time: "14:00",
    locationType: "Op locatie",
    cta: "Meer info →",
    ctaHref: "#",
  },
  {
    month: "jun",
    year: "2027",
    label: "Festival",
    labelColor: "#0ea5e9",
    venue: "VÓLkoren, Middelburg",
    title: "VÓLkoren Middelburg",
    description: "Grootste korenfestival van Zeeland — de hele dag muziek",
    time: "hele dag",
    locationType: "Op locatie",
    cta: "Festival website →",
    ctaHref: "#",
  },
];

const archive = [
  { month: "jun", title: "Zomerborrel · De Schakel" },
  { month: "mei", title: "Festival Breda · Chassépark" },
  { month: "apr", title: "Koningsdag · centrum Gilze" },
  { month: "apr", title: "Voorjaarsconcert · De Schakel" },
  { month: "dec", title: "Kerstconcert · Petruskerk" },
  { month: "nov", title: "Najaarsconcert · jubileum 15 jaar" },
];

export default function AgendaPage() {
  const [tab, setTab] = useState<"komend" | "archief">("komend");

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
                Komende &amp; afgelopen optredens
              </p>
            </Reveal>
            <Reveal delay={100}>
              <h1
                style={{
                  fontSize: "clamp(36px, 5vw, 60px)",
                  fontWeight: 800,
                  letterSpacing: "-2px",
                  lineHeight: 1.1,
                  color: "#FFFFFF",
                  margin: "0 0 24px",
                }}
              >
                Agenda
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setTab("komend")}
                  style={{
                    background: tab === "komend" ? "#FFFFFF" : "rgba(255,255,255,0.15)",
                    color: tab === "komend" ? "var(--primary)" : "rgba(255,255,255,0.85)",
                    border: "none",
                    borderRadius: "35px",
                    padding: "9px 20px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "background 0.2s, color 0.2s",
                  }}
                >
                  Komend (3)
                </button>
                <button
                  onClick={() => setTab("archief")}
                  style={{
                    background: tab === "archief" ? "#FFFFFF" : "rgba(255,255,255,0.15)",
                    color: tab === "archief" ? "var(--primary)" : "rgba(255,255,255,0.85)",
                    border: "none",
                    borderRadius: "35px",
                    padding: "9px 20px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "background 0.2s, color 0.2s",
                  }}
                >
                  Archief
                </button>
              </div>
            </Reveal>
          </div>

          {/* Wave */}
          <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
            <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "60px" }}>
              <path d="M0,60 L0,30 Q360,0 720,25 Q1080,50 1440,15 L1440,60 Z" fill="#FFFFFF" />
            </svg>
          </div>
        </section>

        {/* ── Content ── */}
        <section style={{ padding: "60px 24px 100px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

            {tab === "komend" && (
              <>
                <Reveal>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "40px", flexWrap: "wrap", gap: "16px" }}>
                    <p style={{ fontSize: "15px", lineHeight: 1.7, color: "#666", maxWidth: "560px", margin: 0 }}>
                      Hieronder onze geplande optredens. Wil je ons boeken voor een feest of festival?{" "}
                      <a href="#boeken" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
                        Vraag een offerte aan
                      </a>{" "}
                      via de boekingspagina.
                    </p>
                    <p style={{ fontSize: "12px", color: "#aaa", margin: 0, whiteSpace: "nowrap" }}>Bijgewerkt op 12 mei</p>
                  </div>
                </Reveal>

                <Reveal delay={80}>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 20px" }}>
                    Aankomend · volgende 3 optredens
                  </p>
                </Reveal>

                {/* Events timeline */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "80px" }}>
                  {upcoming.map((event, i) => (
                    <Reveal key={`${event.month}-${event.year}`} delay={i * 120}>
                      <div
                        className="event-row agenda-event-row"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "100px 1fr auto",
                          gap: "28px",
                          alignItems: "center",
                          background: "#FFFFFF",
                          borderRadius: "20px",
                          padding: "28px 28px",
                          border: i === 0 ? "2px solid rgba(243,106,42,0.3)" : "1px solid rgba(0,0,0,0.08)",
                          boxShadow: i === 0 ? "0 4px 24px rgba(243,106,42,0.10)" : "0 2px 12px rgba(0,0,0,0.04)",
                          transition: "transform 0.2s, box-shadow 0.2s",
                        }}
                      >
                        <div style={{ textAlign: "center" }}>
                          <p style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "var(--primary)", lineHeight: 1, letterSpacing: "-0.5px" }}>
                            {event.month}
                          </p>
                          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#aaa", fontWeight: 600 }}>{event.year}</p>
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em", color: "#fff", background: event.labelColor, padding: "3px 10px", borderRadius: "100px", whiteSpace: "nowrap" }}>
                              {event.label}
                            </span>
                          </div>
                          <p style={{ margin: "0 0 4px", fontSize: "19px", fontWeight: 800, color: "#111", letterSpacing: "-0.02em", lineHeight: 1.25 }}>
                            {event.venue}
                          </p>
                          <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#666", lineHeight: 1.5 }}>{event.description}</p>
                          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "12px", color: "#aaa", display: "flex", alignItems: "center", gap: "4px" }}>
                              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
                              </svg>
                              {event.time}
                            </span>
                            <span style={{ fontSize: "12px", color: "#aaa", display: "flex", alignItems: "center", gap: "4px" }}>
                              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <circle cx="12" cy="11" r="3" />
                              </svg>
                              {event.locationType}
                            </span>
                          </div>
                        </div>

                        <a
                          href={event.ctaHref}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            background: i === 0 ? "var(--primary)" : "rgba(243,106,42,0.08)",
                            color: i === 0 ? "#fff" : "var(--primary)",
                            fontSize: "13px",
                            fontWeight: 700,
                            padding: "11px 22px",
                            borderRadius: "35px",
                            textDecoration: "none",
                            whiteSpace: "nowrap",
                            border: i === 0 ? "none" : "1.5px solid rgba(243,106,42,0.2)",
                            transition: "background 0.15s, transform 0.12s",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = i === 0 ? "var(--primary)" : "rgba(243,106,42,0.08)";
                            e.currentTarget.style.color = i === 0 ? "#fff" : "var(--primary)";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          {event.cta}
                        </a>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </>
            )}

            {tab === "archief" && (
              <>
                <Reveal>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                      <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#111", margin: "0 0 4px", letterSpacing: "-0.5px" }}>Archief</h2>
                      <p style={{ fontSize: "14px", color: "#888", margin: 0 }}>Eerder dit seizoen</p>
                    </div>
                    <a href="#" style={{ fontSize: "13px", fontWeight: 600, color: "var(--primary)", textDecoration: "none", borderBottom: "2px solid rgba(243,106,42,0.25)", paddingBottom: "2px" }}>
                      Naar fotoalbums →
                    </a>
                  </div>
                </Reveal>

                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {archive.map((item, i) => (
                    <Reveal key={`${item.month}-${i}`} delay={i * 60}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "16px 0",
                          borderBottom: i < archive.length - 1 ? "1px solid rgba(0,0,0,0.07)" : "none",
                          gap: "16px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--primary)", minWidth: "28px" }}>{item.month}</span>
                          <span style={{ fontSize: "15px", fontWeight: 500, color: "#333" }}>{item.title}</span>
                        </div>
                        <a
                          href="#"
                          style={{ fontSize: "12px", fontWeight: 600, color: "#aaa", textDecoration: "none", whiteSpace: "nowrap", transition: "color 0.15s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#aaa")}
                        >
                          foto&apos;s →
                        </a>
                      </div>
                    </Reveal>
                  ))}
                </div>

                <Reveal delay={120}>
                  <a href="#" style={{ display: "inline-flex", marginTop: "24px", fontSize: "13px", fontWeight: 600, color: "var(--primary)", textDecoration: "none", borderBottom: "2px solid rgba(243,106,42,0.25)", paddingBottom: "2px" }}>
                    Volledig archief →
                  </a>
                </Reveal>
              </>
            )}

            {/* Booking CTA */}
            <Reveal>
              <div
                id="boeken"
                style={{
                  marginTop: "80px",
                  background: "linear-gradient(135deg, rgba(243,106,42,0.08) 0%, rgba(243,106,42,0.04) 100%)",
                  border: "1px solid rgba(243,106,42,0.15)",
                  borderRadius: "20px",
                  padding: "48px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "24px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: "12px", fontWeight: 700, color: "var(--primary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Iets te vieren?</p>
                  <h3 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, color: "#111", margin: 0, letterSpacing: "-0.02em" }}>
                    Boek ons voor jouw optreden
                  </h3>
                </div>
                <a
                  href="#"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "var(--primary)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "15px",
                    padding: "14px 28px",
                    borderRadius: "35px",
                    textDecoration: "none",
                    boxShadow: "0 4px 20px rgba(243,106,42,0.28)",
                    transition: "transform 0.12s, opacity 0.15s",
                    whiteSpace: "nowrap",
                  }}
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
    </>
  );
}
