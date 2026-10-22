import { redirect } from "next/navigation";
import LedenNavbar from "@/components/LedenNavbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { downloadUrl } from "@/lib/r2";
import { IconPlay, IconSparkle, IconFolder, IconClock, IconMapPin, IconCamera } from "@/components/icons";
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

const BESTUUR_VOLGORDE = ["voorzitter", "secretaris", "penningmeester"];
const STEMGROEPEN = ["Sopraan", "Mezzo", "Alt", "Tenor", "Bas"];

function initialen(naam: string) {
  const delen = naam.split(/\s+/).filter((w) => w && w[0] === w[0].toUpperCase());
  return (delen.map((w) => w[0]).join("") || naam.slice(0, 2)).slice(0, 2).toUpperCase();
}

export default async function LedenPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/leden/login");

  const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single();
  const rol = (profile?.rol ?? "lid") as "lid" | "admin";
  const today = new Date().toISOString().split("T")[0];

  const [
    { data: ledenRaw },
    { data: bestandenRaw },
    { data: albumsRaw },
    { data: fotosRaw },
    { data: optredensRaw },
  ] = await Promise.all([
    // Leden mogen elkaars profiel niet rechtstreeks lezen (e-mailadressen); de server
    // haalt alleen naam, stemgroep en bestuursfunctie op, na de login-check hierboven.
    createAdminClient().from("profiles").select("naam, stemgroep, bestuursfunctie, in_smoelenboek").not("naam", "is", null).order("naam"),
    supabase.from("bestanden").select("id, naam, categorie, stemgroep, r2_key").order("created_at", { ascending: false }),
    supabase.from("albums").select("id, slug, titel, datum").order("created_at", { ascending: false }),
    supabase.from("fotos").select("album_id, r2_key").order("volgorde").order("created_at"),
    supabase.from("agenda").select("id, titel, datum, locatie, fotos_url").eq("gepubliceerd", true).lt("datum_sorteer", today).order("datum_sorteer", { ascending: false }),
  ]);

  const leden = (ledenRaw ?? []).filter((l) => l.in_smoelenboek).map((l) => ({ ...l, naam: l.naam!, initialen: initialen(l.naam!) }));
  const bestuur = (ledenRaw ?? [])
    .filter((l) => l.bestuursfunctie)
    .map((l) => ({ naam: l.naam!, rol: l.bestuursfunctie!, initialen: initialen(l.naam!) }))
    .sort((a, b) => {
      const ia = BESTUUR_VOLGORDE.indexOf(a.rol.toLowerCase()), ib = BESTUUR_VOLGORDE.indexOf(b.rol.toLowerCase());
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.naam.localeCompare(b.naam, "nl");
    });

  // Alle bestanden en foto's staan in de privé bucket: tijdelijke links (1 uur geldig)
  const bestanden = await Promise.all((bestandenRaw ?? []).filter((b) => b.r2_key).map(async (b) => ({
    ...b,
    url: await downloadUrl(b.r2_key!),
  })));
  const albumsMetFotos = await Promise.all((albumsRaw ?? []).map(async (album) => ({
    ...album,
    fotos: await Promise.all((fotosRaw ?? []).filter((f) => f.album_id === album.id).map((f) => downloadUrl(f.r2_key))),
  })));

  const perCategorie = (c: string) => bestanden.filter((b) => b.categorie === c);

  // Liedjes per stemgroep; bestanden zonder stemgroep zijn voor iedereen
  const liedjesPerStem: Record<string, { titel: string; pdf_url: string }[]> = {};
  for (const stem of STEMGROEPEN) {
    liedjesPerStem[stem] = perCategorie("liedjes")
      .filter((b) => !b.stemgroep || b.stemgroep === stem)
      .map((b) => ({ titel: b.naam, pdf_url: b.url }))
      .sort((a, b) => a.titel.localeCompare(b.titel, "nl"));
  }

  const nieuwsbrieven = perCategorie("nieuwsbrieven");
  const alv           = perCategorie("alv");
  const opnames       = perCategorie("opnames");
  const choreo        = perCategorie("choreo");
  const oudeOptredens = optredensRaw ?? [];

  return (
    <>
      <LedenNavbar rol={rol} />
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

        {/* ── 3. Nieuwsbrieven en ALV-stukken ── */}
        <section id="nieuwsbrieven" className="leden-section" style={{ background: "#FFFFFF" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal><SectionHeader title="Nieuwsbrieven en ALV-stukken" count={nieuwsbrieven.length + alv.length} /></Reveal>
            <Reveal delay={80}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="opnames-grid">
                {[
                  { titel: "Nieuwsbrieven", items: nieuwsbrieven },
                  { titel: "ALV-stukken", items: alv },
                ].map((groep) => (
                  <div key={groep.titel} style={{ ...card, overflow: "hidden" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#111", margin: 0, padding: "18px 22px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      {groep.titel}
                    </h3>
                    {groep.items.length === 0 ? (
                      <p style={{ fontSize: "14px", color: "#aaa", padding: "18px 22px", margin: 0 }}>Binnenkort beschikbaar.</p>
                    ) : groep.items.map((doc) => (
                      <a key={doc.id} href={doc.url} target="_blank" rel="noopener" className="leden-row">
                        <span className="leden-row__icon"><IconFolder size={16} /></span>
                        <span className="leden-row__title">{doc.naam}</span>
                        <span className="leden-row__action">Openen</span>
                      </a>
                    ))}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── 4. Bestuur ── */}
        <section id="bestuur" className="leden-section" style={{ background: "#FFF8F4" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal><SectionHeader title="Samenstelling bestuur" /></Reveal>
            <Reveal delay={80}>
              {bestuur.length === 0 ? (
                <p style={{ fontSize: "14px", color: "#aaa" }}>Binnenkort beschikbaar.</p>
              ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }} className="bestuur-grid">
                {bestuur.map((lid, i) => (
                  <div key={i} style={{ ...card, padding: "22px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
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
              )}
            </Reveal>
          </div>
        </section>

        {/* ── 5. Smoelenboek ── */}
        <section id="smoelenboek" className="leden-section" style={{ background: "#FFFFFF" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal><SectionHeader title="Smoelenboek" count={leden.length} /></Reveal>
            <Reveal delay={80}>
              {leden.length === 0 ? (
                <p style={{ fontSize: "14px", color: "#aaa" }}>Binnenkort beschikbaar.</p>
              ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "14px" }} className="smoelenboek-grid">
                {leden.map((lid, i) => (
                  <div key={i} style={{ ...card, borderRadius: "16px", padding: "20px 12px", textAlign: "center" }}>
                    <div className="leden-avatar" style={{ width: "56px", height: "56px", fontSize: "17px", margin: "0 auto 12px" }}>
                      {lid.initialen}
                    </div>
                    <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 700, color: "#111", lineHeight: 1.3 }}>{lid.naam}</p>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--primary)", background: "rgba(243,106,42,0.08)", padding: "3px 10px", borderRadius: "100px", letterSpacing: "0.04em" }}>
                      {lid.stemgroep ?? "Divers"}
                    </span>
                  </div>
                ))}
              </div>
              )}
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

        {/* ── 8. Afgelopen optredens (uit de agenda) ── */}
        <section id="optredens" className="leden-section" style={{ background: albumsMetFotos.length > 0 ? "#FFF8F4" : "#FFFFFF", paddingBottom: "120px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal><SectionHeader title="Afgelopen optredens" count={oudeOptredens.length} /></Reveal>
            <Reveal delay={80}>
              {oudeOptredens.length === 0 ? (
                <p style={{ fontSize: "14px", color: "#aaa" }}>Nog geen afgelopen optredens.</p>
              ) : (
                <div style={{ ...card, overflow: "hidden" }}>
                  {oudeOptredens.map((o) => (
                    <a key={o.id} href={o.fotos_url ?? `/agenda/${o.id}`} className="leden-row">
                      <span className="leden-row__icon">{o.fotos_url ? <IconCamera size={16} /> : <IconPlay size={14} />}</span>
                      <span className="leden-row__title">
                        {o.titel}
                        <span style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#888", marginTop: "2px" }}>{[o.datum, o.locatie].filter(Boolean).join(", ")}</span>
                      </span>
                      <span className="leden-row__action">{o.fotos_url ? "Foto's" : "Bekijken"}</span>
                    </a>
                  ))}
                </div>
              )}
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
