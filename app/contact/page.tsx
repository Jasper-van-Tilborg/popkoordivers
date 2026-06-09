"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";

type FormStatus = "idle" | "sending" | "sent";

const stemgroepen = ["Alt", "Mezzo", "Sopraan", "Tenor", "Bas"];
const eventTypes = [
  "Feest / jubileum",
  "Festival",
  "Bedrijfsevenement",
  "Bruiloft",
  "Kerkdienst / herdenking",
  "Anders",
];

const inputBase: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  fontSize: "15px",
  fontFamily: "inherit",
  color: "#111",
  background: "#FFFFFF",
  borderRadius: "12px",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
  appearance: "none",
  WebkitAppearance: "none",
};

function inputStyle(error?: string): React.CSSProperties {
  return { ...inputBase, border: `1.5px solid ${error ? "#e53e3e" : "rgba(0,0,0,0.12)"}` };
}

function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "var(--primary)";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(243,106,42,0.12)";
}
function onFocusPurple(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "#7C3AED";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.12)";
}
function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, hasError?: string) {
  e.currentTarget.style.borderColor = hasError ? "#e53e3e" : "rgba(0,0,0,0.12)";
  e.currentTarget.style.boxShadow = "none";
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#e53e3e", fontWeight: 600 }}>{msg}</p>;
}

function Label({ text, optional, accent = "orange" }: { text: string; optional?: boolean; accent?: "orange" | "purple" }) {
  return (
    <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#333", marginBottom: "6px" }}>
      {text}{" "}
      {optional
        ? <span style={{ fontSize: "12px", fontWeight: 500, color: "#aaa" }}>(optioneel)</span>
        : <span style={{ color: accent === "purple" ? "#7C3AED" : "var(--primary)" }}>*</span>}
    </label>
  );
}

function SubmitBtn({ status, label, accent = "orange" }: { status: FormStatus; label: string; accent?: "orange" | "purple" }) {
  const bg = accent === "purple" ? "#7C3AED" : "var(--primary)";
  const bgSending = accent === "purple" ? "rgba(124,58,237,0.55)" : "rgba(243,106,42,0.55)";
  const shadow = accent === "purple" ? "0 4px 20px rgba(124,58,237,0.28)" : "0 4px 20px rgba(243,106,42,0.28)";
  return (
    <button
      type="submit"
      disabled={status === "sending"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        background: status === "sending" ? bgSending : bg,
        color: "#FFFFFF",
        fontWeight: 700,
        fontSize: "15px",
        padding: "14px 28px",
        borderRadius: "35px",
        border: "none",
        cursor: status === "sending" ? "default" : "pointer",
        width: "100%",
        fontFamily: "inherit",
        boxShadow: shadow,
        transition: "transform 0.12s, opacity 0.15s",
      }}
      onMouseEnter={(e) => { if (status !== "sending") { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {status === "sending" ? (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ animation: "spin 0.8s linear infinite" }}>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
          </svg>
          Versturen…
        </>
      ) : label}
    </button>
  );
}

function SentCard({ message, accent = "orange" }: { message: string; accent?: "orange" | "purple" }) {
  return (
    <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "52px 40px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
      <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: accent === "purple" ? "rgba(124,58,237,0.12)" : "rgba(243,106,42,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", margin: "0 auto 18px", color: accent === "purple" ? "#7C3AED" : "var(--primary)", fontWeight: 800 }}>✓</div>
      <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#111", margin: "0 0 10px", letterSpacing: "-0.5px" }}>Verstuurd!</h3>
      <p style={{ fontSize: "15px", color: "#666", margin: 0, lineHeight: 1.7 }}>{message}</p>
    </div>
  );
}

