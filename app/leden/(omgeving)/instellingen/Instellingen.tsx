"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { WEERGAVE_COOKIE, type Weergave } from "../weergave";

export default function Instellingen({ weergave, account, beheer }: {
  weergave: Weergave;
  account: { naam: string | null; stemgroep: string | null; inlog: string };
  beheer: boolean;
}) {
  const router = useRouter();
  const [groot, setGroot] = useState(weergave === "groot");
  const [bezig, setBezig] = useState(false);

  function zetGroot(aan: boolean) {
    setGroot(aan);
    const w: Weergave = aan ? "groot" : "normaal";
    document.cookie = `${WEERGAVE_COOKIE}=${w}; path=/leden; max-age=31536000; samesite=lax`;
    // Meteen zichtbaar; bij de volgende pagina zet de server het zelf zo
    document.querySelector(".leden-weergave")?.setAttribute("data-weergave", w);
  }

  async function uitloggen() {
    setBezig(true);
    await createClient().auth.signOut();
    router.replace("/leden/login");
    router.refresh();
  }

  return (
    <div className="leden-instellingen">
      <section className="leden-kaart">
        <h2 className="leden-kaart-titel">Weergave</h2>
        <div className="leden-instelling">
          <span id="inst-groot" className="leden-instelling-naam">Grote letters en knoppen</span>
          <button
            type="button"
            role="switch"
            aria-checked={groot}
            aria-labelledby="inst-groot"
            className="leden-schakelaar"
            onClick={() => zetGroot(!groot)}
          >
            <span className="leden-schakelaar-bol" />
          </button>
        </div>
      </section>

      <section className="leden-kaart">
        <h2 className="leden-kaart-titel">Account</h2>
        <dl className="leden-gegevens">
          <div><dt>Naam</dt><dd>{account.naam ?? "Onbekend"}</dd></div>
          <div><dt>Stemgroep</dt><dd>{account.stemgroep ?? "Geen"}</dd></div>
          <div><dt>Inloggen met</dt><dd>{account.inlog}</dd></div>
        </dl>
        <div className="leden-instelling-knoppen">
          {beheer && <Link href="/admin" className="ln-knop ln-knop--rand">Naar de admin</Link>}
          <button type="button" className="ln-knop ln-knop--donker" onClick={uitloggen} disabled={bezig}>
            {bezig ? "Uitloggen…" : "Uitloggen"}
          </button>
        </div>
      </section>
    </div>
  );
}
