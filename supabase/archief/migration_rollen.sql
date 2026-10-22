-- ================================================================
-- Popkoor Divers — Migratie: rollen & schrijfrechten
-- Voer dit uit als je het originele schema.sql al hebt gerund.
-- ================================================================


-- ----------------------------------------------------------------
-- 1. NIEUW ENUM TYPE
-- ----------------------------------------------------------------

CREATE TYPE user_rol AS ENUM ('lid', 'admin');


-- ----------------------------------------------------------------
-- 2. PROFILES TABEL
-- ----------------------------------------------------------------

CREATE TABLE profiles (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email      TEXT,
  rol        user_rol    NOT NULL DEFAULT 'lid',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ----------------------------------------------------------------
-- 3. HELPERFUNCTIE & TRIGGER
-- ----------------------------------------------------------------

-- Geeft de rol van de ingelogde gebruiker terug (gebruikt in RLS).
CREATE OR REPLACE FUNCTION get_user_rol()
RETURNS user_rol AS $$
  SELECT rol FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Maakt automatisch een profiel aan bij elke nieuwe gebruiker.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, rol)
  VALUES (NEW.id, NEW.email, 'lid');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Backfill: maak alsnog profielen aan voor bestaande gebruikers
-- (accounts aangemaakt vóór deze migratie).
INSERT INTO profiles (id, email, rol)
SELECT id, email, 'lid'
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;


-- ----------------------------------------------------------------
-- 4. RLS VOOR PROFILES
-- ----------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Gebruiker ziet zijn eigen profiel
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Admin ziet alle profielen
CREATE POLICY "profiles_select_admin"
  ON profiles FOR SELECT TO authenticated
  USING (get_user_rol() = 'admin');

-- Alleen admin mag rollen aanpassen
CREATE POLICY "profiles_update_admin"
  ON profiles FOR UPDATE TO authenticated
  USING (get_user_rol() = 'admin')
  WITH CHECK (get_user_rol() = 'admin');


-- ----------------------------------------------------------------
-- 5. ADMIN SCHRIJFRECHTEN OP BESTAANDE TABELLEN
-- (De SELECT-policies bestaan al uit het vorige schema.)
-- ----------------------------------------------------------------

CREATE POLICY "berichten_insert_admin"
  ON berichten FOR INSERT TO authenticated
  WITH CHECK (get_user_rol() = 'admin');

CREATE POLICY "berichten_update_admin"
  ON berichten FOR UPDATE TO authenticated
  USING (get_user_rol() = 'admin')
  WITH CHECK (get_user_rol() = 'admin');

CREATE POLICY "berichten_delete_admin"
  ON berichten FOR DELETE TO authenticated
  USING (get_user_rol() = 'admin');

-- liedjes
CREATE POLICY "liedjes_insert_admin"
  ON liedjes FOR INSERT TO authenticated
  WITH CHECK (get_user_rol() = 'admin');
CREATE POLICY "liedjes_update_admin"
  ON liedjes FOR UPDATE TO authenticated
  USING (get_user_rol() = 'admin');
CREATE POLICY "liedjes_delete_admin"
  ON liedjes FOR DELETE TO authenticated
  USING (get_user_rol() = 'admin');

-- nieuwsbrieven
CREATE POLICY "nieuwsbrieven_insert_admin"
  ON nieuwsbrieven FOR INSERT TO authenticated
  WITH CHECK (get_user_rol() = 'admin');
CREATE POLICY "nieuwsbrieven_update_admin"
  ON nieuwsbrieven FOR UPDATE TO authenticated
  USING (get_user_rol() = 'admin');
CREATE POLICY "nieuwsbrieven_delete_admin"
  ON nieuwsbrieven FOR DELETE TO authenticated
  USING (get_user_rol() = 'admin');

-- bestuur
CREATE POLICY "bestuur_insert_admin"
  ON bestuur FOR INSERT TO authenticated
  WITH CHECK (get_user_rol() = 'admin');
CREATE POLICY "bestuur_update_admin"
  ON bestuur FOR UPDATE TO authenticated
  USING (get_user_rol() = 'admin');
CREATE POLICY "bestuur_delete_admin"
  ON bestuur FOR DELETE TO authenticated
  USING (get_user_rol() = 'admin');

-- smoelenboek
CREATE POLICY "smoelenboek_insert_admin"
  ON smoelenboek FOR INSERT TO authenticated
  WITH CHECK (get_user_rol() = 'admin');
CREATE POLICY "smoelenboek_update_admin"
  ON smoelenboek FOR UPDATE TO authenticated
  USING (get_user_rol() = 'admin');
CREATE POLICY "smoelenboek_delete_admin"
  ON smoelenboek FOR DELETE TO authenticated
  USING (get_user_rol() = 'admin');

-- opnames
CREATE POLICY "opnames_insert_admin"
  ON opnames FOR INSERT TO authenticated
  WITH CHECK (get_user_rol() = 'admin');
CREATE POLICY "opnames_update_admin"
  ON opnames FOR UPDATE TO authenticated
  USING (get_user_rol() = 'admin');
CREATE POLICY "opnames_delete_admin"
  ON opnames FOR DELETE TO authenticated
  USING (get_user_rol() = 'admin');

-- choreo
CREATE POLICY "choreo_insert_admin"
  ON choreo FOR INSERT TO authenticated
  WITH CHECK (get_user_rol() = 'admin');
CREATE POLICY "choreo_update_admin"
  ON choreo FOR UPDATE TO authenticated
  USING (get_user_rol() = 'admin');
CREATE POLICY "choreo_delete_admin"
  ON choreo FOR DELETE TO authenticated
  USING (get_user_rol() = 'admin');

-- oude_optredens
CREATE POLICY "oude_optredens_insert_admin"
  ON oude_optredens FOR INSERT TO authenticated
  WITH CHECK (get_user_rol() = 'admin');
CREATE POLICY "oude_optredens_update_admin"
  ON oude_optredens FOR UPDATE TO authenticated
  USING (get_user_rol() = 'admin');
CREATE POLICY "oude_optredens_delete_admin"
  ON oude_optredens FOR DELETE TO authenticated
  USING (get_user_rol() = 'admin');


-- ----------------------------------------------------------------
-- 6. STORAGE — admin upload-rechten
-- (De SELECT-policies bestaan al uit het vorige schema.)
-- ----------------------------------------------------------------

CREATE POLICY "fotos_insert_admin"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'fotos' AND get_user_rol() = 'admin');

CREATE POLICY "nieuwsbrieven_insert_admin"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'nieuwsbrieven' AND get_user_rol() = 'admin');

CREATE POLICY "liedjes_insert_admin"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'liedjes' AND get_user_rol() = 'admin');

CREATE POLICY "media_insert_admin"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND get_user_rol() = 'admin');


-- ----------------------------------------------------------------
-- ROL WIJZIGEN
-- Voer dit uit voor de gebruiker die admin moet worden.
-- Vervang het e-mailadres door het juiste adres.
--
-- UPDATE profiles
-- SET rol = 'admin'
-- WHERE email = 'jasper.van.tilborg@ziggo.nl';
-- ----------------------------------------------------------------
