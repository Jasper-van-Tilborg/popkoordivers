-- ================================================================
-- Popkoor Divers — Migratie: admin dashboard tabellen
-- Voer dit uit na migration_rollen.sql
-- ================================================================

-- Naam en stemgroep toevoegen aan profiles (voor ledenadministratie)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS naam TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stemgroep stemgroep_type;

-- Agenda (publiek leesbaar, admin schrijft)
CREATE TABLE agenda (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titel        TEXT    NOT NULL,
  datum        TEXT    NOT NULL,    -- bijv. "7 november 2026"
  tijd         TEXT,                -- bijv. "20:00" of "hele dag"
  locatie      TEXT,
  label        TEXT,                -- bijv. "Eerstvolgend", "Festival"
  label_kleur  TEXT DEFAULT '#F36A2A',
  beschrijving TEXT,
  link         TEXT,
  gepubliceerd BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agenda_select_public"
  ON agenda FOR SELECT USING (gepubliceerd = true);
CREATE POLICY "agenda_insert_admin"
  ON agenda FOR INSERT TO authenticated WITH CHECK (get_user_rol() = 'admin');
CREATE POLICY "agenda_update_admin"
  ON agenda FOR UPDATE TO authenticated USING (get_user_rol() = 'admin');
CREATE POLICY "agenda_delete_admin"
  ON agenda FOR DELETE TO authenticated USING (get_user_rol() = 'admin');

-- Sponsors
CREATE TABLE sponsors (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  naam       TEXT    NOT NULL,
  url        TEXT    NOT NULL,
  logo_url   TEXT,
  volgorde   INT     NOT NULL DEFAULT 0,
  actief     BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sponsors_select_public"
  ON sponsors FOR SELECT USING (actief = true);
CREATE POLICY "sponsors_insert_admin"
  ON sponsors FOR INSERT TO authenticated WITH CHECK (get_user_rol() = 'admin');
CREATE POLICY "sponsors_update_admin"
  ON sponsors FOR UPDATE TO authenticated USING (get_user_rol() = 'admin');
CREATE POLICY "sponsors_delete_admin"
  ON sponsors FOR DELETE TO authenticated USING (get_user_rol() = 'admin');

-- Bestanden (metadata voor Supabase Storage uploads)
CREATE TABLE bestanden (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  naam         TEXT             NOT NULL,   -- weergavenaam
  categorie    TEXT             NOT NULL,   -- 'liedjes'|'nieuwsbrieven'|'opnames'|'choreo'|'oude_optredens'
  stemgroep    stemgroep_type,              -- alleen voor liedjes
  storage_path TEXT             NOT NULL,   -- bucket/pad
  bucket       TEXT             NOT NULL,   -- supabase bucket name
  bestandsnaam TEXT             NOT NULL,   -- originele bestandsnaam
  created_at   TIMESTAMPTZ      NOT NULL DEFAULT now()
);

ALTER TABLE bestanden ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bestanden_select_auth"
  ON bestanden FOR SELECT TO authenticated USING (true);
CREATE POLICY "bestanden_insert_admin"
  ON bestanden FOR INSERT TO authenticated WITH CHECK (get_user_rol() = 'admin');
CREATE POLICY "bestanden_delete_admin"
  ON bestanden FOR DELETE TO authenticated USING (get_user_rol() = 'admin');
