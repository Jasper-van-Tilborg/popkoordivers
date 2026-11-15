import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";

interface AgendaItem {
  id: number;
  titel: string;
  datum: string;
  datum_sorteer: string | null;
  tijd: string | null;
  locatie: string | null;
  beschrijving: string | null;
  link: string | null;
  fotos_url: string | null;
}

interface Props {
  komend: AgendaItem[];
  archief: AgendaItem[];
}

// Kaarten komen kort na elkaar binnen, maar een lange lijst blijft niet hangen
const stagger = (i: number) => Math.min(i * 40, 240);

const sectieKop = { fontSize: "clamp(26px, 3vw, 34px)", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.15, color: "#111", margin: 0 } as const;

export default function AgendaClient({ komend, archief }: Props) {
  // Archief staat al op datum (nieuw → oud); hier per jaar gegroepeerd
  const perJaar: { jaar: string; items: AgendaItem[] }[] = [];
  for (const item of archief) {
    const jaar = item.datum_sorteer?.slice(0, 4) ?? "Eerder";
    const groep = perJaar[perJaar.length - 1];
    if (groep && groep.jaar === jaar) groep.items.push(item);
    else perJaar.push({ jaar, items: [item] });
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#FFFFFF" }}>

        {/* ── Hero ── */}
        <section className="page-hero" style={{ background: "var(--primary)", padding: "128px 24px 80px", minHeight: "280px", position: "relative", overflow: "hidden" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 30% 30%, rgba(255,255,255,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
            <RevealText
              text="Agenda"
              as="h1"
              style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, color: "#FFFFFF", margin: "0 0 24px" }}
            />
            <Reveal direct delay={180}>
              <p style={{ fontSize: "clamp(15px, 1.6vw, 18px)", lineHeight: 1.7, color: "rgba(255,255,255,0.82)", maxWidth: "520px", margin: 0 }}>
                Waar en wanneer je ons live kunt horen — komende optredens en een terugblik op eerdere.
              </p>
            </Reveal>
          </div>

          <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
            <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "60px" }}>
              <path d="M0,60 L0,30 Q360,0 720,25 Q1080,50 1440,15 L1440,60 Z" fill="#FFFFFF" />
            </svg>
          </div>
        </section>

        {/* ── Content ── */}
        <section className="section-pad" style={{ padding: "60px 24px 100px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

            {/* Komend */}
            <div id="komend">
              <Reveal direct>
                <h2 style={{ ...sectieKop, marginBottom: "24px" }}>Komende optredens</h2>
              </Reveal>

              {komend.length === 0 ? (
                <Reveal direct delay={60}>
                  <p style={{ fontSize: "16px", color: "#666", margin: 0 }}>Nog geen optredens gepland.</p>
                </Reveal>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {komend.map((event, i) => (
                    <EventRow key={event.id} event={event} delay={60 + stagger(i)} />
                  ))}
                </div>
              )}
            </div>

            {/* Eerder, per jaar */}
            {perJaar.length > 0 && (
              <div id="eerder" style={{ marginTop: "88px" }}>
                <Reveal style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "12px 24px", marginBottom: "8px" }}>
                  <h2 style={sectieKop}>Eerdere optredens</h2>
                  <Link href="/media" className="pijl-link agenda-media-link">
                    Naar foto&apos;s &amp; video&apos;s →
                  </Link>
                </Reveal>

                {perJaar.map(({ jaar, items }) => (
                  <div key={jaar}>
                    <Reveal>
                      <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#999", letterSpacing: "0.04em", margin: "32px 0 14px" }}>{jaar}</h3>
                    </Reveal>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {items.map((item, i) => (
                        <Reveal key={item.id} delay={stagger(i)}>
                          <Link href={`/agenda/${item.id}`} className="agenda-card agenda-card--eerder card-hover" style={{ textDecoration: "none", background: "#FFFFFF", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ margin: "0 0 4px", fontSize: "17px", fontWeight: 700, color: "#111", letterSpacing: "-0.02em", lineHeight: 1.3 }}>
                                {item.titel}
                              </p>
                              {item.locatie && (
                                <span style={{ fontSize: "13px", color: "#777", fontWeight: 500 }}>{item.locatie}</span>
                              )}
                            </div>
                            <p className="agenda-card-datum" style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#999", flexShrink: 0, textAlign: "right" }}>
                              {item.datum}
                            </p>
                          </Link>
                        </Reveal>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Booking CTA */}
            <Reveal>
              <div
                id="boeken"
                className="booking-cta"
                style={{ marginTop: "88px", background: "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(124,58,237,0.04) 100%)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: "20px", padding: "48px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", flexWrap: "wrap" }}
              >
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: "12px", fontWeight: 700, color: "#7C3AED", letterSpacing: "0.08em", textTransform: "uppercase" }}>Iets te vieren?</p>
                  <h3 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, color: "#111", margin: 0, letterSpacing: "-0.02em" }}>Popkoor Divers uitnodigen voor een optreden</h3>
                </div>
                <Link href="/contact#boeken" className="btn boek-knop">
                  Aanvraag doen →
                </Link>
              </div>
            </Reveal>

          </div>
        </section>

      </main>
      <Footer />

      <style>{`
        .btn.boek-knop { background: #7C3AED; color: #fff; font-size: 15px; padding: 14px 28px; white-space: nowrap; box-shadow: 0 4px 20px rgba(124,58,237,0.28); }
        @media (hover: hover) { .btn.boek-knop:hover { opacity: 0.9; } }
        .agenda-media-link { padding-top: 10px; padding-bottom: 6px; }
        @media (max-width: 640px) {
          .page-hero { padding: 100px 20px 64px !important; height: auto !important; min-height: 240px !important; }
          .section-pad { padding-top: 48px !important; padding-bottom: 60px !important; padding-left: 20px !important; padding-right: 20px !important; }
          .booking-cta { padding: 28px 20px !important; }
          .agenda-card {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
            padding: 20px !important;
          }
          .agenda-card--eerder { gap: 8px !important; }
          .agenda-card--eerder .agenda-card-datum { font-size: 15px !important; text-align: left !important; }
        }
      `}</style>
    </>
  );
}

function EventRow({ event, delay }: { event: AgendaItem; delay: number }) {
  return (
    <Reveal direct delay={delay}>
      <Link
        href={`/agenda/${event.id}`}
        style={{
          textDecoration: "none",
          background: "#FFFFFF",
          borderRadius: "16px",
          border: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          padding: "24px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
        }}
        className="agenda-card card-hover"
      >
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: "0 0 8px", fontSize: "19px", fontWeight: 800, color: "#111", letterSpacing: "-0.03em", lineHeight: 1.25 }}>
            {event.titel}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {event.locatie && (
              <span style={{ fontSize: "13px", color: "#777", fontWeight: 500 }}>{event.locatie}</span>
            )}
            {event.locatie && event.tijd && (
              <span aria-hidden="true" style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#ccc", flexShrink: 0, display: "inline-block" }} />
            )}
            {event.tijd && (
              <span style={{ fontSize: "13px", color: "#777", fontWeight: 500 }}>{event.tijd}</span>
            )}
          </div>
        </div>
        <p style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "var(--primary)", letterSpacing: "-0.5px", lineHeight: 1, flexShrink: 0, textAlign: "right" }}>
          {event.datum}
        </p>
      </Link>
    </Reveal>
  );
}
