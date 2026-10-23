import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { inlognaam } from "@/lib/gebruikersnaam";
import Sidebar from "./_components/Sidebar";
import PaginaInhoud from "./_components/PaginaInhoud";
import "./admin.css";

export const metadata = { title: "Admin — Popkoor Divers" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/leden/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol, naam")
    .eq("id", user.id)
    .single();

  if (profile?.rol !== "admin" && profile?.rol !== "redacteur") redirect("/leden");

  return (
    <div className="admin-shell">
      <Sidebar naam={profile.naam ?? null} email={inlognaam(user.email)} rol={profile.rol} />
      <main className="adm-main">
        <PaginaInhoud>{children}</PaginaInhoud>
      </main>
    </div>
  );
}
