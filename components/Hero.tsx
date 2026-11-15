"use client";

import Link from "next/link";
import Image from "next/image";
import heroFoto from "@/public/herosection_image.jpg";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import { useSocials } from "@/components/InstellingenProvider";

export default function Hero() {
  const socials = useSocials(18);
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Foto over de hele hero, ook achter de golf. next/image levert een telefoon
          een kleine versie, en de foto laadt vóór de rest. */}
      <Image
        src={heroFoto}
        alt=""
        aria-hidden="true"
        fill
        preload
        sizes="100vw"
        placeholder="blur"
        style={{ objectFit: "cover", objectPosition: "center 0%" }}
      />

      {/* Gradient overlay — donker achter de tekst, lichter naar onderen zodat de foto meer spreekt */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 70% 55% at 50% 35%, rgba(0,0,0,0.35) 0%, transparent 100%), linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.30) 55%, rgba(0,0,0,0.45) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Main content — exactly 100svh tall, wave follows below */}
      <div style={{ minHeight: "100svh", padding: "0 24px", display: "flex", flexDirection: "column", position: "relative", zIndex: 10 }}>
        <div
          className="hero-content"
          style={{
            flex: 1,
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
            padding: "220px 0 60px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <Reveal direct>
            <div style={{ maxWidth: "680px", textAlign: "center" }}>
              {/* Headline */}
              <RevealText
                text="Swingend Popkoor uit Gilze"
                as="h1"
                style={{ fontSize: "clamp(40px, 6vw, 76px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-2.5px", color: "#FFFFFF", margin: "0 0 20px" }}
              />

              {/* Subheadline */}
              <p
                style={{
                  fontSize: "clamp(15px, 1.6vw, 17px)",
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.82)",
                  margin: "0 auto 36px",
                  maxWidth: "460px",
                }}
              >
                Passie voor zingen brengt mensen bij elkaar.
              </p>

              {/* CTAs */}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                <Link href="/contact#meezingen" className="hero-knop hero-knop--meezingen">
                  Kom meezingen →
                </Link>
                <Link href="/agenda" className="hero-knop hero-knop--agenda">
                  Waar kun je ons zien
                </Link>
              </div>

              {/* Social media */}
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginTop: "28px" }}>
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="hero-social"
                    style={{ color: s.color, "--merk": s.color } as React.CSSProperties}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Wave into white — in document flow, starts after 100svh */}
      <div aria-hidden="true" style={{ position: "relative", lineHeight: 0, zIndex: 10 }}>
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "80px" }}>
          <path d="M0,80 L0,40 Q360,0 720,32 Q1080,64 1440,20 L1440,80 Z" fill="#FFFFFF" />
        </svg>
      </div>

      <style>{`
        .hero-social {
          display: inline-flex; align-items: center; justify-content: center;
          width: 46px; height: 46px; border-radius: 50%;
          background: #fff; border: 1.5px solid #fff;
          transition: border-color 0.15s, transform 0.12s var(--ease-out);
        }
        @media (hover: hover) {
          .hero-social:hover { border-color: var(--merk); transform: translateY(-2px); }
        }
        .hero-social:active { transform: scale(0.96); transition-duration: 0.1s; }

        @media (max-width: 768px) {
          .hero-content { padding-top: 140px !important; }
        }
      `}</style>
    </section>
  );
}
