import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import LedenClient from "./LedenClient";

export default async function LedenAdminPage() {
  const supabase    = await createClient();
  const adminClient = createAdminClient();

  const [{ data: { users } }, { data: profiles }] = await Promise.all([
    adminClient.auth.admin.listUsers(),
    supabase.from("profiles").select("id, naam, rol, stemgroep"),
  ]);

  const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]));

  const leden = (users || []).map((u) => ({
    id:         u.id,
    email:      u.email ?? "",
    naam:       profileMap[u.id]?.naam ?? null,
    rol:        profileMap[u.id]?.rol ?? "lid",
    stemgroep:  profileMap[u.id]?.stemgroep ?? null,
    created_at: u.created_at,
  }));

  return <LedenClient leden={leden} />;
}
