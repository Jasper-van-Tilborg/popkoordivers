"use client";

import { useEffect, useRef, CSSProperties } from "react";

interface Props {
  text: string;
  /** Extra wachttijd in ms nadat de kop in beeld komt */
  delay?: number;
  as?: "h1" | "h2" | "h3";
  style?: CSSProperties;
}

// Kop die woord voor woord binnenkomt (stijl in globals.css, "reveal-tekst").
// Een h1 staat altijd bovenaan: die begint meteen met CSS, zonder op JavaScript
// te wachten. Andere koppen beginnen pas als je ze in beeld scrolt.
export default function RevealText({ text, delay = 0, as: Tag = "h2", style }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);
  const direct = Tag === "h1";

  useEffect(() => {
    const el = ref.current;
    if (direct || !el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("in-view");
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [direct]);

  return (
    <Tag ref={ref} className={direct ? "reveal-tekst in-view" : "reveal-tekst"} style={style}>
      {text.split(" ").map((word, i) => (
        <span key={i} style={{ animationDelay: `${delay + i * 50}ms` }}>
          {word}
        </span>
      ))}
    </Tag>
  );
}
