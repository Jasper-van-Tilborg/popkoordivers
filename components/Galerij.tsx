"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import "./galerij.css";

// opslaan: een link die de foto downloadt. Zonder link geen knop "Opslaan".
export type GalerijFoto = { groot: string; klein: string; opslaan?: string | null; bijschrift: string | null };
type Foto = GalerijFoto;

// De foto's van een album als fotomuur; een klik opent de foto groot (lightbox),
// met bladeren (pijltjes, toetsen of vegen), opslaan en sluiten. Gebruikt op het
// openbare album (/media/[slug]) en het album in de ledenomgeving.
export default function Galerij({ fotos, titel }: { fotos: Foto[]; titel: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [richting, setRichting] = useState<"open" | "vorige" | "volgende">("open");
  const [geladen, setGeladen] = useState<ReadonlySet<number>>(new Set());

  const laad = useCallback((i: number) => {
    setGeladen((g) => (g.has(i) ? g : new Set(g).add(i)));
  }, []);

  const sluit = useCallback(() => setOpen(null), []);
  const vorige = useCallback(() => {
    setRichting("vorige");
    setOpen((i) => (i !== null && i > 0 ? i - 1 : i));
  }, []);
  const volgende = useCallback(() => {
    setRichting("volgende");
    setOpen((i) => (i !== null && i < fotos.length - 1 ? i + 1 : i));
  }, [fotos.length]);

  return (
    <>
      <div className="galerij">
        {fotos.map((f, i) => (
          <button
            key={f.groot}
            type="button"
            className="galerij-foto"
            data-geladen={geladen.has(i) || undefined}
            style={{ "--vertraging": `${Math.min(i, 12) * 45}ms` } as CSSProperties}
            onClick={() => { setRichting("open"); setOpen(i); }}
            aria-label={f.bijschrift ?? `Foto ${i + 1} van ${fotos.length}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={f.klein}
              alt={f.bijschrift ?? ""}
              loading={i < 9 ? "eager" : "lazy"}
              onLoad={() => laad(i)}
              ref={(el) => { if (el?.complete && el.naturalWidth) laad(i); }}
            />
            {f.bijschrift && <span className="galerij-bijschrift">{f.bijschrift}</span>}
          </button>
        ))}
      </div>

      {open !== null && (
        <Lightbox fotos={fotos} titel={titel} index={open} richting={richting} onVorige={vorige} onVolgende={volgende} onSluit={sluit} />
      )}
    </>
  );
}

function Lightbox({ fotos, titel, index, richting, onVorige, onVolgende, onSluit }: {
  fotos: Foto[];
  titel: string;
  index: number;
  richting: "open" | "vorige" | "volgende";
  onVorige: () => void;
  onVolgende: () => void;
  onSluit: () => void;
}) {
  const foto = fotos[index];
  const sluitKnop = useRef<HTMLButtonElement>(null);
  const veeg = useRef<{ x: number; y: number } | null>(null);

  // Toetsen, de pagina eronder stil, en de focus terug waar hij was na het sluiten
  useEffect(() => {
    const terug = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sluitKnop.current?.focus();
    return () => { document.body.style.overflow = overflow; terug?.focus(); };
  }, []);
  useEffect(() => {
    function toets(e: KeyboardEvent) {
      if (e.key === "Escape") onSluit();
      else if (e.key === "ArrowLeft") onVorige();
      else if (e.key === "ArrowRight") onVolgende();
    }
    window.addEventListener("keydown", toets);
    return () => window.removeEventListener("keydown", toets);
  }, [onSluit, onVorige, onVolgende]);

  // Eerst de kleine versie (die staat al in de cache van de fotomuur), dan de grote
  // zodra die binnen is; de buren alvast laden, dan staat de volgende er meteen.
  const [groot, setGroot] = useState<ReadonlySet<string>>(new Set());
  // Verhouding van de foto: de lightbox zet hem meteen op zijn uiteindelijke maat, zodat
  // de wissel van klein naar groot niet verspringt
  const [verhouding, setVerhouding] = useState<{ index: number; r: number } | null>(null);
  useEffect(() => {
    let weg = false;
    for (const i of [index, index - 1, index + 1]) {
      const f = fotos[i];
      if (!f) continue;
      const img = new Image();
      img.onload = () => { if (!weg) setGroot((g) => (g.has(f.groot) ? g : new Set(g).add(f.groot))); };
      img.src = f.groot;
    }
    return () => { weg = true; };
  }, [index, fotos]);

  return createPortal(
    <div
      className="lichtbak"
      role="dialog"
      aria-modal="true"
      aria-label={titel}
      onClick={onSluit}
      onTouchStart={(e) => { veeg.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
      onTouchEnd={(e) => {
        const start = veeg.current;
        veeg.current = null;
        if (!start) return;
        const dx = e.changedTouches[0].clientX - start.x;
        const dy = e.changedTouches[0].clientY - start.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? onVolgende : onVorige)();
        else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) onSluit();
      }}
    >
      <div className="lichtbak-balk" onClick={(e) => e.stopPropagation()}>
        <span className="lichtbak-teller">{index + 1} / {fotos.length}</span>
        <div className="lichtbak-knoppen">
          {foto.opslaan && <a href={foto.opslaan} className="lichtbak-knop" download>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19h14" />
            </svg>
            Opslaan
          </a>}
          <button ref={sluitKnop} type="button" className="lichtbak-knop" onClick={onSluit}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
            Sluiten
          </button>
        </div>
      </div>

      <figure className="lichtbak-figuur">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={index}
          src={groot.has(foto.groot) ? foto.groot : foto.klein}
          onLoad={(e) => { const { naturalWidth: w, naturalHeight: h } = e.currentTarget; if (w && h) setVerhouding({ index, r: w / h }); }}
          style={verhouding?.index === index ? ({ "--verhouding": verhouding.r } as CSSProperties) : undefined}
          alt={foto.bijschrift ?? ""}
          className="lichtbak-foto"
          data-richting={richting}
          draggable={false}
          onClick={(e) => e.stopPropagation()}
        />
        {foto.bijschrift && <figcaption className="lichtbak-bijschrift" onClick={(e) => e.stopPropagation()}>{foto.bijschrift}</figcaption>}
      </figure>

      <button type="button" className="lichtbak-pijl lichtbak-pijl--vorige" aria-label="Vorige foto" disabled={index === 0}
        onClick={(e) => { e.stopPropagation(); onVorige(); }}>
        <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 5l-7 7 7 7" /></svg>
      </button>
      <button type="button" className="lichtbak-pijl lichtbak-pijl--volgende" aria-label="Volgende foto" disabled={index === fotos.length - 1}
        onClick={(e) => { e.stopPropagation(); onVolgende(); }}>
        <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>,
    document.body,
  );
}
