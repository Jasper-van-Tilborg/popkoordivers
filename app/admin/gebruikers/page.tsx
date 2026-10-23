import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import LedenClient from "./LedenClient";

export default async function LedenAdminPage({ searchParams }: { searchParams: Promise<{ id?: string; nieuw?: string }> }) {
  const { id, nieuw } = await searchParams;
  const supabase = await createClient();
  // Alleen voor admins; een redacteur gaat terug naar het overzicht
  const { data: { user: ik } } = await supabase.auth.getUser();
  const { data: mijnProfiel } = await supabase.from("profiles").select("rol").eq("id", ik?.id ?? "").single();
  if (mijnProfiel?.rol !== "admin") redirect("/admin");
  const [{ data: { user } }, { data: auth }, { data: profiles }] = await Promise.all([
    supabase.auth.getUser(),
    createAdminClient().auth.admin.listUsers({ perPage: 1000 }),
    supabase.from("profiles").select("id, naam, rol, stemgroep, in_smoelenboek"),
  ]);

  const perId = new Map((profiles ?? []).map((p) => [p.id, p]));
  const leden = (auth?.users ?? []).map((u) => {
    const p = perId.get(u.id);
    return {
      id: u.id,
      email: u.email ?? "",
      naam: p?.naam ?? null,
      rol: p?.rol ?? "lid",
      stemgroep: p?.stemgroep ?? null,
      in_smoelenboek: p?.in_smoelenboek ?? true,
      laatst_ingelogd: u.last_sign_in_at ?? null,
    };
  }).sort((a, b) => (a.naam ?? a.email).localeCompare(b.naam ?? b.email, "nl"));

  return <LedenClient leden={leden} eigenId={user?.id ?? ""} startId={nieuw !== undefined ? "nieuw" : id} />;
}
