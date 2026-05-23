import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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

export default async function AgendaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("agenda")
    .select("*")
    .eq("id", Number(id))
    .eq("gepubliceerd", true)
    .single();

  if (!event) notFound();

  const { day, month, year } = parseDatum(event.datum);
  const today = new Date().toISOString().split("T")[0];
  const isKomend = !event.datum_sorteer || event.datum_sorteer >= today;

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#FFFFFF" }}>

        {/* ── Hero ── */}
        <section style={{ background: "var(--primary)", padding: "140px 24px 100px", minHeight: "380px", position: "relative", overflow: "hidden" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 30% 30%, rgba(255,255,255,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>

            <Reveal delay={0}>
              <a
                href="/agenda"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.65)", textDecoration: "none", marginBottom: "28px", transition: "color 0.15s" }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                Terug naar agenda
              </a>
            </Reveal>

            <Reveal delay={80}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                {event.label && (
                  <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em", color: "#fff", background: event.label_kleur ?? "rgba(255,255,255,0.25)", padding: "4px 12px", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.3)" }}>
                    {event.label}
                  </span>
                )}
                <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.65)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {isKomend ? "Komend optreden" : "Afgelopen optreden"}
                </span>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <h1 style={{ fontSize: "clamp(28px, 4.5vw, 54px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, color: "#FFFFFF", margin: "0 0 20px", maxWidth: "800px" }}>
                {event.titel}
              </h1>
            </Reveal>

            <Reveal delay={220}>
              <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "15px", fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>
                  {day} {month} {year}
                </span>
                {event.tijd && (
                  <>
                    <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(255,255,255,0.4)" }} />
                    <span style={{ fontSize: "15px", color: "rgba(255,255,255,0.75)" }}>{event.tijd}</span>
                  </>
                )}
                {event.locatie && (
                  <>
                    <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(255,255,255,0.4)" }} />
                    <span style={{ fontSize: "15px", color: "rgba(255,255,255,0.75)" }}>{event.locatie}</span>
                  </>
                )}
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
        <section style={{ padding: "72px 24px 100px", background: "#FFFFFF" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>

            {/* Info grid */}
            <Reveal>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "1px",
                  background: "rgba(0,0,0,0.07)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  marginBottom: "48px",
                }}
                className="event-detail-grid"
              >
                {[
                  { label: "Datum", value: event.datum },
                  { label: "Tijd", value: event.tijd ?? "—" },
                  { label: "Locatie", value: event.locatie ?? "—" },
                ].map((row) => (
                  <div key={row.label} style={{ background: "#FFFFFF", padding: "20px 24px" }}>
                    <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{row.label}</p>
                    <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#111", lineHeight: 1.4 }}>{row.value}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Description */}
            {event.beschrijving && (
              <Reveal>
                <p style={{ fontSize: "18px", lineHeight: 1.8, color: "#444", margin: "0 0 48px", paddingBottom: "48px", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                  {event.beschrijving}
                </p>
              </Reveal>
            )}

            {/* Action buttons */}
            <Reveal>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {event.link && (
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: "14px", padding: "12px 24px", borderRadius: "35px", textDecoration: "none", boxShadow: "0 4px 16px rgba(243,106,42,0.28)", transition: "opacity 0.15s, transform 0.12s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    Meer info / kaartjes →
                  </a>
                )}
                {event.fotos_url && (
                  <a
                    href={event.fotos_url}
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(243,106,42,0.08)", color: "var(--primary)", fontWeight: 700, fontSize: "14px", padding: "12px 24px", borderRadius: "35px", textDecoration: "none", border: "1.5px solid rgba(243,106,42,0.2)", transition: "background 0.15s, color 0.15s, transform 0.12s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(243,106,42,0.08)"; e.currentTarget.style.color = "var(--primary)"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    Foto&apos;s bekijken →
                  </a>
                )}
                {!event.fotos_url && !isKomend && (
                  <a
                    href="/leden#optredens"
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(243,106,42,0.08)", color: "var(--primary)", fontWeight: 700, fontSize: "14px", padding: "12px 24px", borderRadius: "35px", textDecoration: "none", border: "1.5px solid rgba(243,106,42,0.2)", transition: "background 0.15s, color 0.15s, transform 0.12s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(243,106,42,0.08)"; e.currentTarget.style.color = "var(--primary)"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    Foto&apos;s (ledenomgeving) →
                  </a>
                )}
                <a
                  href="/agenda"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "none", color: "#888", fontWeight: 600, fontSize: "14px", padding: "12px 20px", borderRadius: "35px", textDecoration: "none", border: "1.5px solid rgba(0,0,0,0.12)", transition: "border-color 0.15s, color 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.25)"; e.currentTarget.style.color = "#111"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)"; e.currentTarget.style.color = "#888"; }}
                >
                  ← Terug naar agenda
                </a>
              </div>
            </Reveal>

          </div>
        </section>

      </main>
      <Footer />

      <style>{`
        @media (max-width: 600px) {
          .event-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
