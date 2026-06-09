"use client";

import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";

export default function About() {
  return (
    <section id="over-ons" className="about-section" style={{ position: "relative", background: "#FFFFFF", padding: "100px 24px 120px", overflow: "hidden" }}>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "80px",
            alignItems: "center",
          }}
          className="about-grid"
        >
          {/* Left: groepsfoto */}
          <Reveal>
            <div style={{ borderRadius: "24px", aspectRatio: "4/3", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/homescreen_section_1.jpeg"
                alt="Popkoor Divers"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          </Reveal>

          {/* Right: text */}
          <Reveal delay={120}>
            <RevealText
              text="Wie zijn wij?"
              pageDelay={300}
              style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.15, color: "#111", margin: "0 0 8px" }}
            />

            <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#555", margin: "0 0 28px" }}>
              Popkoor Divers is een enthousiast en swingend koor uit Gilze, verdeeld over{" "}
              <span style={{ fontWeight: 700, color: "#111", background: "rgba(124,58,237,0.10)", padding: "1px 7px", borderRadius: "6px" }}>5 stemgroepen</span>{" "}
              (alt, mezzo, sopraan, tenor, bas). Sinds{" "}
              <span style={{ fontWeight: 700, color: "#111", background: "rgba(124,58,237,0.10)", padding: "1px 7px", borderRadius: "6px" }}>2008</span>{" "}
              onder leiding van dirigent{" "}
              <span style={{ fontWeight: 700, color: "#111", background: "rgba(124,58,237,0.10)", padding: "1px 7px", borderRadius: "6px" }}>Tom Mordang</span>.
              {" "}Met piano, band of a-capella.
            </p>

            <a
              href="/over-ons"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "var(--primary)",
                fontWeight: 700,
                fontSize: "14px",
                textDecoration: "none",
                borderBottom: "2px solid rgba(243,106,42,0.3)",
                paddingBottom: "2px",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(243,106,42,0.3)")}
            >
              Meer over ons →
            </a>
          </Reveal>
        </div>
      </div>

      {/* Wave into warm section */}
      <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "80px" }}>
          <path d="M0,80 L0,42 Q360,5 720,38 Q1080,68 1440,22 L1440,80 Z" fill="#FFF8F4" />
        </svg>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .about-section {
            padding: 60px 16px 80px !important;
          }
        }
      `}</style>
    </section>
  );
}
