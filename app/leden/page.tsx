import { redirect } from "next/navigation";
import LedenNavbar from "@/components/LedenNavbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { createClient } from "@/lib/supabase/server";
import { IconPlay, IconMusic, IconSparkle } from "@/components/icons";
import StemTabs from "./components/StemTabs";

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

export default async function LedenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/leden/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  const rol = (profile?.rol ?? "lid") as "lid" | "admin";

  const [
    { data: liedjesRaw },
    { data: nieuwsbrieven },
    { data: bestuur },
    { data: leden },
    { data: opnames },
    { data: choreo },
    { data: oudeOptredens },
  ] = await Promise.all([
    supabase.from("liedjes").select("titel, componist, stemgroep, pdf_url").order("volgorde"),
    supabase.from("nieuwsbrieven").select("datum, titel, pdf_url").order("volgorde", { ascending: false }),
    supabase.from("bestuur").select("naam, rol, initialen").order("volgorde"),
    supabase.from("smoelenboek").select("naam, stemgroep, initialen").order("naam"),
    supabase.from("opnames").select("titel, datum, type, url").order("volgorde", { ascending: false }),
    supabase.from("choreo").select("titel, lied, url").order("volgorde"),
    supabase.from("oude_optredens").select("titel, datum, locatie").order("volgorde", { ascending: false }),
  ]);

  // Group liedjes by stemgroep
  const liedjesPerStem: Record<string, { titel: string; componist?: string | null; pdf_url?: string | null }[]> = {};
  for (const lied of liedjesRaw ?? []) {
    if (!liedjesPerStem[lied.stemgroep]) liedjesPerStem[lied.stemgroep] = [];
    liedjesPerStem[lied.stemgroep].push({ titel: lied.titel, componist: lied.componist, pdf_url: lied.pdf_url });
  }

  return (
    <>
      <LedenNavbar email={user.email!} rol={rol} />
      <main style={{ minHeight: "100vh", background: "#FFFFFF" }}>

        {/* ── 1. Header ── */}
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

        {/* ── 2. Liedjes per stem ── */}
        <section id="liedjes" style={{ background: "#FFF8F4", padding: "80px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal><SectionHeader title="Liedjes per stemgroep" /></Reveal>
            <Reveal delay={100}><div
              style={{
                background: "#FFFFFF",
                borderRadius: "20px",
                padding: "32px",
                border: "1px solid rgba(0,0,0,0.07)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              <StemTabs liedjes={liedjesPerStem} />
            </div></Reveal>
          </div>
        </section>

        {/* ── 3. Nieuwsbrieven ── */}
        <section id="nieuwsbrieven" style={{ background: "#FFFFFF", padding: "80px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal><SectionHeader title="Nieuwsbrieven" /></Reveal>
            <Reveal delay={80}><div style={{ display: "flex", flexDirection: "column" }}>
              {(nieuwsbrieven ?? []).map((nb, i) => (
                <div
                  key={nb.titel}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "20px 0",
                    borderBottom: i < (nieuwsbrieven ?? []).length - 1 ? "1px solid rgba(0,0,0,0.07)" : "none",
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
                  {nb.pdf_url ? (
                    <a
                      href={nb.pdf_url}
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
            </div></Reveal>
          </div>
        </section>

        {/* ── 4. Bestuur ── */}
        <section id="bestuur" style={{ background: "#FFF8F4", padding: "80px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal><SectionHeader title="Samenstelling bestuur" /></Reveal>
            <Reveal delay={80}><div
              style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}
              className="bestuur-grid"
            >
              {(bestuur ?? []).map((lid) => (
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
            </div></Reveal>
          </div>
        </section>

        {/* ── 5. Smoelenboek ── */}
        <section id="smoelenboek" style={{ background: "#FFFFFF", padding: "80px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal><SectionHeader title="Smoelenboek" /></Reveal>
            <Reveal delay={80}><div
              style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px" }}
              className="smoelenboek-grid"
            >
              {(leden ?? []).map((lid) => (
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
            </div></Reveal>
          </div>
        </section>

        {/* ── 6. Opnames & Choreo ── */}
        <section id="opnames" style={{ background: "#FFF8F4", padding: "80px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal><SectionHeader title="Opnames & Choreo" /></Reveal>
            <Reveal delay={80}><div
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
                  {(opnames ?? []).map((item) => (
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
                  {(choreo ?? []).map((item) => (
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
            </div></Reveal>
          </div>
        </section>

        {/* ── 7. Oude optredens ── */}
        <section id="optredens" style={{ background: "#FFFFFF", padding: "80px 24px 120px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal><SectionHeader title="Oude optredens" /></Reveal>
            <Reveal delay={80}><div
              style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}
              className="optredens-grid"
            >
              {(oudeOptredens ?? []).map((optreden) => (
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
            </div></Reveal>
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
