"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import { useInstellingen, useSocials } from "@/components/InstellingenProvider";

type FormStatus = "idle" | "sent";

// Tijdelijk: formulieren openen het mailprogramma van de bezoeker, tot er een echte verzendroute is.
function openMail(email: string, subject: string, fields: [string, string][]) {
  const body = fields.filter(([, v]) => v.trim()).map(([k, v]) => `${k}: ${v}`).join("\n");
  window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

const stemgroepen = ["Alt", "Mezzo", "Sopraan", "Tenor", "Bas"];
const eventTypes = [
  "Feest / jubileum",
  "Festival",
  "Bedrijfsevenement",
  "Bruiloft",
  "Kerkdienst / herdenking",
  "Anders",
];

// Props voor een veld: label, foutmelding en "verplicht" horen erbij, ook voor een schermlezer.
// De stijl (focusrand, rode rand bij een fout) staat in .veld onderaan deze pagina.
function veld(id: string, fout?: string, verplicht?: boolean) {
  return {
    id,
    className: "veld",
    "aria-invalid": fout ? true : undefined,
    "aria-describedby": fout ? `${id}-fout` : undefined,
    "aria-required": verplicht || undefined,
  } as const;
}

function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return <p id={`${id}-fout`} style={{ margin: "6px 0 0", fontSize: "12px", color: "#c53030", fontWeight: 600 }}>{msg}</p>;
}

function Label({ htmlFor, text, optional, accent = "orange" }: { htmlFor: string; text: string; optional?: boolean; accent?: "orange" | "purple" }) {
  return (
    <label htmlFor={htmlFor} style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#333", marginBottom: "6px" }}>
      {text}{" "}
      {optional
        ? <span style={{ fontSize: "12px", fontWeight: 500, color: "#aaa" }}>(optioneel)</span>
        : <span aria-hidden="true" style={{ color: accent === "purple" ? "#7C3AED" : "var(--primary)" }}>*</span>}
    </label>
  );
}

// Na een mislukte verzending: het eerste foute veld in beeld, cursor erin, kort trillen.
function toonEersteFout(form: HTMLFormElement) {
  setTimeout(() => {
    const el = form.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (!el) return;
    const rustig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", behavior: rustig ? "auto" : "smooth" });
    el.focus({ preventScroll: true });
    el.removeAttribute("data-schud");
    void el.offsetWidth;
    el.setAttribute("data-schud", "");
    el.addEventListener("animationend", () => el.removeAttribute("data-schud"), { once: true });
  });
}

function SubmitBtn({ label, accent = "orange" }: { label: string; accent?: "orange" | "purple" }) {
  return (
    <button type="submit" className={`verzend${accent === "purple" ? " verzend--paars" : ""}`}>
      {label}
    </button>
  );
}

function SentCard({ message, accent = "orange" }: { message: string; accent?: "orange" | "purple" }) {
  const { email } = useInstellingen();
  // Het formulier is net verdwenen en de pagina kromp: zet de bevestiging in beeld
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rustig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ref.current?.scrollIntoView({ block: "center", behavior: rustig ? "auto" : "smooth" });
    ref.current?.focus({ preventScroll: true });
  }, []);
  return (
    <div ref={ref} role="status" tabIndex={-1} className="bevestiging" style={{ background: "#FFFFFF", borderRadius: "20px", padding: "52px 40px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", outline: "none" }}>
      <div aria-hidden="true" className="vink" style={{ width: "52px", height: "52px", borderRadius: "50%", background: accent === "purple" ? "rgba(124,58,237,0.12)" : "rgba(243,106,42,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", margin: "0 auto 18px", color: accent === "purple" ? "#7C3AED" : "var(--primary)", fontWeight: 800 }}>✓</div>
      <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#111", margin: "0 0 10px", letterSpacing: "-0.5px" }}>Bijna klaar!</h3>
      <p style={{ fontSize: "15px", color: "#666", margin: "0 0 12px", lineHeight: 1.7 }}>
        Je mailprogramma is geopend met je bericht. Klik daar op <strong>verzenden</strong>. {message}
      </p>
      <p style={{ fontSize: "13px", color: "#767676", margin: 0, lineHeight: 1.6 }}>
        Opende er niets? Mail ons dan op{" "}
        <a href={`mailto:${email}`} style={{ color: accent === "purple" ? "#7C3AED" : "var(--primary)", fontWeight: 700 }}>{email}</a>.
      </p>
    </div>
  );
}

