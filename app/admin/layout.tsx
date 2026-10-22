import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "./_components/Sidebar";
import "./admin.css";

export const metadata = { title: "Admin — Popkoor Divers" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/leden/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (profile?.rol !== "admin") redirect("/leden");

  return (
    <div className="admin-shell">
      <Sidebar />
      <main className="adm-main">
        {children}
      </main>
    </div>
  );
}
