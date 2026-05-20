import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./components/LogoutButton";
import StemTabs from "./components/StemTabs";
import {
  nieuwsbrieven,
  bestuur,
  leden,
  opnames,
  choreo,
  oudeOptredens,
} from "./data";

const navLinks = [
  { href: "#liedjes", label: "Liedjes" },
  { href: "#nieuwsbrieven", label: "Nieuwsbrieven" },
  { href: "#bestuur", label: "Bestuur" },
  { href: "#smoelenboek", label: "Smoelenboek" },
  { href: "#opnames", label: "Opnames & Choreo" },
  { href: "#optredens", label: "Oude optredens" },
];

function SectionHeader({ pill, title }: { pill: string; title: string }) {
  return (
    <div style={{ marginBottom: "40px" }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          background: "rgba(243,106,42,0.09)",
          border: "1px solid rgba(243,106,42,0.18)",
          borderRadius: "100px",
          padding: "4px 14px",
          marginBottom: "12px",
        }}
      >
        <span style={{ fontSize: "10px", color: "var(--primary)", fontWeight: 700, letterSpacing: "0.08em" }}>
          {pill}
        </span>
      </div>
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

export default async function LedenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/leden/login");

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#FFFFFF" }}>

        {/* ── 1. Header ── */}
        <section
          style={{
            background: "#FFFFFF",
            padding: "120px 24px 48px",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "24px",
                flexWrap: "wrap",
                marginBottom: "32px",
              }}
            >
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    background: "rgba(243,106,42,0.09)",
                    border: "1px solid rgba(243,106,42,0.18)",
                    borderRadius: "100px",
                    padding: "4px 14px",
                    marginBottom: "16px",
                  }}
                >
                  <span style={{ fontSize: "10px", color: "var(--primary)", fontWeight: 700, letterSpacing: "0.08em" }}>
                    LEDENOMGEVING
                  </span>
                </div>
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
              </div>
              <LogoutButton email={user.email!} />
            </div>

            {/* Quick nav */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="leden-nav-link"
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#555",
                    textDecoration: "none",
                    padding: "7px 16px",
                    borderRadius: "35px",
                    border: "1.5px solid rgba(0,0,0,0.10)",
                    transition: "border-color 0.15s, color 0.15s",
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── 2. Liedjes per stem ── */}
        <section id="liedjes" style={{ background: "#FFF8F4", padding: "80px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <SectionHeader pill="LIEDJES" title="Liedjes per stemgroep" />
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "20px",
                padding: "32px",
                border: "1px solid rgba(0,0,0,0.07)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              <StemTabs />
            </div>
          </div>
        </section>

        {/* ── 3. Nieuwsbrieven ── */}
        <section id="nieuwsbrieven" style={{ background: "#FFFFFF", padding: "80px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <SectionHeader pill="NIEUWSBRIEVEN" title="Nieuwsbrieven" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              {nieuwsbrieven.map((nb, i) => (
                <div
                  key={nb.titel}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "20px 0",
                    borderBottom: i < nieuwsbrieven.length - 1 ? "1px solid rgba(0,0,0,0.07)" : "none",
                    gap: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "var(--primary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {nb.datum}
                    </span>
                    <p style={{ margin: "4px 0 0", fontSize: "16px", fontWeight: 600, color: "#111" }}>
                      {nb.titel}
                    </p>
                  </div>
                  {nb.pdfUrl ? (
                    <a
                      href={nb.pdfUrl}
                      download
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "var(--primary)",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "13px",
                        padding: "9px 20px",
                        borderRadius: "35px",
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                        boxShadow: "0 2px 12px rgba(243,106,42,0.25)",
                      }}
                    >
                      Downloaden ↓
                    </a>
                  ) : (
                    <span style={{ fontSize: "12px", color: "#ccc", fontWeight: 500, whiteSpace: "nowrap" }}>
                      Binnenkort beschikbaar
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. Bestuur ── */}
        <section id="bestuur" style={{ background: "#FFF8F4", padding: "80px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <SectionHeader pill="BESTUUR" title="Samenstelling bestuur" />
            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}
              className="bestuur-grid"
            >
              {bestuur.map((lid) => (
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
          </div>
        </section>

        {/* ── 5. Smoelenboek ── */}
        <section id="smoelenboek" style={{ background: "#FFFFFF", padding: "80px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <SectionHeader pill="SMOELENBOEK" title="Smoelenboek" />
            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px" }}
              className="smoelenboek-grid"
            >
              {leden.map((lid) => (
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
                  <p
                    style={{
                      margin: "0 0 8px",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#111",
                      lineHeight: 1.3,
                    }}
                  >
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
          </div>
        </section>

        {/* ── 6. Opnames & Choreo ── */}
        <section id="opnames" style={{ background: "#FFF8F4", padding: "80px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <SectionHeader pill="MEDIA" title="Opnames & Choreo" />
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}
              className="opnames-grid"
            >
              {/* Opnames */}
              <div>
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#111",
                    margin: "0 0 16px",
                    letterSpacing: "-0.2px",
                    paddingBottom: "12px",
                    borderBottom: "2px solid rgba(0,0,0,0.08)",
                  }}
                >
                  Opnames
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {opnames.map((item) => (
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
                            fontSize: "13px",
                            flexShrink: 0,
                          }}
                        >
                          {item.type === "video" ? "▶" : "🎵"}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "13px",
                              fontWeight: 600,
                              color: "#111",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item.titel}
                          </p>
                          <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#888" }}>{item.datum}</p>
                        </div>
                      </div>
                      {item.url ? (
                        <a
                          href={item.url}
                          style={{ fontSize: "12px", fontWeight: 700, color: "var(--primary)", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}
                        >
                          Bekijken →
                        </a>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#ccc", flexShrink: 0 }}>Binnenkort</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Choreo */}
              <div>
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#111",
                    margin: "0 0 16px",
                    letterSpacing: "-0.2px",
                    paddingBottom: "12px",
                    borderBottom: "2px solid rgba(0,0,0,0.08)",
                  }}
                >
                  Choreografie
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {choreo.map((item) => (
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
                            fontSize: "13px",
                            flexShrink: 0,
                          }}
                        >
                          💃
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "13px",
                              fontWeight: 600,
                              color: "#111",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item.titel}
                          </p>
                          <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#888" }}>{item.lied}</p>
                        </div>
                      </div>
                      {item.url ? (
                        <a
                          href={item.url}
                          style={{ fontSize: "12px", fontWeight: 700, color: "var(--primary)", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}
                        >
                          Bekijken →
                        </a>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#ccc", flexShrink: 0 }}>Binnenkort</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. Oude optredens ── */}
        <section id="optredens" style={{ background: "#FFFFFF", padding: "80px 24px 120px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <SectionHeader pill="ARCHIEF" title="Oude optredens" />
            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}
              className="optredens-grid"
            >
              {oudeOptredens.map((optreden) => (
                <div
                  key={optreden.titel}
                  style={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "1px solid rgba(0,0,0,0.07)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  className="card-hover"
                >
                  <div style={{ aspectRatio: "16/9", position: "relative", overflow: "hidden" }}>
                    <img
                      src={`https://picsum.photos/seed/${optreden.seed}/600/338`}
                      alt={optreden.titel}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.32)",
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
                          fontSize: "15px",
                        }}
                      >
                        ▶
                      </div>
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
          </div>
        </section>

      </main>
      <Footer />

      <style>{`
        .leden-nav-link:hover { border-color: rgba(243,106,42,0.4) !important; color: var(--primary) !important; }
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
