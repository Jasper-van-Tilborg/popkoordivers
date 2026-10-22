-- ── Policies op Supabase Storage (bestanden staan op R2)
DROP POLICY IF EXISTS "fotos_select_public"          ON storage.objects;
DROP POLICY IF EXISTS "fotos_insert_admin"           ON storage.objects;
DROP POLICY IF EXISTS "nieuwsbrieven_select_auth"    ON storage.objects;
DROP POLICY IF EXISTS "nieuwsbrieven_insert_admin"   ON storage.objects;
DROP POLICY IF EXISTS "liedjes_select_auth"          ON storage.objects;
DROP POLICY IF EXISTS "liedjes_insert_admin"         ON storage.objects;
DROP POLICY IF EXISTS "media_select_auth"            ON storage.objects;
DROP POLICY IF EXISTS "media_insert_admin"           ON storage.objects;
