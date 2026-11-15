"use client";

import { useEffect, useTransition } from "react";

// "Probeer opnieuw": laadt alleen het stuk dat misging opnieuw en toont meteen dat het bezig is.
export default function Opnieuw({ error, retry, className }: { error: unknown; retry: () => void; className: string }) {
  const [bezig, start] = useTransition();
  useEffect(() => { console.error(error); }, [error]);
  return (
    <button type="button" className={className} aria-busy={bezig || undefined} disabled={bezig} onClick={() => start(() => retry())}>
      {bezig && <span className="doodlopend-draai" aria-hidden="true" />}
      {bezig ? "Bezig…" : "Probeer opnieuw"}
    </button>
  );
}
