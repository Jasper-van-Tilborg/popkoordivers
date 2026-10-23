"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/database.types";

type Stemgroep = Database["public"]["Enums"]["stemgroep_type"];
type Rol = Database["public"]["Enums"]["user_rol"];

export interface LidInput {
  naam: string;
  email: string;
  stemgroep: Stemgroep | null;
  rol: Rol;
  bestuursfunctie: string;
  in_smoelenboek: boolean;
}

function vernieuw() {
  revalidatePath("/admin/leden");
  revalidatePath("/leden");
}

const profiel = (input: LidInput) => ({
  naam: input.naam.trim() || null,
  email: input.email.trim().toLowerCase(),
  stemgroep: input.stemgroep,
  rol: input.rol,
  bestuursfunctie: input.bestuursfunctie.trim() || null,
  in_smoelenboek: input.in_smoelenboek,
});

export async function maakLid(input: LidInput, wachtwoord: string) {
  const { supabase } = await requireAdmin();
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

  vernieuw();
  return { id: data.user.id };
}

export async function wijzigLid(id: string, input: LidInput) {
  const { supabase, user } = await requireAdmin();
  if (!input.naam.trim() || !/^\S+@\S+\.\S+$/.test(input.email.trim())) return { error: "Naam en een geldig e-mailadres zijn verplicht." };
  if (id === user.id && input.rol !== "admin") return { error: "Je kunt jezelf geen beheerder-rechten afnemen." };

  const admin = createAdminClient();
  const { data: huidig } = await admin.auth.admin.getUserById(id);
  if (huidig.user && huidig.user.email !== input.email.trim().toLowerCase()) {
    const { error } = await admin.auth.admin.updateUserById(id, { email: input.email.trim().toLowerCase(), email_confirm: true });
    if (error) return { error: error.message };
  }

  const { error } = await supabase.from("profiles").update(profiel(input)).eq("id", id);
  if (error) return { error: error.message };
  vernieuw();
  return {};
}

export async function zetWachtwoord(id: string, wachtwoord: string) {
  await requireAdmin();
  if (wachtwoord.length < 8) return { error: "Het wachtwoord moet minstens 8 tekens hebben." };
  const { error } = await createAdminClient().auth.admin.updateUserById(id, { password: wachtwoord });
  if (error) return { error: error.message };
  return {};
}

export async function verwijderLid(id: string) {
  const { user } = await requireAdmin();
  if (id === user.id) return { error: "Je kunt je eigen account niet verwijderen." };
  const { error } = await createAdminClient().auth.admin.deleteUser(id); // profiel gaat mee (cascade)
  if (error) return { error: error.message };
  vernieuw();
  return {};
}
