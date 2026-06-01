interface AlbumCardProps {
  slug: string;
  title: string;
  datum: string;
  photos: string[];
}

export default function AlbumCard({ slug, title, datum, photos }: AlbumCardProps) {
  if (photos.length === 0) return null;

  return (
    <a
      href={`/media/${slug}`}
      style={{ textDecoration: "none", display: "block", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", transition: "transform 0.2s, box-shadow 0.2s" }}
      className="card-hover"
    >
      <div style={{ aspectRatio: "4/3", overflow: "hidden", position: "relative" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photos[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }} />
        <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "100px", backdropFilter: "blur(4px)" }}>
          {photos.length} foto&apos;s
        </div>
      </div>
      <div style={{ padding: "14px 16px", background: "#FFFFFF" }}>
        <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#111", lineHeight: 1.3 }}>{title}</p>
        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#aaa", fontWeight: 500 }}>{datum}</p>
      </div>
    </a>
  );
}
