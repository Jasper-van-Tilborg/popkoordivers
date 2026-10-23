import type { ReactNode } from "react";

// Iconen voor de zijbalk en het overzicht, in dezelfde lijnstijl als components/icons.
const svg = (pad: ReactNode) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{pad}</svg>
);
export const IconHome     = () => svg(<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />);
export const IconMuziek   = () => svg(<><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></>);
export const IconPost     = () => svg(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>);
export const IconStukken  = () => svg(<><path d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1Z" /><path d="M16 5h2a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h2" /><path d="M9 12h6M9 16h4" /></>);
export const IconMicro    = () => svg(<><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>);
export const IconDans     = () => svg(<><circle cx="13" cy="4" r="2" /><path d="m7 21 3-6 3 2 2 4M10 15l1-6 4 2 3-2M11 9 7 10l-2 3" /></>);
export const IconLogboek  = () => svg(<><path d="M12 8v4l3 2" /><path d="M3.05 11a9 9 0 1 1 .5 4" /><path d="M3 4v5h5" /></>);
export const IconHartslag = () => svg(<path d="M3 12h4l2-5 4 10 2-5h6" />);
