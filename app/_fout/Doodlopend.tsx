"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import type { Uitweg } from "./uitweg";

// De opzet van de 404- en foutpagina van de site: menu, oranje kop met één uitweg, footer.
export default function Doodlopend({ titel, tekst, acties, verder }: { titel: string; tekst: string; acties: ReactNode; verder?: Uitweg[] }) {
  return (
    <>
      <Navbar />
      <main style={{ background: "#FFFFFF" }}>
        <section className="page-hero doodlopend-kop">
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 30% 30%, rgba(255,255,255,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
            <RevealText text={titel} as="h1" style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, color: "#FFFFFF", margin: "0 0 20px" }} />
            <Reveal direct delay={180}>
              <p style={{ fontSize: "clamp(15px, 1.6vw, 18px)", lineHeight: 1.7, color: "rgba(255,255,255,0.88)", maxWidth: "520px", margin: "0 0 32px" }}>{tekst}</p>
              <div className="doodlopend-acties">{acties}</div>
            </Reveal>
          </div>
          <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
            <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "60px" }}>
              <path d="M0,60 L0,30 Q360,0 720,25 Q1080,50 1440,15 L1440,60 Z" fill="#FFFFFF" />
            </svg>
          </div>
        </section>

        {verder && (
          <section className="doodlopend-verder">
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
              <Reveal direct delay={260}>
                <h2 className="doodlopend-h2">Of ga verder naar</h2>
                <ul className="doodlopend-raster">
                  {verder.map((v) => (
                    <li key={v.href}>
                      <Link href={v.href} className="doodlopend-kaart card-hover">
                        {v.label}<span aria-hidden="true">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </section>
        )}
        {!verder && <div className="doodlopend-ruimte" />}
      </main>
      <Footer />

      <style>{`
        .doodlopend-kop { background: var(--primary); padding: 128px 24px 96px; min-height: 280px; position: relative; overflow: hidden; }
        .doodlopend-acties { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 24px; }
        /* Wit op oranje: de enige felle knop op de pagina */
        .doodlopend-knop {
          display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 52px; padding: 0 28px;
          border: 0; border-radius: 35px; cursor: pointer; font: inherit; font-size: 16px; font-weight: 700;
          background: #fff; color: var(--oranje-tekst, #B54412); text-decoration: none;
          box-shadow: 0 6px 20px rgba(0,0,0,0.12); transition: transform 0.12s var(--ease-out), box-shadow 0.15s;
        }
        @media (hover: hover) { .doodlopend-knop:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.16); } }
        .doodlopend-knop:focus-visible, .doodlopend-link:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
        .doodlopend-knop[aria-busy="true"] { cursor: progress; }
        .doodlopend-draai { width: 18px; height: 18px; border-radius: 50%; border: 2.5px solid currentColor; border-right-color: transparent; animation: doodlopend-draai 0.8s linear infinite; }
        @keyframes doodlopend-draai { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) { .doodlopend-draai { animation-duration: 2.4s; } }
        .doodlopend-link {
          display: inline-block; padding: 12px 2px; border-radius: 4px; font-size: 15px; font-weight: 700; color: #fff;
          text-decoration: underline 2px rgba(255,255,255,0.5); text-underline-offset: 5px; transition: text-decoration-color 0.15s;
        }
        @media (hover: hover) { .doodlopend-link:hover { text-decoration-color: #fff; } }
        .doodlopend-link:active { text-decoration-color: #fff; }
        .doodlopend-verder { padding: 48px 24px 120px; }
        .doodlopend-ruimte { height: 96px; }
        .doodlopend-h2 { font-size: 15px; font-weight: 700; color: #666; margin: 0 0 16px; }
        .doodlopend-raster { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
        .doodlopend-kaart {
          display: flex; align-items: center; justify-content: space-between; min-height: 64px; padding: 0 22px; border-radius: 16px;
          background: #FFF8F4; border: 1px solid rgba(243,106,42,0.12); color: #111; font-size: 17px; font-weight: 700; text-decoration: none;
        }
        .doodlopend-kaart span { color: var(--primary); }
        .doodlopend-kaart:focus-visible { outline: 3px solid var(--primary); outline-offset: 2px; }
        @media (max-width: 900px) { .doodlopend-raster { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 640px) {
          .doodlopend-kop { padding: 100px 20px 80px; min-height: 240px; }
          .doodlopend-verder { padding: 24px 20px 80px; }
          .doodlopend-kaart { min-height: 56px; padding: 0 18px; font-size: 16px; }
        }
      `}</style>
    </>
  );
}
