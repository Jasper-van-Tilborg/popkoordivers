"use client";

import { useEffect, useRef, CSSProperties } from "react";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  style?: CSSProperties;
  className?: string;
  /** Bovenaan de pagina: meteen met CSS binnenkomen, zonder op JavaScript te wachten */
  direct?: boolean;
}

export default function Reveal({ children, delay = 0, style, className = "", direct = false }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

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
      // Zodra de bovenrand 40px in beeld is, ook bij secties die hoger zijn dan het scherm
      { threshold: 0, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [direct]);

  return (
    <div
      ref={ref}
      className={`reveal${direct ? " in-view" : ""} ${className}`.trim()}
      style={{ animationDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}
