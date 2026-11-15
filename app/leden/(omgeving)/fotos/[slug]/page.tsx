import { notFound } from "next/navigation";
import Link from "next/link";
import { downloadUrl } from "@/lib/r2";
import { ALBUM_SOORTEN } from "@/lib/albumsoorten";
import Reveal from "@/components/Reveal";
import VideoSpeler from "@/components/VideoSpeler";
import { Sectie } from "../../Kop";
import { db } from "../../data";
import Galerij from "@/components/Galerij";

const meervoud = (n: number, een: string, meer: string) => `${n} ${n === 1 ? een : meer}`;

export default async function AlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await db();
  const { data: album } = await supabase.from("albums").select("id, slug, titel, datum, soort").eq("slug", slug).maybeSingle();
  if (!album) notFound();

  const [{ data: fotos }, { data: videos }, { data: albums }] = await Promise.all([
    supabase.from("fotos").select("r2_key, klein_key, bijschrift").eq("album_id", album.id).order("volgorde").order("created_at"),
    supabase.from("videos").select("id, titel, youtube_id, r2_key").eq("album_id", album.id).order("volgorde"),
    // Zelfde volgorde als het overzicht: nieuwste eerst
    supabase.from("albums").select("slug, titel")
      .order("datum_sorteer", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false }),
  ]);
  const plek = (albums ?? []).findIndex((a) => a.slug === album.slug);
  const nieuwer = plek > 0 ? albums![plek - 1] : null;
  const ouder = plek >= 0 ? albums![plek + 1] ?? null : null;

  // Privé bucket: tijdelijke links (1 uur geldig). Per foto de kleine versie voor
  // het raster, de grote voor de lightbox en een link die de foto opslaat.
  const lijst = fotos ?? [];
  const cijfers = String(lijst.length).length;
  const galerij = await Promise.all(lijst.map(async (f, i) => {
    const ext = f.r2_key.split(".").pop()?.toLowerCase() ?? "jpg";
    const [groot, klein, opslaan] = await Promise.all([
      downloadUrl(f.r2_key),
      f.klein_key ? downloadUrl(f.klein_key) : null,
      downloadUrl(f.r2_key, 3600, `${album.slug}-${String(i + 1).padStart(cijfers, "0")}.${ext}`),
    ]);
    return { groot, klein: klein ?? groot, opslaan, bijschrift: f.bijschrift };
  }));
  const filmpjes = await Promise.all((videos ?? []).map(async (v) => ({ ...v, src: v.r2_key ? await downloadUrl(v.r2_key) : null })));
  const soort = ALBUM_SOORTEN.find((s) => s.value === album.soort);
  // Met foto's én video's komen de video's eerst; dan kun je meteen naar de foto's springen
  const beide = galerij.length > 0 && filmpjes.length > 0;

  return (
    <>
      <section className="leden-kopvlak">
        <div className="leden-binnen">
          <Reveal direct>
            <Link href="/leden/fotos" className="album-terug">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Alle albums
            </Link>
            <h1>{album.titel}</h1>
            <p className="album-kopmeta">
              {soort && <span className="album-soort">{soort.label}</span>}
              {/* Op mobiel begint een regel anders met een los puntje */}
              {soort && !beide && <i className="album-breek" />}
              <span>{album.datum}</span>
              {!beide && galerij.length > 0 && <span>{meervoud(galerij.length, "foto", "foto's")}</span>}
              {!beide && filmpjes.length > 0 && <span>{meervoud(filmpjes.length, "video", "video's")}</span>}
            </p>
            {beide && (
              <nav className="fotos-spring" aria-label="Naar onderdeel">
                <a href="#fotos">Foto&apos;s <span>{galerij.length}</span></a>
                <a href="#videos">Video&apos;s <span>{filmpjes.length}</span></a>
              </nav>
            )}
          </Reveal>
        </div>
      </section>

      {filmpjes.length > 0 && (
        <Sectie titel={galerij.length > 0 ? "Video's" : undefined} id="videos">
          <div className="leden-videos">
            {filmpjes.map((v) => (
              <figure key={v.id} className="leden-kaart leden-video">
                <VideoSpeler titel={v.titel} youtubeId={v.youtube_id} src={v.src} className="leden-video__speler" />
                <figcaption className="leden-video__titel">{v.titel}</figcaption>
              </figure>
            ))}
          </div>
        </Sectie>
      )}

      {galerij.length > 0 ? (
        <Sectie titel={filmpjes.length > 0 ? "Foto's" : undefined} id="fotos">
          <Galerij fotos={galerij} titel={album.titel} />
        </Sectie>
      ) : filmpjes.length === 0 && (
        <Sectie><p className="leden-leeg">Nog geen foto&apos;s in dit album.</p></Sectie>
      )}

      {(nieuwer || ouder) && (
        <Sectie>
          <nav className="album-verder" aria-label="Ander album">
            {nieuwer ? (
              <Link href={`/leden/fotos/${nieuwer.slug}`} className="leden-kaart album-verder-link" rel="prev">
                <span className="album-verder-label">← Nieuwer album</span>
                <span className="album-verder-titel">{nieuwer.titel}</span>
              </Link>
            ) : <span />}
            {ouder && (
              <Link href={`/leden/fotos/${ouder.slug}`} className="leden-kaart album-verder-link album-verder-ouder" rel="next">
                <span className="album-verder-label">Ouder album →</span>
                <span className="album-verder-titel">{ouder.titel}</span>
              </Link>
            )}
          </nav>
          <p className="album-verder-alle"><Link href="/leden/fotos" className="pijl-link">Alle albums</Link></p>
        </Sectie>
      )}
    </>
  );
}
