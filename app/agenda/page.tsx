import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import AgendaClient from "./AgendaClient";

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const [{ data: komend }, { data: archief }] = await Promise.all([
    supabase
      .from("agenda")
      .select("id, titel, datum, datum_sorteer, tijd, locatie, label, label_kleur, beschrijving, link, fotos_url")
      .eq("gepubliceerd", true)
      .or(`datum_sorteer.is.null,datum_sorteer.gte.${today}`)
      .order("datum_sorteer", { ascending: true, nullsFirst: false }),
    supabase
      .from("agenda")
      .select("id, titel, datum, datum_sorteer, tijd, locatie, label, label_kleur, beschrijving, link, fotos_url")
      .eq("gepubliceerd", true)
      .lt("datum_sorteer", today)
      .order("datum_sorteer", { ascending: false }),
  ]);

  return (
    <AgendaClient
      komend={komend ?? []}
      archief={archief ?? []}
    />
  );
}
