import { redirect } from "next/navigation";
import LedenNavbar from "@/components/LedenNavbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { createClient } from "@/lib/supabase/server";
import { getPublicUrl } from "@/lib/r2";
import { IconPlay, IconSparkle, IconFolder, IconClock, IconMapPin } from "@/components/icons";
import StemTabs from "./components/StemTabs";

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div style={{ marginBottom: "32px", display: "flex", alignItems: "center", gap: "12px" }}>
      <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.15, color: "#111", margin: 0 }}>
        {title}
      </h2>
      {count !== undefined && count > 0 && (
        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--primary)", background: "rgba(243,106,42,0.10)", padding: "3px 10px", borderRadius: "100px" }}>
          {count}
        </span>
      )}
    </div>
  );
}

const card = {
  background: "#FFFFFF",
  borderRadius: "20px",
  border: "1px solid rgba(0,0,0,0.06)",
  boxShadow: "var(--shadow-sm)",
} as const;

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
        <section style={{ background: "var(--gradient-hero), #FFFFFF", padding: "120px 24px 56px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal delay={0}>
              <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: 700, color: "var(--primary)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Welkom terug
              </p>
              <h1 style={{ fontSize: "clamp(34px, 5vw, 56px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.05, color: "#111", margin: "0 0 14px" }}>
                Ledenomgeving
              </h1>
              <p style={{ fontSize: "16px", lineHeight: 1.7, color: "#666", margin: "0 0 28px", maxWidth: "520px" }}>
                Bladmuziek, nieuwsbrieven, opnames en foto&apos;s — alles voor repetities en optredens op één plek.
              </p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <span className="leden-chip"><IconClock size={14} /> Dinsdag · 19:30 – 21:30</span>
                <span className="leden-chip"><IconMapPin size={14} /> CCGR De Schakel, Gilze</span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── 2. Liedjes per stem ── */}
        <section id="liedjes" className="leden-section" style={{ background: "#FFF8F4" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal><SectionHeader title="Liedjes per stemgroep" /></Reveal>
            <Reveal delay={100}>
              <div style={{ ...card, padding: "28px" }} className="leden-card-pad">
                <StemTabs liedjes={liedjesPerStem} />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── 3. Nieuwsbrieven ── */}
        <section id="nieuwsbrieven" className="leden-section" style={{ background: "#FFFFFF" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal><SectionHeader title="Nieuwsbrieven" count={nieuwsbrieven.length} /></Reveal>
            <Reveal delay={80}>
              {nieuwsbrieven.length === 0 ? (
                <p style={{ fontSize: "14px", color: "#aaa" }}>Binnenkort beschikbaar.</p>
              ) : (
                <div style={{ ...card, overflow: "hidden" }}>
                  {nieuwsbrieven.map((nb) => (
                    <a key={nb.id} href={nb.url} download className="leden-row">
                      <span className="leden-row__icon"><IconFolder size={16} /></span>
                      <span className="leden-row__title">{nb.naam}</span>
                      <span className="leden-row__action">Downloaden ↓</span>
                    </a>
                  ))}
                </div>
              )}
            </Reveal>
          </div>
        </section>

        {/* ── 4. Bestuur ── */}
        <section id="bestuur" className="leden-section" style={{ background: "#FFF8F4" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal><SectionHeader title="Samenstelling bestuur" /></Reveal>
            <Reveal delay={80}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }} className="bestuur-grid">
                {(bestuur ?? []).map((lid) => (
                  <div key={lid.naam} style={{ ...card, padding: "22px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div className="leden-avatar" style={{ width: "52px", height: "52px", fontSize: "16px" }}>
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
        <section id="smoelenboek" className="leden-section" style={{ background: "#FFFFFF" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal><SectionHeader title="Smoelenboek" count={(leden ?? []).length} /></Reveal>
            <Reveal delay={80}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "14px" }} className="smoelenboek-grid">
                {(leden ?? []).map((lid) => (
                  <div key={lid.naam} style={{ ...card, borderRadius: "16px", padding: "20px 12px", textAlign: "center" }}>
                    <div className="leden-avatar" style={{ width: "56px", height: "56px", fontSize: "17px", margin: "0 auto 12px" }}>
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
        <section id="opnames" className="leden-section" style={{ background: "#FFF8F4" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal><SectionHeader title="Opnames & Choreo" /></Reveal>
            <Reveal delay={80}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="opnames-grid">
                {[
                  { titel: "Opnames", items: opnames, icon: <IconPlay size={13} />, tint: "rgba(243,106,42,0.10)", kleur: "var(--primary)" },
                  { titel: "Choreografie", items: choreo, icon: <IconSparkle size={13} />, tint: "rgba(14,165,233,0.10)", kleur: "#0ea5e9" },
                ].map((groep) => (
                  <div key={groep.titel} style={{ ...card, overflow: "hidden" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#111", margin: 0, padding: "18px 22px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      {groep.titel}
                    </h3>
                    {groep.items.length === 0 ? (
                      <p style={{ fontSize: "14px", color: "#aaa", padding: "18px 22px", margin: 0 }}>Binnenkort beschikbaar.</p>
                    ) : groep.items.map((item) => (
                      <a key={item.id} href={item.url} target="_blank" rel="noopener" className="leden-row">
                        <span className="leden-row__icon" style={{ background: groep.tint, color: groep.kleur }}>{groep.icon}</span>
                        <span className="leden-row__title">{item.naam}</span>
                        <span className="leden-row__action">Bekijken →</span>
                      </a>
                    ))}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── 7. Foto albums ── */}
        {albumsMetFotos.length > 0 && (
          <section id="fotoalbums" className="leden-section" style={{ background: "#FFFFFF" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
              <Reveal><SectionHeader title="Foto albums" count={albumsMetFotos.length} /></Reveal>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {albumsMetFotos.map((album, idx) => (
                  <Reveal key={album.id} delay={Math.min(idx, 4) * 60}>
                    <details open={idx === 0} className="leden-album" style={{ ...card, overflow: "hidden" }}>
                      <summary>
                        <div>
                          <p style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#111", letterSpacing: "-0.3px" }}>{album.titel}</p>
                          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#999", fontWeight: 500 }}>{album.datum} · {album.fotos.length} foto{album.fotos.length !== 1 ? "'s" : ""}</p>
                        </div>
                        <span className="leden-album__chevron" aria-hidden="true">
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" /></svg>
                        </span>
                      </summary>
                      <div style={{ padding: "0 20px 20px" }}>
                        {album.fotos.length === 0 ? (
                          <p style={{ fontSize: "14px", color: "#aaa", margin: 0 }}>Nog geen foto&apos;s in dit album.</p>
                        ) : (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "8px" }}>
                            {album.fotos.map((url, i) => (
                              <a key={i} href={url} target="_blank" rel="noopener" style={{ display: "block", borderRadius: "12px", overflow: "hidden" }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt="" className="leden-foto" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} loading="lazy" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </details>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 8. Oude optredens ── */}
        <section id="optredens" className="leden-section" style={{ background: albumsMetFotos.length > 0 ? "#FFF8F4" : "#FFFFFF", paddingBottom: "120px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal><SectionHeader title="Oude optredens" count={(oudeOptredens ?? []).length} /></Reveal>
            <Reveal delay={80}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }} className="optredens-grid">
                {(oudeOptredens ?? []).map((optreden) => {
                  const inhoud = (
                    <>
                      <div style={{ position: "relative", aspectRatio: "16/9", background: "linear-gradient(135deg, rgba(243,106,42,0.2) 0%, #FDE8D8 50%, rgba(243,106,42,0.08) 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {optreden.youtube_id && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`https://img.youtube.com/vi/${optreden.youtube_id}/mqdefault.jpg`} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                        )}
                        <div style={{ position: "relative", width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
                          <IconPlay size={15} />
                        </div>
                      </div>
                      <div style={{ padding: "16px 20px" }}>
                        <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 700, color: "#111" }}>{optreden.titel}</p>
                        <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>{[optreden.datum, optreden.locatie].filter(Boolean).join(" · ")}</p>
                      </div>
                    </>
                  );
                  const stijl = { ...card, display: "block", borderRadius: "16px", overflow: "hidden", textDecoration: "none" } as const;
                  return optreden.youtube_id ? (
                    <a key={optreden.titel} href={`https://www.youtube.com/watch?v=${optreden.youtube_id}`} target="_blank" rel="noopener noreferrer" style={stijl} className="card-hover">
                      {inhoud}
                    </a>
                  ) : (
                    <div key={optreden.titel} style={stijl}>{inhoud}</div>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </section>

      </main>
      <Footer />

      <style>{`
        .leden-section { padding: 80px 24px; }
        .leden-chip {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 13px; font-weight: 600; color: #444;
          background: #fff; border: 1px solid rgba(0,0,0,0.08);
          padding: 8px 14px; border-radius: 100px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }
        .leden-chip svg { color: var(--primary); }
        .leden-avatar {
          border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, rgba(243,106,42,0.16), rgba(243,106,42,0.06));
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; color: var(--primary); letter-spacing: -0.5px;
          font-family: var(--font-display), var(--font-manrope), system-ui, sans-serif;
        }

        .leden-row {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 22px; text-decoration: none;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          transition: background 0.15s;
        }
        .leden-row:last-child { border-bottom: none; }
        .leden-row:hover { background: #FFF8F4; }
        .leden-row__icon {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(243,106,42,0.10); color: var(--primary);
        }
        .leden-row__title {
          flex: 1; min-width: 0; font-size: 14px; font-weight: 600; color: #111;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .leden-row__action {
          font-size: 12px; font-weight: 700; color: var(--primary); white-space: nowrap;
          transition: transform 0.2s var(--ease-out);
        }
        .leden-row:hover .leden-row__action { transform: translateX(3px); }

        .leden-album summary {
          list-style: none; cursor: pointer;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          padding: 18px 20px;
        }
        .leden-album summary::-webkit-details-marker { display: none; }
        .leden-album summary:hover { background: #FFFCFA; }
        .leden-album__chevron {
          width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.04); color: #666;
          transition: transform 0.25s var(--ease-out);
        }
        .leden-album[open] .leden-album__chevron { transform: rotate(180deg); }
        .leden-foto { transition: transform 0.4s var(--ease-out); }
        .leden-foto:hover { transform: scale(1.04); }

        @media (max-width: 900px) {
          .bestuur-grid { grid-template-columns: 1fr 1fr !important; }
          .smoelenboek-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .optredens-grid { grid-template-columns: 1fr 1fr !important; }
          .opnames-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .leden-section { padding: 56px 16px; }
          .leden-card-pad { padding: 20px !important; }
          .bestuur-grid { grid-template-columns: 1fr !important; }
          .smoelenboek-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .optredens-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
