import { redirect } from "next/navigation";
import { huidigeSessie } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { inlognaam } from "@/lib/gebruikersnaam";
import LedenClient from "./LedenClient";

export default async function LedenAdminPage({ searchParams }: { searchParams: Promise<{ id?: string; nieuw?: string }> }) {
  const { id, nieuw } = await searchParams;
  // Alleen voor admins; een redacteur gaat terug naar het overzicht
  const ik = await huidigeSessie();
  if (ik?.rol !== "admin") redirect("/admin");
  const { supabase } = ik;
  const [{ data: auth }, { data: profiles }] = await Promise.all([
    createAdminClient().auth.admin.listUsers({ perPage: 1000 }),
    supabase.from("profiles").select("id, naam, rol, stemgroep, in_smoelenboek"),
  ]);

  const perId = new Map((profiles ?? []).map((p) => [p.id, p]));
  const leden = (auth?.users ?? []).map((u) => {
    const p = perId.get(u.id);
    return {
      id: u.id,
      email: inlognaam(u.email),   // e-mailadres of gebruikersnaam
      naam: p?.naam ?? null,
      rol: p?.rol ?? "lid",
      stemgroep: p?.stemgroep ?? null,
      in_smoelenboek: p?.in_smoelenboek ?? true,
      laatst_ingelogd: u.last_sign_in_at ?? null,
    };
  }).sort((a, b) => (a.naam ?? a.email).localeCompare(b.naam ?? b.email, "nl"));

  return <LedenClient leden={leden} eigenId={ik.user.id} startId={nieuw !== undefined ? "nieuw" : id} />;
}
