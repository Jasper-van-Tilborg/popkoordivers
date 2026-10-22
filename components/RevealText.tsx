"use client";

import { useEffect, useState, CSSProperties } from "react";

interface Props {
  text: string;
  pageDelay?: number;
  as?: "h1" | "h2" | "h3";
  style?: CSSProperties;
}

export default function RevealText({ text, pageDelay = 0, as: Tag = "h2", style }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), pageDelay);
    return () => clearTimeout(t);
  }, [pageDelay]);

  return (
    <Tag style={style}>
      {text.split(" ").map((word, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            marginRight: "0.28em",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
            filter: visible ? "none" : "blur(6px)",
            transition: `opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${i * 50}ms, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${i * 50}ms, filter 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${i * 50}ms`,
          }}
        >
          {word}
        </span>
      ))}
    </Tag>
  );
}
