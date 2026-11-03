import type { ReactNode } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";

// De oranje kop van een detailpagina (nieuws, agenda): terug-knop, meta, titel en
// intro, met een golf naar de kaart die eroverheen valt (.detail-kaart in globals.css).
export default function DetailKop({ terug, meta, titel, intro }: {
  terug: { href: string; label: string };
  meta?: ReactNode;
  titel: string;
  intro?: string | null;
}) {
  return (
    <section className="page-hero detail-kop">
      <div aria-hidden="true" className="detail-kop-gloed" />
      <div className="detail-binnen">
        <Reveal delay={0}>
          <Link href={terug.href} className="detail-terug">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            {terug.label}
          </Link>
        </Reveal>
        {meta && (
          <Reveal delay={80}>
            <div className="detail-meta">{meta}</div>
          </Reveal>
        )}
        <Reveal delay={160}>
          <h1 className="detail-titel">{titel}</h1>
        </Reveal>
        {intro && (
          <Reveal delay={220}>
            <p className="detail-intro">{intro}</p>
          </Reveal>
        )}
      </div>
      <div aria-hidden="true" className="detail-golf">
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,60 L0,30 Q360,0 720,25 Q1080,50 1440,15 L1440,60 Z" fill="#FFF8F4" />
        </svg>
      </div>
    </section>
  );
}
