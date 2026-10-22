import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import LedenClient from "./LedenClient";

export default async function LedenAdminPage() {
  const supabase = await createClient();
  const [{ data: { user } }, { data: auth }, { data: profiles }] = await Promise.all([
    supabase.auth.getUser(),
    createAdminClient().auth.admin.listUsers({ perPage: 1000 }),
    supabase.from("profiles").select("id, naam, rol, stemgroep, bestuursfunctie, in_smoelenboek"),
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
      bestuursfunctie: p?.bestuursfunctie ?? null,
      in_smoelenboek: p?.in_smoelenboek ?? true,
      laatst_ingelogd: u.last_sign_in_at ?? null,
    };
  }).sort((a, b) => (a.naam ?? a.email).localeCompare(b.naam ?? b.email, "nl"));

  return <LedenClient leden={leden} eigenId={user?.id ?? ""} />;
}