export default function ContactPage() {
  const inst = useInstellingen();
  const socials = useSocials(18);
  const dag = inst.repetitie_dag.toLowerCase();
  // ── Meezingen form ──
  const [mz, setMz] = useState({ naam: "", email: "", stemgroep: "", bericht: "" });
  const [mzStatus, setMzStatus] = useState<FormStatus>("idle");
  const [mzErr, setMzErr] = useState<Partial<typeof mz>>({});

  function mzChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setMz((p) => ({ ...p, [name]: value }));
    if (mzErr[name as keyof typeof mz]) setMzErr((p) => ({ ...p, [name]: undefined }));
  }
  function mzSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err: Partial<typeof mz> = {};
    if (!mz.naam.trim()) err.naam = "Vul je naam in";
    if (!mz.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mz.email)) err.email = "Vul een geldig e-mailadres in";
    if (Object.keys(err).length) { setMzErr(err); toonEersteFout(e.currentTarget as HTMLFormElement); return; }
    openMail(inst.email, `Aanmelding meezingen — ${mz.naam}`, [
      ["Naam", mz.naam],
      ["E-mail", mz.email],
      ["Stemgroep", mz.stemgroep || "Weet ik nog niet"],
      ["Bericht", mz.bericht],
    ]);
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
  function bkSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err: Partial<typeof bk> = {};
    if (!bk.naam.trim()) err.naam = "Vul je naam in";
    if (!bk.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bk.email)) err.email = "Vul een geldig e-mailadres in";
    if (!bk.bericht.trim()) err.bericht = "Vertel iets over het evenement";
    if (Object.keys(err).length) { setBkErr(err); toonEersteFout(e.currentTarget as HTMLFormElement); return; }
    openMail(inst.email, `Boekingsaanvraag — ${bk.organisatie || bk.naam}`, [
      ["Naam", bk.naam],
      ["Organisatie", bk.organisatie],
      ["E-mail", bk.email],
      ["Telefoon", bk.telefoon],
      ["Type evenement", bk.type],
      ["Datum", bk.datum],
      ["Bericht", bk.bericht],
    ]);
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
            padding: "128px 24px 80px",
            minHeight: "280px",
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
              style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, color: "#FFFFFF", margin: "0 0 24px" }}
            />
            <Reveal direct delay={180}>
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
                <RevealText text="Neem contact op" style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, letterSpacing: "-1px", color: "#111", margin: "0 0 28px" }} />

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em" }}>E-mail</p>
                    <a href={`mailto:${inst.email}`} className="contact-mail">
                      {inst.email}
                    </a>
                  </div>

                  <div>
                    <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em" }}>Uitnodigen</p>
                    <a href="#boeken" className="pijl-link">
                      Aanvraag via formulier hieronder →
                    </a>
                  </div>

                  <div>
                    <p style={{ margin: "0 0 10px", fontSize: "11px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em" }}>Volg ons</p>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      {socials.map((s) => (
                        <a
                          key={s.label}
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="contact-social"
                          style={{ "--merk": s.color } as React.CSSProperties}
                        >
                          <span style={{ display: "inline-flex", color: s.color }}>{s.icon}</span>
                          {s.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Right: repetitie info */}
              <Reveal delay={120}>
                <p id="repetities" style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: 700, color: "var(--primary)", letterSpacing: "0.08em", textTransform: "uppercase", scrollMarginTop: "120px" }}>Repetities</p>
                <RevealText text={`Elke ${dag}`} style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, letterSpacing: "-1px", color: "#111", margin: "0 0 28px" }} />

                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {[
                    { label: "Tijd", value: `${inst.repetitie_tijd} uur` },
                    { label: "Locatie", value: inst.repetitie_locatie },
                    { label: "Adres", value: inst.repetitie_adres, kaart: true },
                  ].map((row, i, arr) => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", padding: "13px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.07)" : "none" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.05em" }}>{row.label}</span>
                      {row.kaart ? (
                        // Tikken opent de kaart-app met de route
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${inst.repetitie_locatie}, ${inst.repetitie_adres}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="contact-adres"
                        >
                          {row.value}
                        </a>
                      ) : (
                        <span style={{ fontSize: "15px", fontWeight: 700, color: "#111", textAlign: "right" }}>{row.value}</span>
                      )}
                    </div>
                  ))}
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
              <RevealText text="Wil je meezingen?" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.15, color: "#111", margin: "0 0 14px" }} />
              <p style={{ fontSize: "16px", color: "#555", margin: 0, lineHeight: 1.75, maxWidth: "520px", marginLeft: "auto", marginRight: "auto" }}>
                De drempel is laag — iedereen is welkom om een avond te komen proberen. Geen auditie, geen voorbereiding nodig. Stuur ons een berichtje en we verwelkomen je de eerstvolgende {dag}.
              </p>
            </Reveal>

            {mzStatus === "sent" ? (
              <SentCard message="We nemen zo snel mogelijk contact met je op. We hopen je snel te verwelkomen!" />
            ) : (
              <Reveal>
                <form
                  onSubmit={mzSubmit}
                  noValidate
                  className="form-card" style={{ background: "#FFFFFF", borderRadius: "24px", padding: "48px 40px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: "20px" }}
                >
                  <div>
                    <Label htmlFor="mz-naam" text="Naam" />
                    <input {...veld("mz-naam", mzErr.naam, true)} name="naam" type="text" autoComplete="name" placeholder="Je volledige naam" value={mz.naam} onChange={mzChange} />
                    <FieldError id="mz-naam" msg={mzErr.naam} />
                  </div>

                  <div>
                    <Label htmlFor="mz-email" text="E-mailadres" />
                    <input {...veld("mz-email", mzErr.email, true)} name="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="jouw@email.nl" value={mz.email} onChange={mzChange} />
                    <FieldError id="mz-email" msg={mzErr.email} />
                  </div>

                  <div style={{ position: "relative" }}>
                    <Label htmlFor="mz-stemgroep" text="Stemgroep" optional />
                    <div style={{ position: "relative" }}>
                      <select {...veld("mz-stemgroep")} name="stemgroep" value={mz.stemgroep} onChange={mzChange}>
                        <option value="">Weet ik nog niet / laat ik bepalen</option>
                        {stemgroepen.map((sg) => <option key={sg} value={sg.toLowerCase()}>{sg}</option>)}
                      </select>
                      <div aria-hidden="true" style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#888" }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="mz-bericht" text="Bericht" optional />
                    <textarea {...veld("mz-bericht")} name="bericht" rows={4} placeholder="Stel gerust een vraag of vertel iets over jezelf..." value={mz.bericht} onChange={mzChange}
                      style={{ minHeight: "100px" }} />
                  </div>

                  <SubmitBtn label="Verstuur aanmelding →" />
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
              <RevealText text="Boek ons voor jouw optreden" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.15, color: "#111", margin: "0 0 14px" }} />
              <p style={{ fontSize: "16px", color: "#555", margin: 0, lineHeight: 1.75, maxWidth: "520px", marginLeft: "auto", marginRight: "auto" }}>
                Voor feesten, jubilea, festivals of een intieme setting — wij zingen. Vraag een vrijblijvende offerte aan via het formulier hieronder.
              </p>
            </Reveal>

            {bkStatus === "sent" ? (
              <SentCard message="We bekijken je aanvraag en nemen zo snel mogelijk contact met je op." accent="purple" />
            ) : (
              <Reveal>
                <form
                  onSubmit={bkSubmit}
                  noValidate
                  className="form-card form--paars" style={{ background: "#FFFFFF", border: "1.5px solid rgba(0,0,0,0.08)", borderRadius: "24px", padding: "48px 40px", boxShadow: "0 4px 24px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "20px" }}
                >
                  {/* Two-column: naam + organisatie */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="form-row-2">
                    <div>
                      <Label htmlFor="bk-naam" text="Naam" accent="purple" />
                      <input {...veld("bk-naam", bkErr.naam, true)} name="naam" type="text" autoComplete="name" placeholder="Jouw naam" value={bk.naam} onChange={bkChange} />
                      <FieldError id="bk-naam" msg={bkErr.naam} />
                    </div>
                    <div>
                      <Label htmlFor="bk-organisatie" text="Organisatie" optional accent="purple" />
                      <input {...veld("bk-organisatie")} name="organisatie" type="text" autoComplete="organization" placeholder="Bedrijf of vereniging" value={bk.organisatie} onChange={bkChange} />
                    </div>
                  </div>

                  {/* Two-column: email + telefoon */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="form-row-2">
                    <div>
                      <Label htmlFor="bk-email" text="E-mailadres" accent="purple" />
                      <input {...veld("bk-email", bkErr.email, true)} name="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="jouw@email.nl" value={bk.email} onChange={bkChange} />
                      <FieldError id="bk-email" msg={bkErr.email} />
                    </div>
                    <div>
                      <Label htmlFor="bk-telefoon" text="Telefoonnummer" optional accent="purple" />
                      <input {...veld("bk-telefoon")} name="telefoon" type="tel" autoComplete="tel" placeholder="06 – – – –" value={bk.telefoon} onChange={bkChange} />
                    </div>
                  </div>

                  {/* Two-column: type + datum */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="form-row-2">
                    <div style={{ position: "relative" }}>
                      <Label htmlFor="bk-type" text="Type evenement" optional accent="purple" />
                      <div style={{ position: "relative" }}>
                        <select {...veld("bk-type")} name="type" value={bk.type} onChange={bkChange}>
                          <option value="">Kies een type</option>
                          {eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <div aria-hidden="true" style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#888" }}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bk-datum" text="Datum" optional accent="purple" />
                      <input {...veld("bk-datum")} name="datum" type="text" placeholder="bijv. juni 2026" value={bk.datum} onChange={bkChange} />
                    </div>
                  </div>

                  {/* Bericht */}
                  <div>
                    <Label htmlFor="bk-bericht" text="Bericht" accent="purple" />
                    <textarea {...veld("bk-bericht", bkErr.bericht, true)} name="bericht" rows={5} placeholder="Vertel iets over het evenement — locatie, verwacht aantal gasten, wensen..." value={bk.bericht} onChange={bkChange}
                      style={{ minHeight: "120px" }} />
                    <FieldError id="bk-bericht" msg={bkErr.bericht} />
                  </div>

                  <SubmitBtn label="Aanvraag doen →" accent="purple" />
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
        /* Velden: focus oranje (boeken: paars), rood bij een fout */
        .veld {
          width: 100%; padding: 12px 16px; font-size: 16px; font-family: inherit; color: #111;
          background: #fff; border-radius: 12px; outline: none; border: 1.5px solid rgba(0,0,0,0.12);
          transition: border-color 0.15s, box-shadow 0.15s; appearance: none; -webkit-appearance: none;
        }
        select.veld { cursor: pointer; padding-right: 40px; }
        textarea.veld { resize: vertical; }
        .veld:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(243,106,42,0.12); }
        .form--paars .veld:focus { border-color: #7C3AED; box-shadow: 0 0 0 3px rgba(124,58,237,0.12); }
        .veld[aria-invalid="true"] { border-color: #c53030; }
        .veld[aria-invalid="true"]:focus { border-color: #c53030; box-shadow: 0 0 0 3px rgba(197,48,48,0.14); }

        /* Fout bij verzenden: het veld trilt kort */
        @keyframes contact-schud {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(3px); }
        }
        [data-schud] { animation: contact-schud 0.3s var(--ease-out); }

        .verzend {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
          padding: 14px 28px; border: none; border-radius: 35px; cursor: pointer;
          font-family: inherit; font-size: 15px; font-weight: 700; color: #fff;
          background: var(--primary); box-shadow: 0 4px 20px rgba(243,106,42,0.28);
          transition: opacity 0.15s, transform 0.12s var(--ease-out);
        }
        .verzend--paars { background: #7C3AED; box-shadow: 0 4px 20px rgba(124,58,237,0.28); }

        /* Klikvlak 44px hoog, zonder dat de regel verspringt */
        .contact-mail { display: inline-block; padding: 11px 0; margin: -11px 0; font-size: 16px; font-weight: 600; color: var(--primary); text-decoration: none; transition: opacity 0.15s; }
        .contact-social {
          display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 35px;
          color: #111; background: #fff; border: 1.5px solid rgba(0,0,0,0.1);
          font-size: 14px; font-weight: 700; text-decoration: none;
          transition: border-color 0.15s, transform 0.12s var(--ease-out);
        }
        .contact-social > span { display: inline-flex; color: var(--merk); }
        .contact-adres {
          font-size: 15px; font-weight: 700; color: #111; text-align: right;
          text-decoration: underline; text-decoration-color: rgba(0,0,0,0.2); text-underline-offset: 4px;
          transition: text-decoration-color 0.15s, color 0.15s;
        }

        @media (hover: hover) {
          .verzend:hover { opacity: 0.9; transform: translateY(-1px); }
          .contact-mail:hover { opacity: 0.75; }
          .contact-social:hover { border-color: var(--merk); transform: translateY(-1px); }
          .contact-adres:hover { color: var(--primary); text-decoration-color: var(--primary); }
        }
        .verzend:active, .contact-social:active { transform: scale(0.97); transition-duration: 0.1s; }
        .contact-adres:active { color: var(--primary); }

        /* Bevestiging: komt binnen, het vinkje plopt kort op */
        @keyframes bevestiging-in { from { opacity: 0; transform: translateY(12px); } }
        @keyframes vink-plop {
          0% { transform: scale(0.4); opacity: 0; }
          60% { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1); }
        }
        .bevestiging { animation: bevestiging-in 0.4s var(--ease-out); }
        .vink { animation: vink-plop 0.42s var(--ease-out) 0.15s both; }
        @media (prefers-reduced-motion: reduce) {
          .bevestiging { animation-name: fadeIn; }
          .vink { animation: none; }
        }
        @media (max-width: 768px) {
          .contact-info-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
        @media (max-width: 560px) {
          .form-row-2 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .page-hero { padding: 100px 20px 64px !important; height: auto !important; min-height: 240px !important; }
          .section-pad { padding-top: 60px !important; padding-bottom: 72px !important; padding-left: 20px !important; padding-right: 20px !important; }
          .form-card { padding: 28px 20px !important; }
        }
      `}</style>
    </>
  );
}
