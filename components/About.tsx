"use client";

import Reveal from "@/components/Reveal";

export default function About() {
  return (
    <section id="over-ons" style={{ position: "relative", background: "#FFFFFF", padding: "100px 24px 120px", overflow: "hidden" }}>

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
            <div style={{ position: "relative", borderRadius: "24px", overflow: "hidden", aspectRatio: "4/3" }}>
              <img
                src="https://picsum.photos/seed/popkoor-groep/700/525"
                alt="Groepsfoto Popkoor Divers"
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
                <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#888" }}>Gilze · Noord-Brabant</p>
              </div>
            </div>
          </Reveal>

          {/* Right: text */}
          <Reveal delay={120}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(243,106,42,0.09)", border: "1px solid rgba(243,106,42,0.18)", borderRadius: "100px", padding: "4px 14px", marginBottom: "20px" }}>
              <span style={{ fontSize: "10px", color: "var(--primary)", fontWeight: 700, letterSpacing: "0.08em" }}>OVER ONS</span>
            </div>

            <h2
              style={{
                fontSize: "clamp(28px, 3.5vw, 44px)",
                fontWeight: 800,
                letterSpacing: "-1.5px",
                lineHeight: 1.15,
                color: "#111",
                margin: "0 0 8px",
              }}
            >
              Wie zijn wij?
            </h2>

            <p style={{ fontSize: "17px", fontWeight: 600, color: "var(--primary)", margin: "0 0 20px", lineHeight: 1.5 }}>
              60 stemmen, 1 dirigent, elke dinsdag De Schakel.
            </p>

            <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#555", margin: "0 0 28px" }}>
              Popkoor Divers is een enthousiast en swingend koor uit Gilze, verdeeld over{" "}
              <span style={{ fontWeight: 700, color: "#111", background: "rgba(243,106,42,0.10)", padding: "1px 7px", borderRadius: "6px" }}>5 stemgroepen</span>{" "}
              (alt, mezzo, sopraan, tenor, bas). Sinds{" "}
              <span style={{ fontWeight: 700, color: "#111", background: "rgba(243,106,42,0.10)", padding: "1px 7px", borderRadius: "6px" }}>2008</span>{" "}
              onder leiding van dirigent{" "}
              <span style={{ fontWeight: 700, color: "#111", background: "rgba(243,106,42,0.10)", padding: "1px 7px", borderRadius: "6px" }}>Tom Mordang</span>.
              {" "}Met piano, band of a-capella.
            </p>

            <a
              href="#"
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
        }
      `}</style>
    </section>
  );
}
