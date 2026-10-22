-- ── Media tabel ──────────────────────────────────────────────────────────
-- Foto's (Supabase Storage URL) en YouTube video's in één tabel.

CREATE TABLE IF NOT EXISTS media (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type         TEXT NOT NULL CHECK (type IN ('foto', 'video')),
  url          TEXT NOT NULL,   -- Storage public URL (foto) of YouTube URL (video)
  label        TEXT NOT NULL,
  datum        TEXT,
  volgorde     INT  NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read media"
  ON media FOR SELECT USING (true);

CREATE POLICY "Admin manage media"
  ON media FOR ALL USING (get_user_rol() = 'admin');

-- Storage bucket voor foto's (als nog niet aangemaakt)
INSERT INTO storage.buckets (id, name, public)
  VALUES ('fotos', 'fotos', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY IF NOT EXISTS "Public read fotos bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'fotos');

CREATE POLICY IF NOT EXISTS "Admin upload fotos bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'fotos' AND get_user_rol() = 'admin');

CREATE POLICY IF NOT EXISTS "Admin delete fotos bucket"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'fotos' AND get_user_rol() = 'admin');
