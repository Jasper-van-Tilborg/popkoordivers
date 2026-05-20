"use client";

import Reveal from "@/components/Reveal";

export default function Contact() {
  return (
    <section
      id="contact"
      style={{
        position: "relative",
        padding: "100px 24px 160px",
        overflow: "hidden",
        background: "#FFFFFF",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 100% 70% at 50% 100%, rgba(243,106,42,0.08) 0%, rgba(255,255,255,0) 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
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
              marginBottom: "20px",
            }}
          >
            <span style={{ fontSize: "10px", color: "var(--primary)", fontWeight: 700, letterSpacing: "0.08em" }}>
              CONTACT
            </span>
          </div>
          <h2
            style={{
              fontSize: "clamp(30px, 4.5vw, 48px)",
              fontWeight: 800,
              letterSpacing: "-1.5px",
              lineHeight: 1.15,
              color: "#111",
              margin: "0 0 16px",
            }}
          >
            Neem contact op
          </h2>
          <p style={{ fontSize: "17px", lineHeight: 1.7, color: "#555", maxWidth: "440px", margin: "0 auto" }}>
            Heb je vragen of wil je een keer komen kijken? We horen graag van je.
          </p>
        </Reveal>

        {/* Grid */}
        <Reveal
          delay={100}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "64px",
            alignItems: "start",
            maxWidth: "960px",
            margin: "0 auto",
          }}
        >
          {/* Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {[
              { label: "Locatie", value: "Gilze, Noord-Brabant" },
              { label: "Repetitie", value: "Wekelijks — dag en tijd volgt" },
              { label: "E-mail", value: "info@popkoordivers.nl", href: "mailto:info@popkoordivers.nl" },
            ].map((item) => (
              <div key={item.label}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>
                  {item.label}
                </p>
                {item.href ? (
                  <a href={item.href} style={{ fontSize: "15px", fontWeight: 500, color: "#111", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#111")}
                  >{item.value}</a>
                ) : (
                  <p style={{ fontSize: "15px", fontWeight: 500, color: "#111", margin: 0 }}>{item.value}</p>
                )}
              </div>
            ))}
          </div>

          {/* Form */}
          <form
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            onSubmit={(e) => e.preventDefault()}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { id: "first", label: "Voornaam", type: "text", autoComplete: "given-name" },
                { id: "last", label: "Achternaam", type: "text", autoComplete: "family-name" },
              ].map((f) => (
                <div key={f.id}>
                  <label htmlFor={f.id} style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#444", marginBottom: "5px" }}>
                    {f.label}
                  </label>
                  <input
                    id={f.id}
                    type={f.type}
                    autoComplete={f.autoComplete}
                    style={{
                      width: "100%", padding: "10px 12px",
                      border: "1.5px solid rgba(0,0,0,0.12)", borderRadius: "9px",
                      fontSize: "14px", background: "#fff", color: "#111",
                      outline: "none", transition: "border-color 0.15s", boxSizing: "border-box",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)")}
                  />
                </div>
              ))}
            </div>

            <div>
              <label htmlFor="email" style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#444", marginBottom: "5px" }}>
                E-mailadres <span style={{ color: "var(--primary)" }}>*</span>
              </label>
              <input
                id="email" type="email" required autoComplete="email"
                style={{
                  width: "100%", padding: "10px 12px",
                  border: "1.5px solid rgba(0,0,0,0.12)", borderRadius: "9px",
                  fontSize: "14px", background: "#fff", color: "#111",
                  outline: "none", transition: "border-color 0.15s", boxSizing: "border-box",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)")}
              />
            </div>

            <div>
              <label htmlFor="message" style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#444", marginBottom: "5px" }}>
                Je bericht
              </label>
              <textarea
                id="message" rows={4}
                style={{
                  width: "100%", padding: "10px 12px",
                  border: "1.5px solid rgba(0,0,0,0.12)", borderRadius: "9px",
                  fontSize: "14px", background: "#fff", color: "#111",
                  outline: "none", resize: "vertical", transition: "border-color 0.15s",
                  boxSizing: "border-box", fontFamily: "inherit",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)")}
              />
            </div>

            <button
              type="submit"
              style={{
                background: "var(--primary)", color: "#fff", fontWeight: 700,
                fontSize: "14px", padding: "12px 24px", borderRadius: "35px",
                border: "none", cursor: "pointer", alignSelf: "flex-start",
                transition: "background 0.15s, transform 0.12s",
                boxShadow: "0 4px 16px rgba(243,106,42,0.25)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary-dark)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--primary)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Verstuur bericht
            </button>
          </form>
        </Reveal>
      </div>

      {/* Wave into dark footer */}
      <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "80px" }}>
          <path d="M0,80 L0,55 Q360,20 720,50 Q1080,76 1440,35 L1440,80 Z" fill="#111111" />
        </svg>
      </div>
    </section>
  );
}
