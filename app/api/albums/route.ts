import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteFile } from "@/lib/r2";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single();
  return profile?.rol === "admin" ? { user, supabase } : null;
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { data: albums } = await auth.supabase
    .from("albums")
    .select("id, slug, titel, datum, volgorde")
    .order("created_at", { ascending: false });

  // Counts per album
  const { data: counts } = await auth.supabase
    .from("fotos")
    .select("album_id, impressies");

  const totaal: Record<string, number> = {};
  const impressies: Record<string, number> = {};
  for (const f of counts ?? []) {
    totaal[f.album_id] = (totaal[f.album_id] ?? 0) + 1;
    if (f.impressies) impressies[f.album_id] = (impressies[f.album_id] ?? 0) + 1;
  }

  return NextResponse.json(
    (albums ?? []).map((a) => ({
      ...a,
      totaal_fotos: totaal[a.id] ?? 0,
      impressies_fotos: impressies[a.id] ?? 0,
    }))
  );
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { titel, datum } = await req.json();
  if (!titel?.trim() || !datum?.trim())
    return NextResponse.json({ error: "Titel en datum zijn verplicht" }, { status: 400 });

  const slug = titel.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    + "-" + datum.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

  const { data, error } = await auth.supabase
    .from("albums")
    .insert({ titel: titel.trim(), datum: datum.trim(), slug })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Geen id" }, { status: 400 });

  // Delete all R2 files for this album first
  const { data: fotos } = await auth.supabase
    .from("fotos")
    .select("r2_key")
    .eq("album_id", id);

  await Promise.allSettled((fotos ?? []).map((f) => deleteFile(f.r2_key)));

  await auth.supabase.from("albums").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
