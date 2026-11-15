import { downloadUrl } from "@/lib/r2";
import { IconCalendar, IconCamera } from "@/components/icons";
import VideoSpeler from "@/components/VideoSpeler";
import { Kop, Sectie } from "../Kop";
import { db } from "../data";
import AlbumRaster from "./AlbumRaster";

const datumTekst = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

export default async function FotosPage({ searchParams }: { searchParams: Promise<{ soort?: string }> }) {
  const { soort } = await searchParams;
  const supabase = await db();
  const vandaag = new Date().toISOString().split("T")[0];
  const [{ data: albums }, { data: fotos }, { data: videos }, { data: optredens }] = await Promise.all([
    supabase.from("albums").select("id, slug, titel, datum, soort")
      .order("datum_sorteer", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false }),
    supabase.from("fotos").select("album_id, r2_key, klein_key").order("volgorde").order("created_at"),
    supabase.from("videos").select("id, titel, datum, album_id, youtube_id, r2_key, volgorde")
      .order("datum", { ascending: false, nullsFirst: false }).order("volgorde"),
    supabase.from("agenda").select("id, titel, datum, locatie, fotos_url").eq("gepubliceerd", true).lt("datum_sorteer", vandaag).order("datum_sorteer", { ascending: false }),
  ]);

  // Per album alleen de eerste drie foto's als omslag; de rest haalt de albumpagina op.
  // Ze staan in de privé bucket: tijdelijke links (1 uur geldig).
  const kaarten = await Promise.all((albums ?? []).map(async (a) => {
    const vanAlbum = (fotos ?? []).filter((f) => f.album_id === a.id);
    return {
      slug: a.slug, titel: a.titel, datum: a.datum, soort: a.soort,
      fotos: vanAlbum.length,
      videos: (videos ?? []).filter((v) => v.album_id === a.id).length,
      omslag: await Promise.all(vanAlbum.slice(0, 3).map((f) => downloadUrl(f.klein_key ?? f.r2_key))),
    };
  }));
  const losseVideos = await Promise.all((videos ?? []).filter((v) => !v.album_id)
    .map(async (v) => ({ ...v, src: v.r2_key ? await downloadUrl(v.r2_key) : null })));
  const oud = optredens ?? [];

  return (
    <>
      <Kop titel="Foto's" tekst="Alle fotoalbums en video's van het koor, en de optredens die we al gehad hebben.">
        {(losseVideos.length > 0 || oud.length > 0) && (
          <nav className="fotos-spring" aria-label="Naar onderdeel">
            <a href="#albums">Albums <span>{kaarten.length}</span></a>
            {losseVideos.length > 0 && <a href="#videos">Video&apos;s <span>{losseVideos.length}</span></a>}
            {oud.length > 0 && <a href="#optredens">Optredens <span>{oud.length}</span></a>}
          </nav>
        )}
      </Kop>
      <Sectie titel="Fotoalbums" aantal={kaarten.length} id="albums" direct>
        {kaarten.length === 0 ? <p className="leden-leeg">Nog geen albums.</p> : <AlbumRaster albums={kaarten} soort={soort ?? null} />}
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
              <a key={o.id} href={o.fotos_url ?? `/agenda/${o.id}?van=fotos`} className="leden-row">
                <span className="leden-row__icon">{o.fotos_url ? <IconCamera size={16} /> : <IconCalendar size={16} />}</span>
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
