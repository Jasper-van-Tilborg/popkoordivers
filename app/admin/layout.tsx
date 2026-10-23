import { redirect } from "next/navigation";
import { huidigeSessie, magBeheren } from "@/lib/auth";
import { inlognaam } from "@/lib/gebruikersnaam";
import Sidebar from "./_components/Sidebar";
import PaginaInhoud from "./_components/PaginaInhoud";
import "./admin.css";

export const metadata = { title: "Admin — Popkoor Divers" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sessie = await huidigeSessie();
  if (!sessie) redirect("/leden/login");
  if (!magBeheren(sessie.rol)) redirect("/leden");

  return (
    <div className="admin-shell">
      <Sidebar naam={sessie.naam} email={inlognaam(sessie.user.email)} rol={sessie.rol as "admin" | "redacteur"} />
      <main className="adm-main">
        <PaginaInhoud>{children}</PaginaInhoud>
      </main>
    </div>
  );
}
