"use client";

import { useState } from "react";

// Een video van YouTube of uit R2. YouTube laadt pas na een klik (eerst alleen de
// thumbnail), zodat een pagina met veel video's licht blijft.
export default function VideoSpeler({ titel, youtubeId, src, className }: {
  titel: string;
  youtubeId?: string | null;
  src?: string | null;
  className?: string;
}) {
  const [speelt, setSpeelt] = useState(false);
  const vlak: React.CSSProperties = { position: "relative", aspectRatio: "16/9", background: "#111", overflow: "hidden" };

  if (src) {
    return (
      <div className={className} style={vlak}>
        {/* #t=0.1: de browser toont het eerste beeld in plaats van een zwart vlak */}
        <video src={`${src}#t=0.1`} controls preload="metadata" playsInline title={titel}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
      </div>
    );
  }
  if (!youtubeId) return null;

  return (
    <div className={className} style={vlak}>
      {speelt ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={titel}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
        />
      ) : (
        <button type="button" onClick={() => setSpeelt(true)} aria-label={`${titel} afspelen`}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", padding: 0, border: 0, cursor: "pointer", background: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`} alt="" loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <span aria-hidden="true" style={{
            position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
            width: 64, height: 64, borderRadius: "50%", background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
          </span>
        </button>
      )}
    </div>
  );
}
