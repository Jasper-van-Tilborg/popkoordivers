"use client";

import { AdminFout } from "./_fout/AdminFout";

export default function Fout({ error, retry }: { error: unknown; retry: () => void }) {
  return <AdminFout error={error} retry={retry} />;
}
