"use client";

import { useState } from "react";

const stemgroepen = ["Alt", "Mezzo", "Sopraan", "Tenor", "Bas"] as const;
type Stemgroep = (typeof stemgroepen)[number];

interface Lied {
  titel: string;
  componist?: string | null;
  pdf_url?: string | null;
}

interface Props {
  liedjes: Record<string, Lied[]>;
}

export default function StemTabs({ liedjes }: Props) {
  const [active, setActive] = useState<Stemgroep>("Alt");
  const huidigeLiedjes = liedjes[active] ?? [];

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "2px solid rgba(0,0,0,0.08)", marginBottom: "28px", overflowX: "auto" }}>
        {stemgroepen.map((stem) => (
          <button
            key={stem}
            onClick={() => setActive(stem)}
            style={{
              padding: "10px 22px",
              fontSize: "14px",
              fontWeight: active === stem ? 700 : 500,
              color: active === stem ? "var(--primary)" : "#888",
              background: "none",
              border: "none",
              borderBottom: active === stem ? "2px solid var(--primary)" : "2px solid transparent",
              marginBottom: "-2px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "color 0.15s",
            }}
          >
            {stem}
          </button>
        ))}
      </div>

      {/* Song list */}
      {huidigeLiedjes.length === 0 ? (
        <p style={{ fontSize: "14px", color: "#aaa", padding: "16px 0" }}>Nog geen liedjes toegevoegd.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {huidigeLiedjes.map((lied, i) => (
            <div
              key={lied.titel}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 0",
                borderBottom: i < huidigeLiedjes.length - 1 ? "1px solid rgba(0,0,0,0.07)" : "none",
                gap: "16px",
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#111" }}>{lied.titel}</p>
                {lied.componist && (
                  <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#888" }}>{lied.componist}</p>
                )}
              </div>
              {lied.pdf_url ? (
                <a
                  href={lied.pdf_url}
                  download
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(243,106,42,0.08)",
                    color: "var(--primary)",
                    fontWeight: 700,
                    fontSize: "12px",
                    padding: "8px 16px",
                    borderRadius: "35px",
                    textDecoration: "none",
                    border: "1.5px solid rgba(243,106,42,0.2)",
                    whiteSpace: "nowrap",
                  }}
                >
                  PDF ↓
                </a>
              ) : (
                <span style={{ fontSize: "12px", color: "#ccc", whiteSpace: "nowrap" }}>Binnenkort</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
