import Reveal from "@/components/Reveal";
import Footer from "@/components/Footer";
import { IconPlay, IconMusic, IconSparkle } from "@/components/icons";
import StemTabs from "@/app/leden/components/StemTabs";

const mockLiedjes = {
  Alt: [
    { titel: "Bohemian Rhapsody", componist: "Queen" },
    { titel: "Rolling in the Deep", componist: "Adele" },
    { titel: "Don't Stop Me Now", componist: "Queen" },
  ],
  Mezzo: [
    { titel: "Someone Like You", componist: "Adele" },
    { titel: "Dancing Queen", componist: "ABBA" },
    { titel: "Hello", componist: "Adele" },
  ],
  Sopraan: [
    { titel: "My Heart Will Go On", componist: "Céline Dion" },
    { titel: "Hallelujah", componist: "Leonard Cohen" },
    { titel: "River Deep Mountain High", componist: "Ike & Tina Turner" },
  ],
  Tenor: [
    { titel: "Fix You", componist: "Coldplay" },
    { titel: "Stand By Me", componist: "Ben E. King" },
    { titel: "Livin' on a Prayer", componist: "Bon Jovi" },
  ],
  Bas: [
    { titel: "With a Little Help from My Friends", componist: "The Beatles" },
    { titel: "Hit the Road Jack", componist: "Ray Charles" },
    { titel: "Under Pressure", componist: "Queen & David Bowie" },
  ],
};

const mockNieuwsbrieven = [
  { datum: "Mei 2026 · Nr. 3", titel: "Zomerseizoen en aankomende repetities" },
  { datum: "Maart 2026 · Nr. 2", titel: "Voorjaarsconcert terugblik & nieuwe liedjes" },
  { datum: "Januari 2026 · Nr. 1", titel: "Welkom bij het nieuwe seizoen 2026!" },
];

const mockBestuur = [
  { naam: "Marie van den Berg", rol: "Voorzitter", initialen: "MvdB" },
  { naam: "Peter Jansen", rol: "Penningmeester", initialen: "PJ" },
  { naam: "Sandra Kloos", rol: "Secretaris", initialen: "SK" },
];

const mockLeden = [
  { naam: "Anna Bakker", stemgroep: "Alt", initialen: "AB" },
  { naam: "Lies Verhoeven", stemgroep: "Alt", initialen: "LV" },
  { naam: "Marjolein Visser", stemgroep: "Alt", initialen: "MV" },
  { naam: "Karin de Wit", stemgroep: "Mezzo", initialen: "KdW" },
  { naam: "Els Mulder", stemgroep: "Mezzo", initialen: "EM" },
  { naam: "Anne Marie de Vries", stemgroep: "Mezzo", initialen: "AMdV" },
  { naam: "Susan Peters", stemgroep: "Sopraan", initialen: "SP" },
  { naam: "Linda Hooft", stemgroep: "Sopraan", initialen: "LH" },
  { naam: "Tessa Boer", stemgroep: "Sopraan", initialen: "TB" },
  { naam: "Henk Smit", stemgroep: "Tenor", initialen: "HS" },
  { naam: "Tom van Dijk", stemgroep: "Tenor", initialen: "TvD" },
  { naam: "Erik Bruins", stemgroep: "Tenor", initialen: "EB" },
  { naam: "Jan Koster", stemgroep: "Bas", initialen: "JK" },
  { naam: "Wim de Groot", stemgroep: "Bas", initialen: "WdG" },
  { naam: "Bob Linden", stemgroep: "Bas", initialen: "BL" },
];

const mockOpnames = [
  { titel: "Kersconcert 2025 – volledige show", datum: "december 2025", type: "video", url: "#" },
  { titel: "Zomerconcert 2025 – opname", datum: "juni 2025", type: "audio", url: "#" },
  { titel: "Voorjaarsconcert 2025", datum: "april 2025", type: "video", url: "#" },
];

const mockChoreo = [
  { titel: "Bohemian Rhapsody show-opener", lied: "Bohemian Rhapsody", url: "#" },
  { titel: "Dancing Queen intro choreografie", lied: "Dancing Queen", url: "#" },
];

const mockOptredens = [
  { titel: "Kersconcert 2025", datum: "december 2025", locatie: "Grote Kerk, Delft" },
  { titel: "Zomerconcert 2025", datum: "juni 2025", locatie: "Cultuurcentrum De Vlinderhal" },
  { titel: "Voorjaarsconcert 2025", datum: "april 2025", locatie: "Theater aan de Schie" },
  { titel: "Kerstmarkt optreden", datum: "december 2024", locatie: "Marktplein, Delft" },
  { titel: "Jubileumconcert 15 jaar", datum: "mei 2024", locatie: "Stadsgehoorzaal, Delft" },
  { titel: "Zomerconcert 2024", datum: "juni 2024", locatie: "Openluchttheater, Den Haag" },
];

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ marginBottom: "40px" }}>
      <h2
        style={{
          fontSize: "clamp(22px, 3vw, 34px)",
          fontWeight: 800,
          letterSpacing: "-1px",
          lineHeight: 1.15,
          color: "#111",
          margin: 0,
        }}
      >
        {title}
      </h2>
    </div>
  );
}

