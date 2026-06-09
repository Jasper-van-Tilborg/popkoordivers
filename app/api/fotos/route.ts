import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadFile, deleteFile, getPublicUrl } from "@/lib/r2";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single();
  return profile?.rol === "admin" ? { user, supabase } : null;
}

// GET: fotos voor een album (optioneel: alleen impressies)
export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const album_id = searchParams.get("album_id");
  const only_impressies = searchParams.get("impressies") === "true";

  if (!album_id) return NextResponse.json({ error: "album_id verplicht" }, { status: 400 });

  let query = auth.supabase
    .from("fotos")
    .select("id, r2_key, impressies, volgorde")
    .eq("album_id", album_id)
    .order("volgorde")
    .order("created_at");

  if (only_impressies) query = query.eq("impressies", true);

  const { data } = await query;

  return NextResponse.json(
    (data ?? []).map((f) => ({ ...f, url: getPublicUrl(f.r2_key) }))
  );
}

// POST: upload foto naar R2 + sla op in Supabase
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const album_id = form.get("album_id") as string | null;

  if (!file || !album_id)
    return NextResponse.json({ error: "Ontbrekende data" }, { status: 400 });

  const safeName = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
  const r2_key = `albums/${album_id}/${Date.now()}-${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await uploadFile(buffer, r2_key, file.type || "image/jpeg");

  const maxVolgorde = await auth.supabase
    .from("fotos")
    .select("volgorde")
    .eq("album_id", album_id)
    .order("volgorde", { ascending: false })
    .limit(1)
    .then(({ data }) => (data?.[0]?.volgorde ?? -1) + 1);

  const { data, error } = await auth.supabase
    .from("fotos")
    .insert({ album_id, r2_key, impressies: false, volgorde: maxVolgorde })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ...data, url: getPublicUrl(r2_key) });
}

// PATCH: toggle impressies flag
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { id, impressies } = await req.json();
  if (!id || impressies === undefined)
    return NextResponse.json({ error: "id en impressies verplicht" }, { status: 400 });

  await auth.supabase.from("fotos").update({ impressies }).eq("id", id);
  return NextResponse.json({ ok: true });
}

// DELETE: verwijder foto uit R2 + Supabase
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { id, r2_key } = await req.json();
  if (!id || !r2_key) return NextResponse.json({ error: "id en r2_key verplicht" }, { status: 400 });

  await deleteFile(r2_key);
  await auth.supabase.from("fotos").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
