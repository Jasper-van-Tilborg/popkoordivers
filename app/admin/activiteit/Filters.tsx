"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Tabs } from "../_components/ui";
import { Keuze } from "../_components/velden";

// Soort als tabbladen, persoon als keuzelijst. Beide staan in de url, zodat de
// server de juiste regels ophaalt.
export default function Filters({ soort, wie, soorten, personen }: {
  soort: string;
  wie: string;
  soorten: { id: string; label: string }[];
  personen: [string, string][];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [tab, setTab] = useState(soort || "alles");
  const [persoon, setPersoon] = useState(wie);

  function ga(nieuw: { soort?: string; wie?: string }) {
    const p = { soort: tab === "alles" ? "" : tab, wie: persoon, ...nieuw };
    const s = new URLSearchParams(Object.entries(p).filter(([, v]) => v) as [string, string][]).toString();
    startTransition(() => router.push(`/admin/activiteit${s ? `?${s}` : ""}`, { scroll: false }));
  }

  return (
    <div className="adm-toolbar">
      <Tabs
        label="Soort"
        value={tab}
        onChange={(v) => { setTab(v); ga({ soort: v === "alles" ? "" : v }); }}
        items={soorten.map((f) => ({ id: f.id || "alles", label: f.label }))}
      />
      {personen.length > 1 && (
        <div className="adm-toolbar-keuze">
          <Keuze
            value={persoon}
            onChange={(v) => { setPersoon(v); ga({ wie: v }); }}
            opties={[{ value: "", label: "Iedereen" }, ...personen.map(([id, naam]) => ({ value: id, label: naam }))]}
          />
        </div>
      )}
    </div>
  );
}
