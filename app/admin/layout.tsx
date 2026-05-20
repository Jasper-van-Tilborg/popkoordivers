import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "./_components/Sidebar";

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
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "var(--font-manrope), system-ui, sans-serif" }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: "auto", background: "#F5F5F5" }}>
        {children}
      </main>
    </div>
  );
}
