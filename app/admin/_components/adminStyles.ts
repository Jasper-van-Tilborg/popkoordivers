import type { CSSProperties } from "react";

export const btnPrimary: CSSProperties = {
  background: "var(--primary)", color: "#fff", border: "none",
  borderRadius: "8px", padding: "9px 18px", fontSize: "13px",
  fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
};
export const btnOutline: CSSProperties = {
  background: "none", color: "#555", border: "1.5px solid rgba(0,0,0,0.15)",
  borderRadius: "8px", padding: "7px 14px", fontSize: "13px",
  fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
};
export const btnDanger: CSSProperties = {
  background: "none", color: "#dc2626", border: "1px solid rgba(220,38,38,0.25)",
  borderRadius: "6px", padding: "5px 10px", fontSize: "12px",
  fontWeight: 600, cursor: "pointer",
};
export const btnEdit: CSSProperties = {
  background: "none", color: "#555", border: "1px solid rgba(0,0,0,0.15)",
  borderRadius: "6px", padding: "5px 10px", fontSize: "12px",
  fontWeight: 600, cursor: "pointer",
};
export const inputStyle: CSSProperties = {
  width: "100%", padding: "9px 12px", fontSize: "14px",
  border: "1.5px solid rgba(0,0,0,0.12)", borderRadius: "8px",
  outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  background: "#FAFAFA", color: "#111",
};
export const labelStyle: CSSProperties = {
  display: "block", fontSize: "12px", fontWeight: 700,
  color: "#444", marginBottom: "6px",
};
export const thStyle: CSSProperties = {
  padding: "10px 16px", fontSize: "11px", fontWeight: 700,
  color: "#888", textTransform: "uppercase", letterSpacing: "0.06em",
  textAlign: "left", borderBottom: "1px solid rgba(0,0,0,0.08)",
  background: "#FAFAFA", whiteSpace: "nowrap",
};
export const tdStyle: CSSProperties = {
  padding: "12px 16px", fontSize: "14px", color: "#333",
  borderBottom: "1px solid rgba(0,0,0,0.06)", verticalAlign: "middle",
};
