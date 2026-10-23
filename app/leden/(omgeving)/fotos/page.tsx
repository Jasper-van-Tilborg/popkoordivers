import { downloadUrl } from "@/lib/r2";
import { IconCamera, IconPlay } from "@/components/icons";
import { Kop, Sectie } from "../Kop";
import { db } from "../data";

export default async function FotosPage() {
  const supabase = await db();
  const vandaag = new Date().toISOString().split("T")[0];
  const [{ data: albums }, { data: fotos }, { data: optredens }] = await Promise.all([
    supabase.from("albums").select("id, slug, titel, datum").order("created_at", { ascending: false }),
    supabase.from("fotos").select("album_id, r2_key").order("volgorde").order("created_at"),
    supabase.from("agenda").select("id, titel, datum, locatie, fotos_url").eq("gepubliceerd", true).lt("datum_sorteer", vandaag).order("datum_sorteer", { ascending: false }),
  ]);

  // Alle foto's staan in de privé bucket: tijdelijke links (1 uur geldig)
  const metFotos = await Promise.all((albums ?? []).map(async (a) => ({
    ...a,
    fotos: await Promise.all((fotos ?? []).filter((f) => f.album_id === a.id).map((f) => downloadUrl(f.r2_key))),
  })));
  const oud = optredens ?? [];

  return (
    <>
      <Kop titel="Foto's" tekst="Alle fotoalbums van het koor, en de optredens die we al gehad hebben." />
      <Sectie titel="Fotoalbums" aantal={metFotos.length}>
        {metFotos.length === 0 ? (
          <p className="leden-leeg">Nog geen albums.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {metFotos.map((album, idx) => (
              <details key={album.id} open={idx === 0} className="leden-kaart leden-album" style={{ overflow: "hidden" }}>
                <summary>
                  <div>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#111", letterSpacing: "-0.3px" }}>{album.titel}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#999", fontWeight: 500 }}>{album.datum}, {album.fotos.length} foto{album.fotos.length !== 1 ? "'s" : ""}</p>
                  </div>
                  <span className="leden-album__chevron" aria-hidden="true">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" /></svg>
                  </span>
                </summary>
                <div style={{ padding: "0 20px 20px" }}>
                  {album.fotos.length === 0 ? (
                    <p className="leden-leeg">Nog geen foto&apos;s in dit album.</p>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
                      {album.fotos.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener" style={{ display: "block", borderRadius: 12, overflow: "hidden" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" className="leden-foto" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} loading="lazy" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        )}
      </Sectie>

      <Sectie titel="Afgelopen optredens" aantal={oud.length} id="optredens">
        {oud.length === 0 ? (
          <p className="leden-leeg">Nog geen afgelopen optredens.</p>
        ) : (
          <div className="leden-kaart" style={{ overflow: "hidden" }}>
            {oud.map((o) => (
              <a key={o.id} href={o.fotos_url ?? `/agenda/${o.id}`} className="leden-row">
                <span className="leden-row__icon">{o.fotos_url ? <IconCamera size={16} /> : <IconPlay size={14} />}</span>
                <span className="leden-row__title">
                  {o.titel}
                  <span className="leden-row__sub">{[o.datum, o.locatie].filter(Boolean).join(", ")}</span>
                </span>
                <span className="leden-row__action">{o.fotos_url ? "Foto's" : "Bekijken"}</span>
              </a>
            ))}
          </div>
        )}
      </Sectie>
    </>
  );
}
