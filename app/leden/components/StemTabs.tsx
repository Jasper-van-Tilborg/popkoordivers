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
      <div style={{ overflowX: "auto", marginBottom: "20px" }}>
        <div role="tablist" style={{ display: "inline-flex", gap: "4px", padding: "4px", background: "#F4F2EF", borderRadius: "14px" }}>
          {stemgroepen.map((stem) => {
            const isActive = active === stem;
            const aantal = (liedjes[stem] ?? []).length;
            return (
              <button
                key={stem}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(stem)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: isActive ? 700 : 500,
                  fontFamily: "inherit",
                  color: isActive ? "#111" : "#777",
                  background: isActive ? "#fff" : "transparent",
                  border: "none",
                  borderRadius: "10px",
                  boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.08), 0 1px 1px rgba(0,0,0,0.04)" : "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
                }}
              >
                {stem}
                {aantal > 0 && (
                  <span style={{ fontSize: "11px", fontWeight: 700, color: isActive ? "var(--primary)" : "#aaa" }}>{aantal}</span>
                )}
              </button>
            );
          })}
        </div>
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