export default function DemoLedenPage() {
  const sections = [
    { href: "#liedjes", label: "Liedjes" },
    { href: "#nieuwsbrieven", label: "Nieuwsbrieven" },
    { href: "#bestuur", label: "Bestuur" },
    { href: "#smoelenboek", label: "Smoelenboek" },
    { href: "#opnames", label: "Opnames" },
    { href: "#optredens", label: "Optredens" },
  ];

  return (
    <>
      {/* Demo navbar */}
      <header
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          padding: "0 24px",
        }}
      >
        <nav
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <a href="/" style={{ textDecoration: "none", flexShrink: 0, lineHeight: 1.3 }}>
            <span style={{ display: "block", fontSize: "16px", fontWeight: 800, color: "#111", letterSpacing: "-0.02em" }}>
              Popkoor <span style={{ color: "var(--primary)" }}>Divers</span>
            </span>
            <span style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "#aaa", letterSpacing: "0.07em", textTransform: "uppercase" }}>
              Ledenomgeving
            </span>
          </a>

          <div className="leden-nav-links" style={{ display: "flex", gap: "2px", flexShrink: 1, overflow: "hidden" }}>
            {sections.map((s) => (
              <a
                key={s.href}
                href={s.href}
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#555",
                  textDecoration: "none",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  whiteSpace: "nowrap",
                }}
              >
                {s.label}
              </a>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--primary)",
                background: "rgba(243,106,42,0.10)",
                padding: "5px 12px",
                borderRadius: "100px",
                letterSpacing: "0.04em",
                textTransform: "uppercase" as const,
              }}
            >
              Demo
            </span>
            <a
              href="/demo"
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#555",
                textDecoration: "none",
                padding: "7px 14px",
                borderRadius: "35px",
                border: "1.5px solid rgba(0,0,0,0.12)",
                whiteSpace: "nowrap",
              }}
            >
              ← Demo menu
            </a>
          </div>
        </nav>

        <style>{`
          @media (max-width: 900px) { .leden-nav-links { display: none !important; } }
        `}</style>
      </header>

      <main style={{ minHeight: "100vh", background: "#FFFFFF" }}>
        {/* Demo banner */}
        <div
          style={{
            background: "rgba(243,106,42,0.06)",
            borderBottom: "1px solid rgba(243,106,42,0.15)",
            padding: "10px 24px",
            textAlign: "center",
            fontSize: "13px",
            color: "var(--primary)",
            fontWeight: 600,
          }}
        >
          Demo omgeving · Dit zijn voorbeeldgegevens
        </div>

        {/* Header */}
        <section
          style={{
            background: "#FFFFFF",
            padding: "88px 24px 40px",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal delay={0}>
              <h1
                style={{
                  fontSize: "clamp(32px, 5vw, 52px)",
                  fontWeight: 800,
                  letterSpacing: "-2px",
                  lineHeight: 1.1,
                  color: "#111",
                  margin: "0 0 16px",
                }}
              >
                Ledenomgeving
              </h1>
              <div style={{ width: "52px", height: "4px", background: "var(--primary)", borderRadius: "2px" }} />
            </Reveal>
          </div>
        </section>

        {/* Liedjes */}
        <section id="liedjes" style={{ background: "#FFF8F4", padding: "80px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal><SectionHeader title="Liedjes per stemgroep" /></Reveal>
            <Reveal delay={100}>
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: "20px",
                  padding: "32px",
                  border: "1px solid rgba(0,0,0,0.07)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                <StemTabs liedjes={mockLiedjes} />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Nieuwsbrieven */}
        <section id="nieuwsbrieven" style={{ background: "#FFFFFF", padding: "80px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal><SectionHeader title="Nieuwsbrieven" /></Reveal>
            <Reveal delay={80}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {mockNieuwsbrieven.map((nb, i) => (
                  <div
                    key={nb.titel}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "20px 0",
                      borderBottom: i < mockNieuwsbrieven.length - 1 ? "1px solid rgba(0,0,0,0.07)" : "none",
                      gap: "16px",
                      flexWrap: "wrap" as const,
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                        {nb.datum}
                      </span>
                      <p style={{ margin: "4px 0 0", fontSize: "16px", fontWeight: 600, color: "#111" }}>
                        {nb.titel}
                      </p>
                    </div>
                    <span style={{ fontSize: "12px", color: "#ccc", fontWeight: 500, whiteSpace: "nowrap" as const }}>
                      Binnenkort beschikbaar
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Bestuur */}
        <section id="bestuur" style={{ background: "#FFF8F4", padding: "80px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal><SectionHeader title="Samenstelling bestuur" /></Reveal>
            <Reveal delay={80}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }} className="bestuur-grid">
                {mockBestuur.map((lid) => (
                  <div
                    key={lid.naam}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: "20px",
                      padding: "24px 28px",
                      border: "1px solid rgba(0,0,0,0.07)",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "50%",
                        background: "rgba(243,106,42,0.10)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        fontWeight: 800,
                        color: "var(--primary)",
                        flexShrink: 0,
                        letterSpacing: "-0.5px",
                      }}
                    >
                      {lid.initialen}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#111", lineHeight: 1.3 }}>
                        {lid.naam}
                      </p>
                      <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--primary)", fontWeight: 600 }}>
                        {lid.rol}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Smoelenboek */}
        <section id="smoelenboek" style={{ background: "#FFFFFF", padding: "80px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal><SectionHeader title="Smoelenboek" /></Reveal>
            <Reveal delay={80}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px" }} className="smoelenboek-grid">
                {mockLeden.map((lid) => (
                  <div
                    key={lid.naam}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid rgba(0,0,0,0.07)",
                      borderRadius: "16px",
                      padding: "20px 12px",
                      textAlign: "center",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "50%",
                        background: "rgba(243,106,42,0.09)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "17px",
                        fontWeight: 800,
                        color: "var(--primary)",
                        margin: "0 auto 12px",
                        letterSpacing: "-0.5px",
                      }}
                    >
                      {lid.initialen}
                    </div>
                    <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 700, color: "#111", lineHeight: 1.3 }}>
                      {lid.naam}
                    </p>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "var(--primary)",
                        background: "rgba(243,106,42,0.08)",
                        padding: "3px 10px",
                        borderRadius: "100px",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {lid.stemgroep}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Opnames & Choreo */}
        <section id="opnames" style={{ background: "#FFF8F4", padding: "80px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal><SectionHeader title="Opnames & Choreo" /></Reveal>
            <Reveal delay={80}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }} className="opnames-grid">
                {/* Opnames */}
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#111", margin: "0 0 16px", paddingBottom: "12px", borderBottom: "2px solid rgba(0,0,0,0.08)" }}>
                    Opnames
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {mockOpnames.map((item) => (
                      <div
                        key={item.titel}
                        style={{
                          background: "#FFFFFF",
                          borderRadius: "14px",
                          padding: "14px 18px",
                          border: "1px solid rgba(0,0,0,0.07)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "12px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                          <div
                            style={{
                              width: "34px",
                              height: "34px",
                              borderRadius: "10px",
                              background: item.type === "video" ? "rgba(243,106,42,0.10)" : "rgba(99,102,241,0.10)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              color: item.type === "video" ? "var(--primary)" : "#6366f1",
                            }}
                          >
                            {item.type === "video" ? <IconPlay size={13} /> : <IconMusic size={13} />}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {item.titel}
                            </p>
                            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#888" }}>{item.datum}</p>
                          </div>
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--primary)", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
                          Bekijken →
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Choreo */}
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#111", margin: "0 0 16px", paddingBottom: "12px", borderBottom: "2px solid rgba(0,0,0,0.08)" }}>
                    Choreografie
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {mockChoreo.map((item) => (
                      <div
                        key={item.titel}
                        style={{
                          background: "#FFFFFF",
                          borderRadius: "14px",
                          padding: "14px 18px",
                          border: "1px solid rgba(0,0,0,0.07)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "12px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                          <div
                            style={{
                              width: "34px",
                              height: "34px",
                              borderRadius: "10px",
                              background: "rgba(14,165,233,0.10)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              color: "#0ea5e9",
                            }}
                          >
                            <IconSparkle size={13} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#111" }}>
                              {item.titel}
                            </p>
                            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#888" }}>{item.lied}</p>
                          </div>
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--primary)", whiteSpace: "nowrap", flexShrink: 0 }}>
                          Bekijken →
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Oude optredens */}
        <section id="optredens" style={{ background: "#FFFFFF", padding: "80px 24px 120px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal><SectionHeader title="Oude optredens" /></Reveal>
            <Reveal delay={80}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }} className="optredens-grid">
                {mockOptredens.map((optreden) => (
                  <div
                    key={optreden.titel}
                    style={{
                      borderRadius: "16px",
                      overflow: "hidden",
                      border: "1px solid rgba(0,0,0,0.07)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div
                      style={{
                        aspectRatio: "16/9",
                        background: "linear-gradient(135deg, rgba(243,106,42,0.2) 0%, #FDE8D8 50%, rgba(243,106,42,0.08) 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.92)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--primary)",
                        }}
                      >
                        <IconPlay size={15} />
                      </div>
                    </div>
                    <div style={{ padding: "16px 20px", background: "#FFFFFF" }}>
                      <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 700, color: "#111" }}>
                        {optreden.titel}
                      </p>
                      <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>
                        {optreden.datum} · {optreden.locatie}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .bestuur-grid { grid-template-columns: 1fr 1fr !important; }
          .smoelenboek-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .optredens-grid { grid-template-columns: 1fr 1fr !important; }
          .opnames-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
        @media (max-width: 640px) {
          .bestuur-grid { grid-template-columns: 1fr !important; }
          .smoelenboek-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .optredens-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
