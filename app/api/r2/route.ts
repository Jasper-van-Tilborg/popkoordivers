import { NextRequest, NextResponse } from "next/server";
import { uploadFile, deleteFile, getPublicUrl } from "@/lib/r2";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();
  return profile?.rol === "admin" ? user : null;
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const key = form.get("key") as string | null;
  if (!file || !key) return NextResponse.json({ error: "Ontbrekende data" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  await uploadFile(buffer, key, file.type || "application/octet-stream");

  return NextResponse.json({ key, url: getPublicUrl(key) });
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { key } = await req.json();
  if (!key) return NextResponse.json({ error: "Geen key opgegeven" }, { status: 400 });

  await deleteFile(key);
  return NextResponse.json({ ok: true });
}
