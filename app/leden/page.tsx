import { redirect } from "next/navigation";
import LedenNavbar from "@/components/LedenNavbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { createClient } from "@/lib/supabase/server";
import { getPublicUrl } from "@/lib/r2";
import { IconPlay, IconMusic, IconSparkle, IconFolder } from "@/components/icons";
import StemTabs from "./components/StemTabs";

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ marginBottom: "40px" }}>
      <h2 style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.15, color: "#111", margin: 0 }}>
        {title}
      </h2>
    </div>
  );
}

interface BestandRaw {
  id: number;
  naam: string;
  categorie: string;
  stemgroep: string | null;
  r2_key: string;
}

export default async function LedenPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/leden/login");

  const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single();
  const rol = (profile?.rol ?? "lid") as "lid" | "admin";

  const [
    { data: liedjesRaw },
    { data: bestuur },
    { data: leden },
    { data: oudeOptredens },
    { data: bestandenRaw },
    { data: albumsRaw },
  ] = await Promise.all([
    supabase.from("liedjes").select("titel, componist, stemgroep, pdf_url").order("volgorde"),
    supabase.from("bestuur").select("naam, rol, initialen").order("volgorde"),
    supabase.from("smoelenboek").select("naam, stemgroep, initialen").order("naam"),
    supabase.from("oude_optredens").select("titel, datum, locatie, youtube_id").order("volgorde", { ascending: false }),
    supabase.from("bestanden").select("id, naam, categorie, stemgroep, r2_key").order("created_at", { ascending: false }),
    supabase.from("albums").select("id, slug, titel, datum").order("created_at", { ascending: false }),
  ]);

  // Alle fotos per album (inclusief niet-impressies)
  const albumsMetFotos = await Promise.all(
    (albumsRaw ?? []).map(async (album) => {
      const { data: fotos } = await supabase
        .from("fotos")
        .select("r2_key")
        .eq("album_id", album.id)
        .order("volgorde")
        .order("created_at");
      return { ...album, fotos: (fotos ?? []).map((f) => getPublicUrl(f.r2_key)) };
    })
  );

  const bestanden: (BestandRaw & { url: string })[] = (bestandenRaw ?? []).map((b) => ({
    ...b,
    url: getPublicUrl(b.r2_key),
  }));

  // Group bestanden by categorie
  const byCategorie = bestanden.reduce<Record<string, typeof bestanden>>((acc, b) => {
    acc[b.categorie] = acc[b.categorie] ?? [];
    acc[b.categorie].push(b);
    return acc;
  }, {});

  // Liedjes: merge pdf_url from bestanden by stemgroep + naam matching
  const bestandenLiedjesPerStem = (byCategorie["liedjes"] ?? []).reduce<Record<string, Record<string, string>>>((acc, b) => {
    const sg = b.stemgroep ?? "";
    acc[sg] = acc[sg] ?? {};
    acc[sg][b.naam.toLowerCase()] = b.url;
    return acc;
  }, {});

  const liedjesPerStem: Record<string, { titel: string; componist?: string | null; pdf_url?: string | null }[]> = {};
  for (const lied of liedjesRaw ?? []) {
    if (!liedjesPerStem[lied.stemgroep]) liedjesPerStem[lied.stemgroep] = [];
    const stemMap = bestandenLiedjesPerStem[lied.stemgroep] ?? {};
    const matchedUrl = stemMap[lied.titel.toLowerCase()] ?? lied.pdf_url ?? null;
    liedjesPerStem[lied.stemgroep].push({ titel: lied.titel, componist: lied.componist, pdf_url: matchedUrl });
  }

  const nieuwsbrieven = byCategorie["nieuwsbrieven"] ?? [];
  const opnames       = byCategorie["opnames"] ?? [];
  const choreo        = byCategorie["choreo"] ?? [];

  return (
    <>
      <LedenNavbar email={user.email!} rol={rol} />
      <main style={{ minHeight: "100vh", background: "#FFFFFF" }}>

        {/* ── 1. Header ── */}
        <section style={{ background: "#FFFFFF", padding: "88px 24px 40px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal delay={0}>
              <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, color: "#111", margin: "0 0 16px" }}>
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
            <Reveal delay={100}>
              <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "32px", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <StemTabs liedjes={liedjesPerStem} />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── 3. Nieuwsbrieven ── */}
        <section id="nieuwsbrieven" style={{ background: "#FFFFFF", padding: "80px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal><SectionHeader title="Nieuwsbrieven" /></Reveal>
            <Reveal delay={80}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {nieuwsbrieven.length === 0 ? (
                  <p style={{ fontSize: "14px", color: "#aaa" }}>Binnenkort beschikbaar.</p>
                ) : nieuwsbrieven.map((nb, i) => (
                  <div key={nb.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0", borderBottom: i < nieuwsbrieven.length - 1 ? "1px solid rgba(0,0,0,0.07)" : "none", gap: "16px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(243,106,42,0.09)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", flexShrink: 0 }}>
                        <IconFolder size={17} />
                      </div>
                      <p style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#111" }}>{nb.naam}</p>
                    </div>
                    <a href={nb.url} download style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: "13px", padding: "9px 20px", borderRadius: "35px", textDecoration: "none", whiteSpace: "nowrap", boxShadow: "0 2px 12px rgba(243,106,42,0.25)" }}>
                      Downloaden ↓
                    </a>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── 4. Bestuur ── */}
        <section id="bestuur" style={{ background: "#FFF8F4", padding: "80px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal><SectionHeader title="Samenstelling bestuur" /></Reveal>
            <Reveal delay={80}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }} className="bestuur-grid">
                {(bestuur ?? []).map((lid) => (
                  <div key={lid.naam} style={{ background: "#FFFFFF", borderRadius: "20px", padding: "24px 28px", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(243,106,42,0.10)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 800, color: "var(--primary)", flexShrink: 0, letterSpacing: "-0.5px" }}>
                      {lid.initialen}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#111", lineHeight: 1.3 }}>{lid.naam}</p>
                      <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--primary)", fontWeight: 600 }}>{lid.rol}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── 5. Smoelenboek ── */}
        <section id="smoelenboek" style={{ background: "#FFFFFF", padding: "80px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal><SectionHeader title="Smoelenboek" /></Reveal>
            <Reveal delay={80}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px" }} className="smoelenboek-grid">
                {(leden ?? []).map((lid) => (
                  <div key={lid.naam} style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.07)", borderRadius: "16px", padding: "20px 12px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(243,106,42,0.09)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", fontWeight: 800, color: "var(--primary)", margin: "0 auto 12px", letterSpacing: "-0.5px" }}>
                      {lid.initialen}
                    </div>
                    <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 700, color: "#111", lineHeight: 1.3 }}>{lid.naam}</p>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--primary)", background: "rgba(243,106,42,0.08)", padding: "3px 10px", borderRadius: "100px", letterSpacing: "0.04em" }}>
                      {lid.stemgroep}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── 6. Opnames & Choreo ── */}
        <section id="opnames" style={{ background: "#FFF8F4", padding: "80px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal><SectionHeader title="Opnames & Choreo" /></Reveal>
            <Reveal delay={80}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }} className="opnames-grid">

                {/* Opnames */}
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#111", margin: "0 0 16px", letterSpacing: "-0.2px", paddingBottom: "12px", borderBottom: "2px solid rgba(0,0,0,0.08)" }}>Opnames</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {opnames.length === 0 ? (
                      <p style={{ fontSize: "14px", color: "#aaa", padding: "8px 0" }}>Binnenkort beschikbaar.</p>
                    ) : opnames.map((item) => (
                      <div key={item.id} style={{ background: "#FFFFFF", borderRadius: "14px", padding: "14px 18px", border: "1px solid rgba(0,0,0,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                          <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "rgba(243,106,42,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--primary)" }}>
                            <IconPlay size={13} />
                          </div>
                          <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.naam}</p>
                        </div>
                        <a href={item.url} target="_blank" rel="noopener" style={{ fontSize: "12px", fontWeight: 700, color: "var(--primary)", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
                          Bekijken →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Choreo */}
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#111", margin: "0 0 16px", letterSpacing: "-0.2px", paddingBottom: "12px", borderBottom: "2px solid rgba(0,0,0,0.08)" }}>Choreografie</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {choreo.length === 0 ? (
                      <p style={{ fontSize: "14px", color: "#aaa", padding: "8px 0" }}>Binnenkort beschikbaar.</p>
                    ) : choreo.map((item) => (
                      <div key={item.id} style={{ background: "#FFFFFF", borderRadius: "14px", padding: "14px 18px", border: "1px solid rgba(0,0,0,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                          <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "rgba(14,165,233,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#0ea5e9" }}>
                            <IconSparkle size={13} />
                          </div>
                          <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.naam}</p>
                        </div>
                        <a href={item.url} target="_blank" rel="noopener" style={{ fontSize: "12px", fontWeight: 700, color: "var(--primary)", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
                          Bekijken →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </Reveal>
          </div>
        </section>

        {/* ── 7. Foto albums ── */}
        {albumsMetFotos.length > 0 && (
          <section id="fotoalbums" style={{ background: "#FFFFFF", padding: "80px 24px" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
              <Reveal><SectionHeader title="Foto albums" /></Reveal>
              {albumsMetFotos.map((album) => (
                <Reveal key={album.id} delay={80}>
                  <div style={{ marginBottom: "48px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
                      <div>
                        <p style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "#111", letterSpacing: "-0.3px" }}>{album.titel}</p>
                        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#aaa", fontWeight: 500 }}>{album.datum} · {album.fotos.length} foto{album.fotos.length !== 1 ? "'s" : ""}</p>
                      </div>
                    </div>
                    {album.fotos.length === 0 ? (
                      <p style={{ fontSize: "14px", color: "#aaa" }}>Nog geen foto's in dit album.</p>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
                        {album.fotos.map((url, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={i} src={url} alt="" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: "12px", display: "block" }} loading="lazy" />
                        ))}
                      </div>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* ── 8. Oude optredens ── */}
        <section id="optredens" style={{ background: "#FFFFFF", padding: "80px 24px 120px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal><SectionHeader title="Oude optredens" /></Reveal>
            <Reveal delay={80}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }} className="optredens-grid">
                {(oudeOptredens ?? []).map((optreden) => (
                  <div key={optreden.titel} style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", transition: "transform 0.2s, box-shadow 0.2s" }} className="card-hover">
                    <div style={{ aspectRatio: "16/9", background: "linear-gradient(135deg, rgba(243,106,42,0.2) 0%, #FDE8D8 50%, rgba(243,106,42,0.08) 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {optreden.youtube_id ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`https://img.youtube.com/vi/${optreden.youtube_id}/mqdefault.jpg`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                          <IconPlay size={15} />
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "16px 20px", background: "#FFFFFF" }}>
                      <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 700, color: "#111" }}>{optreden.titel}</p>
                      <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>{optreden.datum} · {optreden.locatie}</p>
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
