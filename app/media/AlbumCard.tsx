import Link from "next/link";

interface AlbumCardProps {
  slug: string;
  title: string;
  datum: string;
  omslag: string;
  fotos: number;
  /** Onder de eerste rij: pas laden als hij in de buurt komt */
  lazy?: boolean;
}

export default function AlbumCard({ slug, title, datum, omslag, fotos, lazy }: AlbumCardProps) {
  return (
    <Link
      href={`/media/${slug}`}
      style={{ textDecoration: "none", display: "block", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      className="card-hover"
    >
      <div style={{ aspectRatio: "4/3", overflow: "hidden", position: "relative", background: "#FFF4EE" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={omslag} alt="" loading={lazy ? "lazy" : undefined} decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "100px", backdropFilter: "blur(4px)" }}>
          {fotos} {fotos === 1 ? "foto" : "foto's"}
        </div>
      </div>
      <div style={{ padding: "14px 16px", background: "#FFFFFF" }}>
        <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#111", lineHeight: 1.3 }}>{title}</p>
        <p className="media-datum">{datum}</p>
      </div>
    </Link>
  );
}
