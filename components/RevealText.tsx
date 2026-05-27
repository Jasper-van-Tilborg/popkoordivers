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
            transition: `opacity 0.5s ease ${i * 50}ms, transform 0.5s ease ${i * 50}ms`,
          }}
        >
          {word}
        </span>
      ))}
    </Tag>
  );
}
