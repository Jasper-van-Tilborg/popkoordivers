"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import { IconClock, IconMapPin, IconMusic } from "@/components/icons";

const statCards = [
  {
    label: "Stemmen",
    value: "60",
    sub: "Verdeeld over 5 stemgroepen: alt, mezzo, sopraan, tenor en bas.",
    big: true,
  },
  {
    label: "Begeleiding",
    value: "Piano + band",
    sub: "Piano, live band en bijpassende choreografie bij elk optreden.",
    big: false,
  },
];


const sfeerItems = [
  { gradient: "linear-gradient(135deg, rgba(243,106,42,0.2) 0%, #FDE8D8 100%)", label: "Repetitie", sub: "Dinsdag · De Schakel" },
  { gradient: "linear-gradient(135deg, rgba(243,106,42,0.12) 0%, rgba(243,106,42,0.22) 100%)", label: "Optreden", sub: "Op het podium" },
  { gradient: "linear-gradient(135deg, #FDE8D8 0%, rgba(243,106,42,0.08) 60%, rgba(243,106,42,0.18) 100%)", label: "Groepsfoto", sub: "Het hele koor" },
];

export default function OverOnsPage() {
  const [dirigentOpen, setDirigentOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [thumbPos, setThumbPos] = useState({ dx: 0, dy: 0, scale: 0.15 });

  const openLightbox = (src: string) => (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setThumbPos({
      dx: rect.left + rect.width / 2 - window.innerWidth / 2,
      dy: rect.top + rect.height / 2 - window.innerHeight / 2,
      scale: rect.height / (window.innerHeight * 0.88),
    });
    setLightboxVisible(false);
    setLightboxSrc(src);
    requestAnimationFrame(() => requestAnimationFrame(() => setLightboxVisible(true)));
  };

  const closeLightbox = () => {
    setLightboxVisible(false);
    setTimeout(() => setLightboxSrc(null), 420);
  };

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
            <RevealText
              text="Over ons"
              as="h1"
              pageDelay={0}
              style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, color: "#FFFFFF", margin: "0 0 24px" }}
            />
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
            <RevealText
            text="Een swingend koor uit Gilze met 60 stemmen, piano, band en bijpassende choreo."
            pageDelay={200}
            style={{ fontSize: "clamp(26px, 4vw, 50px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.25, color: "#111", margin: 0 }}
          />
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
                <RevealText
                  text="Opgericht met passie, gegroeid met plezier"
                  pageDelay={450}
                  style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.15, color: "#111", margin: "0 0 28px" }}
                />
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
                    aspectRatio: "4/3",
                    background: "linear-gradient(135deg, rgba(243,106,42,0.18) 0%, #FDE8D8 45%, rgba(243,106,42,0.06) 100%)",
                  }}
                />
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
              <RevealText
                text="Wie zingt er mee?"
                pageDelay={650}
                style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.15, color: "#111", margin: 0 }}
              />
            </Reveal>

            {/* Stat cards */}
            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}
              className="stat-cards-grid"
            >
              {/* Stemmen */}
              <Reveal delay={0}>
                <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "36px 28px", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", height: "100%", transition: "transform 0.2s, box-shadow 0.2s" }} className="card-hover">
                  <p style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: 700, color: "var(--primary)", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>Stemmen</p>
                  <p style={{ margin: "0 0 14px", fontSize: "48px", fontWeight: 800, color: "#111", lineHeight: 1.05, letterSpacing: "-2px" }}>60</p>
                  <p style={{ margin: 0, fontSize: "14px", color: "#666", lineHeight: 1.65 }}>Verdeeld over 5 stemgroepen: alt, mezzo, sopraan, tenor en bas.</p>
                </div>
              </Reveal>

              {/* Dirigent — klikbaar, klapt uit als panel onder het grid */}
              <Reveal delay={100}>
                <button
                  onClick={() => setDirigentOpen((v) => !v)}
                  style={{
                    width: "100%",
                    height: "100%",
                    background: dirigentOpen ? "#FFFFFF" : "#FFFFFF",
                    borderRadius: "20px",
                    padding: "36px 28px",
                    border: dirigentOpen ? "1.5px solid rgba(243,106,42,0.4)" : "1px solid rgba(0,0,0,0.07)",
                    boxShadow: dirigentOpen ? "0 4px 20px rgba(243,106,42,0.12)" : "0 2px 12px rgba(0,0,0,0.04)",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "inherit",
                    display: "flex",
                    flexDirection: "column",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                >
                  <p style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: 700, color: "var(--primary)", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>Dirigent</p>
                  <p style={{ margin: "0 0 14px", fontSize: "22px", fontWeight: 800, color: "#111", lineHeight: 1.05, letterSpacing: "-0.5px" }}>Tom Mordang</p>
                  <p style={{ margin: "0 auto 0 0", fontSize: "14px", color: "#666", lineHeight: 1.65, flex: 1 }}>Leidt het koor met een frisse en positieve energie.</p>
                  {/* Expand indicator */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "20px" }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: dirigentOpen ? "var(--primary)" : "rgba(243,106,42,0.09)",
                      border: "1.5px solid rgba(243,106,42,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "background 0.2s, transform 0.3s",
                      transform: dirigentOpen ? "rotate(180deg)" : "rotate(0deg)",
                      flexShrink: 0,
                    }}>
                      <svg width="11" height="11" fill="none" stroke={dirigentOpen ? "#fff" : "var(--primary)"} strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: dirigentOpen ? "var(--primary)" : "#aaa", transition: "color 0.2s" }}>
                      {dirigentOpen ? "Inklappen" : "Meer over Tom"}
                    </span>
                  </div>
                </button>
              </Reveal>

              {/* Begeleiding */}
              <Reveal delay={200}>
                <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "36px 28px", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", height: "100%", transition: "transform 0.2s, box-shadow 0.2s" }} className="card-hover">
                  <p style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: 700, color: "var(--primary)", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>Begeleiding</p>
                  <p style={{ margin: "0 0 14px", fontSize: "22px", fontWeight: 800, color: "#111", lineHeight: 1.05, letterSpacing: "-0.5px" }}>Piano + band</p>
                  <p style={{ margin: 0, fontSize: "14px", color: "#666", lineHeight: 1.65 }}>Piano, live band en bijpassende choreografie bij elk optreden.</p>
                </div>
              </Reveal>
            </div>

            {/* Uitklapbaar panel — onder de drie cards, volle breedte */}
            <div style={{
              display: "grid",
              gridTemplateRows: dirigentOpen ? "1fr" : "0fr",
              transition: "grid-template-rows 0.4s ease",
              marginTop: dirigentOpen ? "8px" : "0",
              transition2: "margin-top 0.4s ease",
            } as React.CSSProperties}>
              <div style={{ overflow: "hidden" }}>
                <div style={{
                  background: "#FFFFFF",
                  borderRadius: "20px",
                  border: "1.5px solid rgba(243,106,42,0.25)",
                  boxShadow: "0 4px 24px rgba(243,106,42,0.08)",
                  padding: "36px 40px",
                  display: "flex",
                  gap: "40px",
                  alignItems: "stretch",
                  flexWrap: "wrap" as const,
                  marginBottom: "0",
                  position: "relative",
                }}>
                  {/* Pijltje omhoog richting Tom-card (tweede kolom) */}
                  <div style={{
                    position: "absolute",
                    top: "-10px",
                    left: "calc(33.333% + 10px)",
                    width: "20px",
                    height: "20px",
                    background: "#FFFFFF",
                    border: "1.5px solid rgba(243,106,42,0.25)",
                    borderRight: "none",
                    borderBottom: "none",
                    transform: "rotate(45deg)",
                  }} />

                  {/* Foto */}
                  <div style={{ flexShrink: 0, width: "160px", display: "flex", flexDirection: "column" }}>
                    <button
                      onClick={openLightbox("/tom_mordang.jpg")}
                      style={{ background: "none", border: "none", padding: 0, cursor: "zoom-in", display: "flex", flex: 1, width: "100%" }}
                      title="Vergroten"
                    >
                      <div style={{ borderRadius: "16px", overflow: "hidden", flex: 1, border: "2px solid rgba(243,106,42,0.15)", position: "relative" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/tom_mordang.jpg" alt="Tom Mordang" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }} />
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", transition: "background 0.2s" }} className="img-hover-overlay" />
                        <div style={{ position: "absolute", bottom: "8px", right: "8px", width: "26px", height: "26px", borderRadius: "50%", background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="13" height="13" fill="none" stroke="#fff" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Tekst */}
                  <div style={{ flex: 1, minWidth: "240px" }}>
                    <p style={{ margin: "0 0 16px", fontSize: "15px", color: "#555", lineHeight: 1.75 }}>
                      Vanaf maart 2025 zorgt Tom Mordang ervoor dat er ook nu weer een frisse en positieve wind door de repetities waait.
                    </p>
                    <div style={{
                      background: "rgba(243,106,42,0.05)",
                      border: "1px solid rgba(243,106,42,0.12)",
                      borderLeft: "3px solid var(--primary)",
                      borderRadius: "0 12px 12px 0",
                      padding: "18px 22px",
                    }}>
                      <p style={{ margin: 0, fontSize: "14px", color: "#444", lineHeight: 1.85 }}>
                        Wat leuk dat ik mij mag voorstellen als nieuwe dirigent van Popkoor Divers! Ik ben Tom Mordang, 33 jaar, en woon in zo&apos;n uithoek van Tilburg dat ik – met een klein beetje afronden – ook praktisch Gilzenaar ben. Als ondertitel op mijn naamkaartje prijkt meestal een flinke opsomming – arrangeur en koordirigent, pianist en bassist, docent muziek en Engels – die samengevat kunnen worden als &ldquo;maker, helper, doener&rdquo;. Daarom kijk ik er ook zeer naar uit om met dit gezellige en enthousiaste popkoor een hoop te gaan doen, samen mooie muziek te maken en elkaar te helpen om te groeien. Plus, een mooie bonus, om wekelijks toegezongen te worden door meer dan 50 zangers en zangeressen.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "56px" }} />

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
                <button
                  onClick={openLightbox("/deschakel.jpg")}
                  style={{ background: "none", border: "none", padding: 0, cursor: "zoom-in", display: "block", width: "100%", borderRadius: "24px" }}
                  title="Vergroten"
                >
                  <div style={{ borderRadius: "24px", overflow: "hidden", aspectRatio: "4/3", position: "relative" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/deschakel.jpg"
                      alt="De Schakel, Gilze — repetitielocatie van Popkoor Divers"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    <div style={{ position: "absolute", bottom: "12px", right: "12px", width: "30px", height: "30px", borderRadius: "50%", background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="13" height="13" fill="none" stroke="#fff" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                    </div>
                  </div>
                </button>
              </Reveal>

              {/* Right: text */}
              <Reveal delay={120}>
                <RevealText
                  text="Elke dinsdag om 20:00"
                  pageDelay={850}
                  style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.15, color: "#111", margin: "0 0 28px" }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
                  {[
                    { icon: <IconClock size={17} />, text: "Elke dinsdag 20:00" },
                    { icon: <IconMapPin size={17} />, text: "De Schakel, Gilze" },
                    { icon: <IconMusic size={17} />, text: "Vrijblijvend komen proeven is altijd mogelijk" },
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
                          color: "var(--primary)",
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

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          onClick={closeLightbox}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            cursor: "zoom-out",
            background: lightboxVisible ? "rgba(0,0,0,0.88)" : "rgba(0,0,0,0)",
            transition: "background 0.38s ease",
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
              opacity: lightboxVisible ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxSrc}
            alt="Foto vergroten"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxHeight: "88vh",
              maxWidth: "92vw",
              borderRadius: "16px",
              objectFit: "contain",
              cursor: "default",
              willChange: "transform",
              transform: lightboxVisible
                ? "none"
                : `translate(${thumbPos.dx}px, ${thumbPos.dy}px) scale(${thumbPos.scale})`,
              opacity: lightboxVisible ? 1 : 0,
              boxShadow: lightboxVisible ? "0 24px 80px rgba(0,0,0,0.55)" : "none",
              transition: lightboxVisible
                ? "transform 0.42s cubic-bezier(0.34, 1.1, 0.64, 1), opacity 0.3s ease, box-shadow 0.38s ease"
                : "transform 0.36s cubic-bezier(0.4, 0, 1, 1), opacity 0.28s ease",
            }}
          />
        </div>
      )}

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
