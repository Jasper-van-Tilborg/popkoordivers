"use client";

import { LedenFout } from "./_fout/LedenFout";

export default function Fout({ error, retry }: { error: unknown; retry: () => void }) {
  return <LedenFout error={error} retry={retry} />;
}
