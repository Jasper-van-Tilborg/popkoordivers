"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/leden/login");
  const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single();
  if (profile?.rol !== "admin") redirect("/leden");
  return { supabase, adminClient: createAdminClient() };
}

export async function createUser(formData: FormData) {
  const { supabase, adminClient } = await assertAdmin();

  const email    = formData.get("email") as string;
  const password = formData.get("password") as string;
  const naam     = formData.get("naam") as string;
  const stemgroep = formData.get("stemgroep") as string;
  const rol      = (formData.get("rol") as string) || "lid";

  if (!email || !password) return { error: "E-mail en wachtwoord zijn verplicht." };

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) return { error: error.message };

  // Update the auto-created profile with naam, stemgroep, rol
  if (data.user) {
    await supabase.from("profiles").update({
      naam: naam || null,
      stemgroep: stemgroep || null,
      rol,
    }).eq("id", data.user.id);
  }

  revalidatePath("/admin/leden");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const { adminClient } = await assertAdmin();
  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };
  revalidatePath("/admin/leden");
  return { success: true };
}

export async function updateUserRol(userId: string, rol: string) {
  const { supabase } = await assertAdmin();
  await supabase.from("profiles").update({ rol }).eq("id", userId);
  revalidatePath("/admin/leden");
}
