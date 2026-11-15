import { downloadUrl } from "@/lib/r2";
import { IconCamera, IconPlay } from "@/components/icons";
import VideoSpeler from "@/components/VideoSpeler";
import { Kop, Sectie } from "../Kop";
import { db } from "../data";

const datumTekst = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

const meervoud = (n: number, een: string, meer: string) => `${n} ${n === 1 ? een : meer}`;

export default async function FotosPage() {
  const supabase = await db();
  const vandaag = new Date().toISOString().split("T")[0];
  const [{ data: albums }, { data: fotos }, { data: videos }, { data: optredens }] = await Promise.all([
    supabase.from("albums").select("id, slug, titel, datum")
      .order("datum_sorteer", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false }),
    supabase.from("fotos").select("album_id, r2_key, klein_key, bijschrift").order("volgorde").order("created_at"),
    supabase.from("videos").select("id, titel, datum, album_id, youtube_id, r2_key, volgorde")
      .order("datum", { ascending: false, nullsFirst: false }).order("volgorde"),
    supabase.from("agenda").select("id, titel, datum, locatie, fotos_url").eq("gepubliceerd", true).lt("datum_sorteer", vandaag).order("datum_sorteer", { ascending: false }),
  ]);

  // Foto's en eigen video's staan in de privé bucket: tijdelijke links (1 uur geldig)
  const metUrl = async <T extends { r2_key: string | null }>(v: T) => ({ ...v, src: v.r2_key ? await downloadUrl(v.r2_key) : null });
  const alleVideos = await Promise.all((videos ?? []).map(metUrl));
  const metFotos = await Promise.all((albums ?? []).map(async (a) => ({
    ...a,
    fotos: await Promise.all((fotos ?? []).filter((f) => f.album_id === a.id)
      .map(async (f) => ({ url: await downloadUrl(f.r2_key), klein: f.klein_key ? await downloadUrl(f.klein_key) : null, bijschrift: f.bijschrift }))),
    videos: alleVideos.filter((v) => v.album_id === a.id).sort((x, y) => x.volgorde - y.volgorde),
  })));
  const losseVideos = alleVideos.filter((v) => !v.album_id);
  const oud = optredens ?? [];

  return (
    <>
      <Kop titel="Foto's" tekst="Alle fotoalbums en video's van het koor, en de optredens die we al gehad hebben." />
      <Sectie titel="Fotoalbums" aantal={metFotos.length}>
        {metFotos.length === 0 ? (
          <p className="leden-leeg">Nog geen albums.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {metFotos.map((album, idx) => (
              <details key={album.id} open={idx === 0} className="leden-kaart leden-album" style={{ overflow: "hidden" }}>
                <summary>
                  <div>
                    <p className="leden-album-titel">{album.titel}</p>
                    <p className="leden-album-meta">
                      {[album.datum, meervoud(album.fotos.length, "foto", "foto's"), album.videos.length ? meervoud(album.videos.length, "video", "video's") : null].filter(Boolean).join(", ")}
                    </p>
                  </div>
                  <span className="leden-album__chevron" aria-hidden="true">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" /></svg>
                  </span>
                </summary>
                <div className="leden-album-inhoud">
                  {album.videos.length > 0 && (
                    <div className="leden-videos leden-videos--album">
                      {album.videos.map((v) => (
                        <figure key={v.id} className="leden-video">
                          <VideoSpeler titel={v.titel} youtubeId={v.youtube_id} src={v.src} className="leden-video__speler" />
                          <figcaption className="leden-video__titel">{v.titel}</figcaption>
                        </figure>
                      ))}
                    </div>
                  )}
                  {album.fotos.length === 0 ? (
                    album.videos.length === 0 && <p className="leden-leeg">Nog geen foto&apos;s in dit album.</p>
                  ) : (
                    <div className="leden-fotos">
                      {album.fotos.map((f, i) => (
                        <a key={i} href={f.url} target="_blank" rel="noopener" title={f.bijschrift ?? undefined}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={f.klein ?? f.url} alt={f.bijschrift ?? ""} className="leden-foto" loading="lazy" />
                          {f.bijschrift && <span className="leden-foto__bijschrift">{f.bijschrift}</span>}
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

      {losseVideos.length > 0 && (
        <Sectie titel="Video's" aantal={losseVideos.length} id="videos">
          <div className="leden-videos">
            {losseVideos.map((v) => (
              <figure key={v.id} className="leden-kaart leden-video">
                <VideoSpeler titel={v.titel} youtubeId={v.youtube_id} src={v.src} className="leden-video__speler" />
                <figcaption className="leden-video__titel">
                  {v.titel}
                  {v.datum && <span className="leden-video__datum">{datumTekst(v.datum)}</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        </Sectie>
      )}

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