export default function ContactPage() {
  // ── Meezingen form ──
  const [mz, setMz] = useState({ naam: "", email: "", stemgroep: "", bericht: "" });
  const [mzStatus, setMzStatus] = useState<FormStatus>("idle");
  const [mzErr, setMzErr] = useState<Partial<typeof mz>>({});

  function mzChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setMz((p) => ({ ...p, [name]: value }));
    if (mzErr[name as keyof typeof mz]) setMzErr((p) => ({ ...p, [name]: undefined }));
  }
  async function mzSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err: Partial<typeof mz> = {};
    if (!mz.naam.trim()) err.naam = "Vul je naam in";
    if (!mz.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mz.email)) err.email = "Vul een geldig e-mailadres in";
    if (Object.keys(err).length) { setMzErr(err); return; }
    setMzStatus("sending");
    await new Promise((r) => setTimeout(r, 900));
    setMzStatus("sent");
  }

  // ── Boeken form ──
  const [bk, setBk] = useState({ naam: "", organisatie: "", email: "", telefoon: "", type: "", datum: "", bericht: "" });
  const [bkStatus, setBkStatus] = useState<FormStatus>("idle");
  const [bkErr, setBkErr] = useState<Partial<typeof bk>>({});

  function bkChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setBk((p) => ({ ...p, [name]: value }));
    if (bkErr[name as keyof typeof bk]) setBkErr((p) => ({ ...p, [name]: undefined }));
  }
  async function bkSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err: Partial<typeof bk> = {};
    if (!bk.naam.trim()) err.naam = "Vul je naam in";
    if (!bk.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bk.email)) err.email = "Vul een geldig e-mailadres in";
    if (!bk.bericht.trim()) err.bericht = "Vertel iets over het evenement";
    if (Object.keys(err).length) { setBkErr(err); return; }
    setBkStatus("sending");
    await new Promise((r) => setTimeout(r, 900));
    setBkStatus("sent");
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#FFFFFF" }}>

        {/* ── 1. Hero ── */}
        <section
          className="page-hero"
          style={{
            background: "var(--primary)",
            padding: "140px 24px 100px",
            minHeight: "420px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse 80% 60% at 30% 30%, rgba(255,255,255,0.12) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
            <RevealText
              text="Contact"
              as="h1"
              pageDelay={0}
              style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, color: "#FFFFFF", margin: "0 0 24px" }}
            />
            <Reveal delay={180}>
              <p style={{ fontSize: "clamp(15px, 1.6vw, 18px)", lineHeight: 1.7, color: "rgba(255,255,255,0.82)", maxWidth: "520px", margin: 0 }}>
                Neem contact op, meld je aan om mee te zingen of vraag een offerte aan voor een optreden.
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

        {/* ── 2. Contactinfo (two-column) ── */}
        <section className="section-pad" style={{ background: "#FFFFFF", padding: "80px 24px 100px", overflow: "hidden", position: "relative" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px" }} className="contact-info-grid">

              {/* Left: contactgegevens */}
              <Reveal>
                <p style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: 700, color: "var(--primary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Contactgegevens</p>
                <RevealText text="Neem contact op" pageDelay={200} style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, letterSpacing: "-1px", color: "#111", margin: "0 0 28px" }} />

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em" }}>E-mail</p>
                    <a
                      href="mailto:info@popkoordivers.nl"
                      style={{ fontSize: "16px", fontWeight: 600, color: "var(--primary)", textDecoration: "none", transition: "opacity 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                    >
                      info@popkoordivers.nl
                    </a>
                  </div>

                  <div>
                    <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em" }}>Boekingen</p>
                    <a
                      href="#boeken"
                      style={{ fontSize: "15px", fontWeight: 500, color: "#444", textDecoration: "none", borderBottom: "1.5px solid rgba(0,0,0,0.12)", paddingBottom: "1px", transition: "border-color 0.15s, color 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#7C3AED"; e.currentTarget.style.borderColor = "#7C3AED"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "#444"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)"; }}
                    >
                      Aanvraag via formulier hieronder →
                    </a>
                  </div>

                  <div>
                    <p style={{ margin: "0 0 10px", fontSize: "11px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em" }}>Volg ons</p>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      {[
                        {
                          label: "Facebook",
                          href: "https://www.facebook.com/p/Popkoor-Divers-100066853672465/?locale=nl_NL",
                          icon: <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
                        },
                        {
                          label: "Instagram",
                          href: "https://www.instagram.com/popkoordivers/",
                          icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
                        },
                        {
                          label: "YouTube",
                          href: "https://www.youtube.com/@popkoordivers",
                          icon: <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="#fff" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>,
                        },
                      ].map((s) => (
                        <a
                          key={s.label}
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={s.label}
                          title={s.label}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            color: "#555",
                            background: "rgba(0,0,0,0.05)",
                            textDecoration: "none",
                            transition: "background 0.15s, color 0.15s",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(243,106,42,0.10)"; e.currentTarget.style.color = "var(--primary)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.05)"; e.currentTarget.style.color = "#555"; }}
                        >
                          {s.icon}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Right: repetitie info */}
              <Reveal delay={120}>
                <p style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: 700, color: "var(--primary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Repetities</p>
                <RevealText text="Elke dinsdag" pageDelay={200} style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, letterSpacing: "-1px", color: "#111", margin: "0 0 28px" }} />

                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {[
                    { label: "Dag", value: "Elke dinsdag" },
                    { label: "Aanvang", value: "20:00 uur" },
                    { label: "Locatie", value: "De Schakel" },
                    { label: "Adres", value: "Gilze, Noord-Brabant" },
                  ].map((row, i, arr) => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.07)" : "none" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.05em" }}>{row.label}</span>
                      <span style={{ fontSize: "15px", fontWeight: 700, color: "#111" }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: "24px", background: "rgba(243,106,42,0.12)", border: "1px solid rgba(243,106,42,0.15)", borderRadius: "14px", padding: "16px 20px" }}>
                  <p style={{ margin: 0, fontSize: "14px", color: "#555", lineHeight: 1.6 }}>
                    Wil je een keer komen proeven?{" "}
                    <a href="#meezingen" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>
                      Meld je hieronder aan →
                    </a>
                  </p>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Wave → cream */}
          <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
            <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "80px" }}>
              <path d="M0,80 L0,42 Q360,5 720,38 Q1080,68 1440,22 L1440,80 Z" fill="#FDE8D8" />
            </svg>
          </div>
        </section>

        {/* ── 3. Meezingen aanmelden ── */}
        <section
          id="meezingen"
          className="section-pad"
          style={{
            background: "var(--gradient-section), #FDE8D8",
            padding: "100px 24px 120px",
            overflow: "hidden",
            position: "relative",
            scrollMarginTop: "72px",
          }}
        >
          <div style={{ maxWidth: "700px", margin: "0 auto", position: "relative", zIndex: 1 }}>
            <Reveal style={{ textAlign: "center", marginBottom: "48px" }}>
              <RevealText text="Wil je meezingen?" pageDelay={350} style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.15, color: "#111", margin: "0 0 14px" }} />
              <p style={{ fontSize: "16px", color: "#555", margin: 0, lineHeight: 1.75, maxWidth: "520px", marginLeft: "auto", marginRight: "auto" }}>
                De drempel is laag — iedereen is welkom om een avond te komen proeven. Geen auditie, geen voorbereiding nodig. Stuur ons een berichtje en we verwelkomen je de eerstvolgende dinsdag.
              </p>
            </Reveal>

            {mzStatus === "sent" ? (
              <Reveal>
                <SentCard message="We nemen zo snel mogelijk contact met je op. We hopen je snel te verwelkomen!" />
              </Reveal>
            ) : (
              <Reveal>
                <form
                  onSubmit={mzSubmit}
                  noValidate
                  className="form-card" style={{ background: "#FFFFFF", borderRadius: "24px", padding: "48px 40px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: "20px" }}
                >
                  <div>
                    <Label text="Naam" />
                    <input name="naam" type="text" placeholder="Je volledige naam" value={mz.naam} onChange={mzChange}
                      style={inputStyle(mzErr.naam)} onFocus={onFocus} onBlur={(e) => onBlur(e, mzErr.naam)} />
                    <FieldError msg={mzErr.naam} />
                  </div>

                  <div>
                    <Label text="E-mailadres" />
                    <input name="email" type="email" placeholder="jouw@email.nl" value={mz.email} onChange={mzChange}
                      style={inputStyle(mzErr.email)} onFocus={onFocus} onBlur={(e) => onBlur(e, mzErr.email)} />
                    <FieldError msg={mzErr.email} />
                  </div>

                  <div style={{ position: "relative" }}>
                    <Label text="Stemgroep" optional />
                    <div style={{ position: "relative" }}>
                      <select name="stemgroep" value={mz.stemgroep} onChange={mzChange}
                        style={{ ...inputStyle(), cursor: "pointer", paddingRight: "40px" }} onFocus={onFocus} onBlur={(e) => onBlur(e)}>
                        <option value="">Weet ik nog niet / laat ik bepalen</option>
                        {stemgroepen.map((sg) => <option key={sg} value={sg.toLowerCase()}>{sg}</option>)}
                      </select>
                      <div aria-hidden="true" style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#888" }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label text="Bericht" optional />
                    <textarea name="bericht" rows={4} placeholder="Stel gerust een vraag of vertel iets over jezelf..." value={mz.bericht} onChange={mzChange}
                      style={{ ...inputStyle(), resize: "vertical", minHeight: "100px" }} onFocus={onFocus} onBlur={(e) => onBlur(e)} />
                  </div>

                  <SubmitBtn status={mzStatus} label="Verstuur aanmelding →" />
                </form>
              </Reveal>
            )}
          </div>

          {/* Wave → purple */}
          <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
            <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "80px" }}>
              <path d="M0,80 L0,48 Q360,12 720,44 Q1080,72 1440,25 L1440,80 Z" fill="#F5F3FF" />
            </svg>
          </div>
        </section>

        {/* ── 4. Optreden boeken ── */}
        <section
          id="boeken"
          className="section-pad"
          style={{ background: "radial-gradient(ellipse 100% 70% at 50% 50%, rgba(124,58,237,0.08) 0%, rgba(255,255,255,0) 75%), #F5F3FF", padding: "100px 24px 140px", overflow: "hidden", position: "relative", scrollMarginTop: "72px" }}
        >
          <div style={{ maxWidth: "700px", margin: "0 auto", position: "relative", zIndex: 1 }}>
            <Reveal style={{ textAlign: "center", marginBottom: "48px" }}>
              <RevealText text="Boek ons voor jouw optreden" pageDelay={500} style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.15, color: "#111", margin: "0 0 14px" }} />
              <p style={{ fontSize: "16px", color: "#555", margin: 0, lineHeight: 1.75, maxWidth: "520px", marginLeft: "auto", marginRight: "auto" }}>
                Voor feesten, jubilea, festivals of een intieme setting — wij zingen. Vraag een vrijblijvende offerte aan via het formulier hieronder.
              </p>
            </Reveal>

            {bkStatus === "sent" ? (
              <Reveal>
                <SentCard message="We bekijken je aanvraag en nemen zo snel mogelijk contact met je op." accent="purple" />
              </Reveal>
            ) : (
              <Reveal>
                <form
                  onSubmit={bkSubmit}
                  noValidate
                  className="form-card" style={{ background: "#FFFFFF", border: "1.5px solid rgba(0,0,0,0.08)", borderRadius: "24px", padding: "48px 40px", boxShadow: "0 4px 24px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "20px" }}
                >
                  {/* Two-column: naam + organisatie */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="form-row-2">
                    <div>
                      <Label text="Naam" accent="purple" />
                      <input name="naam" type="text" placeholder="Jouw naam" value={bk.naam} onChange={bkChange}
                        style={inputStyle(bkErr.naam)} onFocus={onFocusPurple} onBlur={(e) => onBlur(e, bkErr.naam)} />
                      <FieldError msg={bkErr.naam} />
                    </div>
                    <div>
                      <Label text="Organisatie" optional accent="purple" />
                      <input name="organisatie" type="text" placeholder="Bedrijf of vereniging" value={bk.organisatie} onChange={bkChange}
                        style={inputStyle()} onFocus={onFocusPurple} onBlur={(e) => onBlur(e)} />
                    </div>
                  </div>

                  {/* Two-column: email + telefoon */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="form-row-2">
                    <div>
                      <Label text="E-mailadres" accent="purple" />
                      <input name="email" type="email" placeholder="jouw@email.nl" value={bk.email} onChange={bkChange}
                        style={inputStyle(bkErr.email)} onFocus={onFocusPurple} onBlur={(e) => onBlur(e, bkErr.email)} />
                      <FieldError msg={bkErr.email} />
                    </div>
                    <div>
                      <Label text="Telefoonnummer" optional accent="purple" />
                      <input name="telefoon" type="tel" placeholder="06 – – – –" value={bk.telefoon} onChange={bkChange}
                        style={inputStyle()} onFocus={onFocusPurple} onBlur={(e) => onBlur(e)} />
                    </div>
                  </div>

                  {/* Two-column: type + datum */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="form-row-2">
                    <div style={{ position: "relative" }}>
                      <Label text="Type evenement" optional accent="purple" />
                      <div style={{ position: "relative" }}>
                        <select name="type" value={bk.type} onChange={bkChange}
                          style={{ ...inputStyle(), cursor: "pointer", paddingRight: "40px" }} onFocus={onFocusPurple} onBlur={(e) => onBlur(e)}>
                          <option value="">Kies een type</option>
                          {eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <div aria-hidden="true" style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#888" }}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label text="Datum" optional accent="purple" />
                      <input name="datum" type="text" placeholder="bijv. juni 2026" value={bk.datum} onChange={bkChange}
                        style={inputStyle()} onFocus={onFocusPurple} onBlur={(e) => onBlur(e)} />
                    </div>
                  </div>

                  {/* Bericht */}
                  <div>
                    <Label text="Bericht" accent="purple" />
                    <textarea name="bericht" rows={5} placeholder="Vertel iets over het evenement — locatie, verwacht aantal gasten, wensen..." value={bk.bericht} onChange={bkChange}
                      style={{ ...inputStyle(bkErr.bericht), resize: "vertical", minHeight: "120px" }} onFocus={onFocusPurple} onBlur={(e) => onBlur(e, bkErr.bericht)} />
                    <FieldError msg={bkErr.bericht} />
                  </div>

                  <SubmitBtn status={bkStatus} label="Aanvraag doen →" accent="purple" />
                </form>
              </Reveal>
            )}
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
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .contact-info-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
        @media (max-width: 560px) {
          .form-row-2 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .page-hero { padding: 100px 20px 80px !important; height: auto !important; min-height: 320px !important; }
          .section-pad { padding-top: 60px !important; padding-bottom: 72px !important; padding-left: 20px !important; padding-right: 20px !important; }
          .form-card { padding: 28px 20px !important; }
        }
      `}</style>
    </>
  );
}
