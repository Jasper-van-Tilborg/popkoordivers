"use client";

import { useState, useEffect, useCallback, useRef, type CSSProperties } from "react";

interface GalleryProps {
  photos: string[];
}

type LightboxAnim = "open" | "left" | "right";

export default function Gallery({ photos }: GalleryProps) {
  const [loaded, setLoaded] = useState<Set<number>>(new Set());
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [anim, setAnim] = useState<LightboxAnim>("open");
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);

  const markLoaded = useCallback((i: number) => {
    setLoaded((prev) => { const s = new Set(prev); s.add(i); return s; });
  }, []);

  useEffect(() => {
    imgRefs.current.forEach((el, i) => {
      if (el?.complete) markLoaded(i);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = useCallback(() => setLightbox(null), []);

  const prev = useCallback(() => {
    setAnim("left");
    setLightbox((i) => (i !== null ? Math.max(0, i - 1) : null));
  }, []);

  const next = useCallback(() => {
    setAnim("right");
    setLightbox((i) => (i !== null ? Math.min(photos.length - 1, i + 1) : null));
  }, [photos.length]);

  useEffect(() => {
    if (lightbox === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, close, prev, next]);

  if (photos.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px", background: "#FFF8F4", borderRadius: "20px", border: "1px solid rgba(243,106,42,0.1)" }}>
        <p style={{ fontSize: "17px", color: "#aaa", margin: 0 }}>Geen foto&apos;s gevonden.</p>
      </div>
    );
  }

  return (
    <>
      <div className="gallery-columns">
        {photos.map((src, i) => {
          const isLoaded = loaded.has(i);
          return (
            <div
              key={src}
              className="gallery-item"
              style={{ "--stagger": `${Math.min(i * 55, 660)}ms` } as CSSProperties}
              onClick={() => { setAnim("open"); setLightbox(i); }}
            >
              <div className={`gallery-img-wrap${isLoaded ? " is-loaded" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={(el) => { imgRefs.current[i] = el; }}
                  src={src}
                  alt=""
                  onLoad={() => markLoaded(i)}
                  loading="lazy"
                />
              </div>
            </div>
          );
        })}
      </div>

      {lightbox !== null && (
        <div className="lightbox-overlay" onClick={close}>
          <button onClick={(e) => { e.stopPropagation(); close(); }} aria-label="Sluiten"
            style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.12)", color: "#fff", border: "none", borderRadius: "50%", width: 44, height: 44, fontSize: "22px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, transition: "background 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
          >×</button>

          {lightbox > 0 && (
            <button onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Vorige"
              style={{ position: "absolute", left: 20, background: "rgba(255,255,255,0.12)", color: "#fff", border: "none", borderRadius: "50%", width: 52, height: 52, fontSize: "28px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
            >‹</button>
          )}

          {/* key bevat ook anim zodat React altijd opnieuw mount bij navigatie */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={`${lightbox}-${anim}`}
            src={photos[lightbox]}
            alt=""
            className={`lightbox-photo lightbox-photo--${anim}`}
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />

          {lightbox < photos.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Volgende"
              style={{ position: "absolute", right: 20, background: "rgba(255,255,255,0.12)", color: "#fff", border: "none", borderRadius: "50%", width: 52, height: 52, fontSize: "28px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
            >›</button>
          )}

          <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.5)", fontSize: "13px", fontWeight: 500, userSelect: "none", letterSpacing: "0.05em" }}>
            {lightbox + 1} / {photos.length}
          </div>
        </div>
      )}

      <style>{`
        @keyframes gallery-enter {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gallery-shimmer {
          0%   { background-position: -800px 0; }
          100% { background-position:  800px 0; }
        }
        @keyframes lb-overlay-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes lb-photo-open {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes lb-photo-from-right {
          from { opacity: 0; transform: translateX(60px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes lb-photo-from-left {
          from { opacity: 0; transform: translateX(-60px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }

        .lightbox-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0,0,0,0.93);
          display: flex; align-items: center; justify-content: center;
          animation: lb-overlay-in 0.25s ease both;
        }

        .lightbox-photo {
          max-width: 88vw; max-height: 84vh;
          object-fit: contain; border-radius: 10px;
          box-shadow: 0 12px 60px rgba(0,0,0,0.7);
          user-select: none;
        }
        .lightbox-photo--open  { animation: lb-photo-open       0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .lightbox-photo--right { animation: lb-photo-from-right 0.32s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .lightbox-photo--left  { animation: lb-photo-from-left  0.32s cubic-bezier(0.22, 1, 0.36, 1) both; }

        .gallery-columns { columns: 3; column-gap: 12px; }
        @media (max-width: 900px) { .gallery-columns { columns: 2; } }
        @media (max-width: 560px) { .gallery-columns { columns: 1; } }

        .gallery-item {
          margin-bottom: 12px;
          break-inside: avoid;
          cursor: zoom-in;
          animation: gallery-enter 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: var(--stagger, 0ms);
        }

        .gallery-img-wrap {
          border-radius: 12px;
          overflow: hidden;
          min-height: 100px;
          background: linear-gradient(90deg, rgba(243,106,42,0.06) 0%, rgba(243,106,42,0.15) 40%, rgba(243,106,42,0.06) 100%);
          background-size: 800px 100%;
          animation: gallery-shimmer 1.6s ease-in-out infinite;
        }
        .gallery-img-wrap.is-loaded { background: none; animation: none; min-height: 0; }

        .gallery-img-wrap img {
          width: 100%; display: block;
          opacity: 0; transform: scale(1.05);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .gallery-img-wrap.is-loaded img { opacity: 1; transform: scale(1); }
        .gallery-item:hover .gallery-img-wrap.is-loaded img { transform: scale(1.04); }
      `}</style>
    </>
  );
}
