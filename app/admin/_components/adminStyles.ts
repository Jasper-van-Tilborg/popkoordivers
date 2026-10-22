import type { CSSProperties } from "react";

export const btnPrimary: CSSProperties = {
  background: "var(--primary)", color: "#fff", border: "none",
  borderRadius: "10px", padding: "9px 18px", fontSize: "13px",
  fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
  boxShadow: "0 1px 2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.18)",
};
export const btnOutline: CSSProperties = {
  background: "#fff", color: "#444", border: "1px solid rgba(0,0,0,0.12)",
  borderRadius: "10px", padding: "8px 14px", fontSize: "13px",
  fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};
export const btnDanger: CSSProperties = {
  background: "rgba(220,38,38,0.06)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.18)",
  borderRadius: "8px", padding: "5px 10px", fontSize: "12px",
  fontWeight: 600, cursor: "pointer",
};
export const btnEdit: CSSProperties = {
  background: "#fff", color: "#444", border: "1px solid rgba(0,0,0,0.12)",
  borderRadius: "8px", padding: "5px 10px", fontSize: "12px",
  fontWeight: 600, cursor: "pointer",
};
export const inputStyle: CSSProperties = {
  width: "100%", padding: "9px 12px", fontSize: "14px",
  border: "1px solid rgba(0,0,0,0.12)", borderRadius: "10px",
  outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  background: "#fff", color: "#111",
  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
};
export const labelStyle: CSSProperties = {
  display: "block", fontSize: "12px", fontWeight: 600,
  color: "#555", marginBottom: "6px",
};
export const thStyle: CSSProperties = {
  padding: "10px 16px", fontSize: "11px", fontWeight: 600,
  color: "#999", textTransform: "uppercase", letterSpacing: "0.06em",
  textAlign: "left", borderBottom: "1px solid rgba(0,0,0,0.06)",
  background: "#FBFAF8", whiteSpace: "nowrap",
};
export const tdStyle: CSSProperties = {
  padding: "13px 16px", fontSize: "14px", color: "#333",
  borderBottom: "1px solid rgba(0,0,0,0.05)", verticalAlign: "middle",
};
