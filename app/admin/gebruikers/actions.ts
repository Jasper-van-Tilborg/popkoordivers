"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { logActiviteit } from "@/lib/activiteit";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/database.types";

type Stemgroep = Database["public"]["Enums"]["stemgroep_type"];
type Rol = Database["public"]["Enums"]["user_rol"];

export interface LidInput {
  naam: string;
  email: string;
  stemgroep: Stemgroep | null;
  rol: Rol;
  in_smoelenboek: boolean;
}

const rolNaam: Record<Rol, string> = { lid: "lid", redacteur: "redacteur", admin: "beheerder" };

function vernieuw() {
  revalidatePath("/admin/gebruikers");
  revalidatePath("/leden", "layout");
}

const profiel = (input: LidInput) => ({
  naam: input.naam.trim() || null,
  email: input.email.trim().toLowerCase(),
  stemgroep: input.stemgroep,
  rol: input.rol,
  in_smoelenboek: input.in_smoelenboek,
});

export async function maakLid(input: LidInput, wachtwoord: string) {
  const sessie = await requireAdmin();
  const { supabase } = sessie;
  if (!input.naam.trim() || !/^\S+@\S+\.\S+$/.test(input.email.trim())) return { error: "Naam en een geldig e-mailadres zijn verplicht." };
  if (wachtwoord.length < 8) return { error: "Het wachtwoord moet minstens 8 tekens hebben." };

  const { data, error } = await createAdminClient().auth.admin.createUser({
    email: input.email.trim().toLowerCase(),
    password: wachtwoord,
    email_confirm: true,
  });
  if (error) return { error: error.message.includes("already") ? "Er bestaat al een account met dit e-mailadres." : error.message };

  // Het profiel is door de database-trigger aangemaakt; nu aanvullen.
  const { error: pErr } = await supabase.from("profiles").update(profiel(input)).eq("id", data.user.id);
  if (pErr) return { error: pErr.message };

  await logActiviteit(sessie, `aangemaakt als ${rolNaam[input.rol]}`, "lid", { id: data.user.id, naam: input.naam.trim() });
  vernieuw();
  return { id: data.user.id };
}

export async function wijzigLid(id: string, input: LidInput) {
  const sessie = await requireAdmin();
  const { supabase, user } = sessie;
  if (!input.naam.trim() || !/^\S+@\S+\.\S+$/.test(input.email.trim())) return { error: "Naam en een geldig e-mailadres zijn verplicht." };
  if (id === user.id && input.rol !== "admin") return { error: "Je kunt jezelf geen beheerder-rechten afnemen." };
  const { data: vorig } = await supabase.from("profiles").select("rol").eq("id", id).single();

  const admin = createAdminClient();
  const { data: huidig } = await admin.auth.admin.getUserById(id);
  if (huidig.user && huidig.user.email !== input.email.trim().toLowerCase()) {
    const { error } = await admin.auth.admin.updateUserById(id, { email: input.email.trim().toLowerCase(), email_confirm: true });
    if (error) return { error: error.message };
  }

  const { error } = await supabase.from("profiles").update(profiel(input)).eq("id", id);
  if (error) return { error: error.message };
  const rolGewijzigd = vorig && vorig.rol !== input.rol;
  await logActiviteit(sessie, rolGewijzigd ? `gewijzigd, nu ${rolNaam[input.rol]}` : "gewijzigd", "lid", { id, naam: input.naam.trim() });
  vernieuw();
  return {};
}

export async function zetWachtwoord(id: string, wachtwoord: string) {
  const sessie = await requireAdmin();
  if (wachtwoord.length < 8) return { error: "Het wachtwoord moet minstens 8 tekens hebben." };
  const { error } = await createAdminClient().auth.admin.updateUserById(id, { password: wachtwoord });
  if (error) return { error: error.message };
  const { data: lid } = await sessie.supabase.from("profiles").select("naam, email").eq("id", id).single();
  await logActiviteit(sessie, "nieuw wachtwoord", "lid", { id, naam: lid?.naam ?? lid?.email });
  return {};
}

export async function verwijderLid(id: string) {
  const sessie = await requireAdmin();
  const { user } = sessie;
  if (id === user.id) return { error: "Je kunt je eigen account niet verwijderen." };
  const { data: lid } = await sessie.supabase.from("profiles").select("naam, email").eq("id", id).single();
  const { error } = await createAdminClient().auth.admin.deleteUser(id); // profiel gaat mee (cascade)
  if (error) return { error: error.message };
  await logActiviteit(sessie, "verwijderd", "lid", { id, naam: lid?.naam ?? lid?.email });
  vernieuw();
  return {};
}
