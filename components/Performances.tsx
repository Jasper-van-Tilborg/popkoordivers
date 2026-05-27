"use client";

import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";

interface AgendaEvent {
  id: number;
  titel: string;
  datum: string;
  tijd: string | null;
  locatie: string | null;
  label: string | null;
  label_kleur: string | null;
  beschrijving: string | null;
  link: string | null;
}

interface Props {
  events: AgendaEvent[];
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

export default function Performances({ events }: Props) {
  return (
    <section id="agenda" className="perf-section" style={{ position: "relative", padding: "100px 24px 140px", overflow: "hidden", background: "#FFF8F4" }}>

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Header row */}
        <Reveal style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "48px", flexWrap: "wrap", gap: "16px" }}>
          <RevealText
            text="Aankomende optredens"
            pageDelay={500}
            style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.15, color: "#111", margin: 0 }}
          />
          <a
            href="/agenda"
            style={{ fontSize: "14px", fontWeight: 600, color: "var(--primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", paddingBottom: "4px", borderBottom: "2px solid rgba(243,106,42,0.25)", transition: "border-color 0.15s", whiteSpace: "nowrap" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(243,106,42,0.25)")}
          >
            Alle data op Agenda →
          </a>
        </Reveal>

        {/* Timeline */}
        {events.length === 0 ? (
          <Reveal>
            <p style={{ fontSize: "15px", color: "#aaa", textAlign: "center", padding: "40px 0" }}>
              Nog geen optredens gepland.
            </p>
          </Reveal>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {events.map((event, i) => {
              const { day, month, year } = parseDatum(event.datum);
              return (
                <Reveal key={event.id} delay={i * 100}>
                  <div
                    className="event-row perf-row"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "80px 1fr auto",
                      gap: "24px",
                      alignItems: "center",
                      background: "#FFFFFF",
                      borderRadius: "16px",
                      padding: "20px 24px",
                      border: "1px solid rgba(0,0,0,0.07)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                  >
                    {/* Month */}
                    <div style={{ textAlign: "center" }}>
                      {day && <p style={{ margin: "0 0 2px", fontSize: "11px", fontWeight: 700, color: "#aaa" }}>{day}</p>}
                      <p style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "var(--primary)", lineHeight: 1, letterSpacing: "-0.5px" }}>
                        {month}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#aaa", fontWeight: 500 }}>{year}</p>
                    </div>

                    {/* Details */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
                        {event.label && (
                          <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em", color: "#fff", background: event.label_kleur ?? "var(--primary)", padding: "3px 10px", borderRadius: "100px", whiteSpace: "nowrap" }}>
                            {event.label}
                          </span>
                        )}
                        {event.locatie && (
                          <span style={{ fontSize: "13px", color: "#888", fontWeight: 500 }}>{event.locatie}</span>
                        )}
                      </div>
                      <p style={{ margin: "0 0 4px", fontSize: "17px", fontWeight: 700, color: "#111", letterSpacing: "-0.02em", lineHeight: 1.3 }}>
                        {event.titel}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {event.beschrijving && (
                          <span style={{ fontSize: "13px", color: "#666" }}>{event.beschrijving}</span>
                        )}
                        {event.tijd && (
                          <span style={{ fontSize: "12px", color: "#aaa", display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}>
                            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
                            </svg>
                            {event.tijd}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* CTA */}
                    <a
                      href={`/agenda/${event.id}`}
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(243,106,42,0.08)", color: "var(--primary)", fontSize: "13px", fontWeight: 700, padding: "10px 18px", borderRadius: "35px", textDecoration: "none", whiteSpace: "nowrap", border: "1.5px solid rgba(243,106,42,0.2)", transition: "background 0.15s, transform 0.12s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(243,106,42,0.08)"; e.currentTarget.style.color = "var(--primary)"; e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      Details →
                    </a>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}

      </div>

      <style>{`
        @media (max-width: 640px) {
          .perf-section { padding: 60px 16px 100px !important; }
          .perf-row { grid-template-columns: 60px 1fr !important; gap: 16px !important; }
          .perf-row > a:last-child { grid-column: 1 / -1; width: 100%; justify-content: center; }
        }
      `}</style>

      {/* Wave into white */}
      <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "80px" }}>
          <path d="M0,80 L0,30 Q360,68 720,35 Q1080,8 1440,52 L1440,80 Z" fill="#FFFFFF" />
        </svg>
      </div>
    </section>
  );
}
