"use client";

import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";

export default function Hero() {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Full-bleed background image — covers content + wave area */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/herosection_image.jpg"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center 0%",
        }}
      />

      {/* Gradient overlay — dark on left for legibility, fades right */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          pointerEvents: "none",
        }}
      />

      {/* Main content — exactly 100svh tall, wave follows below */}
      <div style={{ minHeight: "100svh", padding: "0 24px", display: "flex", flexDirection: "column", position: "relative", zIndex: 10 }}>
        <div
          style={{
            flex: 1,
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
            padding: "220px 0 60px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <Reveal delay={0}>
            <div style={{ maxWidth: "680px", textAlign: "center" }}>
              {/* Headline */}
              <RevealText
                text="Passie voor popmuziek brengt mensen bij elkaar."
                as="h1"
                pageDelay={0}
                style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-2px", color: "#FFFFFF", margin: "0 0 20px" }}
              />

              {/* Subheadline */}
              <p
                style={{
                  fontSize: "clamp(15px, 1.6vw, 17px)",
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.82)",
                  margin: "0 auto 36px",
                  maxWidth: "460px",
                }}
              >
                Swingend popkoor uit Gilze — met piano, band en choreo.
              </p>

              {/* CTAs */}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                <a
                  href="/contact#meezingen"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "var(--primary)",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "15px",
                    padding: "13px 28px",
                    borderRadius: "35px",
                    textDecoration: "none",
                    border: "1.5px solid var(--primary)",
                    transition: "background 0.2s, border-color 0.2s, transform 0.12s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary-light)"; e.currentTarget.style.borderColor = "var(--primary-light)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--primary)"; e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  Kom meezingen →
                </a>
                <a
                  href="/contact#boeken"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#7C3AED",
                    color: "#FFFFFF",
                    fontWeight: 600,
                    fontSize: "15px",
                    padding: "13px 28px",
                    borderRadius: "35px",
                    textDecoration: "none",
                    border: "1.5px solid #7C3AED",
                    transition: "background 0.2s, border-color 0.2s, transform 0.12s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#a855f7"; e.currentTarget.style.borderColor = "#a855f7"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#7C3AED"; e.currentTarget.style.borderColor = "#7C3AED"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  Boek ons optreden
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Wave into white — in document flow, starts after 100svh */}
      <div aria-hidden="true" style={{ position: "relative", lineHeight: 0, zIndex: 10 }}>
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "80px" }}>
          <path d="M0,80 L0,40 Q360,0 720,32 Q1080,64 1440,20 L1440,80 Z" fill="#FFFFFF" />
        </svg>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-content {
            padding-top: 100px !important;
          }
        }
      `}</style>
    </section>
  );
}
