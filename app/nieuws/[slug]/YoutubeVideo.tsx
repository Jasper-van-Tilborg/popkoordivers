"use client";

import { useEffect, useRef, useState } from "react";

// Eerst alleen de voorbeeldfoto; YouTube zelf laadt pas na een tik
export default function YoutubeVideo({ id, titel }: { id: string; titel: string }) {
  const [speelt, setSpeelt] = useState(false);
  const speler = useRef<HTMLIFrameElement>(null);

  // De knop verdwijnt; zet de focus op de speler zodat toetsenbordgebruikers hun plek houden
  useEffect(() => { if (speelt) speler.current?.focus(); }, [speelt]);

  if (speelt) {
    return (
      <iframe
        ref={speler}
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
        title={titel}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  return (
    <button type="button" className="nd-video-start" onClick={() => setSpeelt(true)} aria-label={`Speel video af: ${titel}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" />
      <span className="nd-video-knop" aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14Z" /></svg>
      </span>
    </button>
  );
}
