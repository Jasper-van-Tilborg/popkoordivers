-- Redacteuren mogen de inhoud beheren (agenda, nieuws, albums, foto's, bestanden);
-- leden, instellingen en de sitestatus blijven voor admins.

CREATE OR REPLACE FUNCTION public.mag_beheren() RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
  AS $$ SELECT get_user_rol() IN ('admin', 'redacteur') $$;

-- Agenda
DROP POLICY IF EXISTS "agenda_select_admin" ON agenda;
DROP POLICY IF EXISTS "agenda_insert_admin" ON agenda;
DROP POLICY IF EXISTS "agenda_update_admin" ON agenda;
DROP POLICY IF EXISTS "agenda_delete_admin" ON agenda;
CREATE POLICY "agenda_select_beheer" ON agenda FOR SELECT TO authenticated USING (mag_beheren());
CREATE POLICY "agenda_insert_beheer" ON agenda FOR INSERT TO authenticated WITH CHECK (mag_beheren());
CREATE POLICY "agenda_update_beheer" ON agenda FOR UPDATE TO authenticated USING (mag_beheren()) WITH CHECK (mag_beheren());
CREATE POLICY "agenda_delete_beheer" ON agenda FOR DELETE TO authenticated USING (mag_beheren());

-- Nieuws
DROP POLICY IF EXISTS "berichten_select_admin" ON berichten;
DROP POLICY IF EXISTS "berichten_insert_admin" ON berichten;
DROP POLICY IF EXISTS "berichten_update_admin" ON berichten;
DROP POLICY IF EXISTS "berichten_delete_admin" ON berichten;
CREATE POLICY "berichten_select_beheer" ON berichten FOR SELECT TO authenticated USING (mag_beheren());
CREATE POLICY "berichten_insert_beheer" ON berichten FOR INSERT TO authenticated WITH CHECK (mag_beheren());
CREATE POLICY "berichten_update_beheer" ON berichten FOR UPDATE TO authenticated USING (mag_beheren()) WITH CHECK (mag_beheren());
CREATE POLICY "berichten_delete_beheer" ON berichten FOR DELETE TO authenticated USING (mag_beheren());

-- Bestanden (lezen mag elk lid al)
DROP POLICY IF EXISTS "bestanden_insert_admin" ON bestanden;
DROP POLICY IF EXISTS "bestanden_update_admin" ON bestanden;
DROP POLICY IF EXISTS "bestanden_delete_admin" ON bestanden;
CREATE POLICY "bestanden_insert_beheer" ON bestanden FOR INSERT TO authenticated WITH CHECK (mag_beheren());
CREATE POLICY "bestanden_update_beheer" ON bestanden FOR UPDATE TO authenticated USING (mag_beheren()) WITH CHECK (mag_beheren());
CREATE POLICY "bestanden_delete_beheer" ON bestanden FOR DELETE TO authenticated USING (mag_beheren());

-- Albums en foto's
DROP POLICY IF EXISTS "Admin schrijven albums" ON albums;
DROP POLICY IF EXISTS "Admin schrijven fotos" ON fotos;
CREATE POLICY "albums_schrijven_beheer" ON albums FOR ALL TO authenticated USING (mag_beheren()) WITH CHECK (mag_beheren());
CREATE POLICY "fotos_schrijven_beheer" ON fotos FOR ALL TO authenticated USING (mag_beheren()) WITH CHECK (mag_beheren());

-- Activiteit: wie wat deed in de admin. Alleen admins lezen; de server schrijft.
CREATE TABLE activiteit (
  id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  wanneer   timestamptz NOT NULL DEFAULT now(),
  wie       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  wie_naam  text,
  actie     text NOT NULL,   -- "aangemaakt", "gewijzigd", "verwijderd", ...
  soort     text NOT NULL,   -- "optreden", "bericht", "album", "foto", "bestand", "lid", "instellingen"
  item_id   text,
  item_naam text
);
CREATE INDEX activiteit_wanneer ON activiteit (wanneer DESC);
ALTER TABLE activiteit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activiteit_select_admin" ON activiteit FOR SELECT TO authenticated USING (get_user_rol() = 'admin');

-- Sitestatus voor het overzicht van admins: databasegrootte en de laatste keepalive.
CREATE OR REPLACE FUNCTION public.sitestatus() RETURNS json
  LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  keepalive json;
  http int;
BEGIN
  IF get_user_rol() IS DISTINCT FROM 'admin' THEN RAISE EXCEPTION 'Geen toegang'; END IF;
  BEGIN
    SELECT json_build_object('start', d.start_time, 'status', d.status) INTO keepalive
    FROM cron.job_run_details d JOIN cron.job j ON j.jobid = d.jobid
    WHERE j.jobname = 'keepalive' ORDER BY d.start_time DESC LIMIT 1;
  EXCEPTION WHEN others THEN keepalive := NULL;
  END;
  BEGIN
    SELECT status_code INTO http FROM net._http_response ORDER BY created DESC LIMIT 1;
  EXCEPTION WHEN others THEN http := NULL;
  END;
  RETURN json_build_object('db_bytes', pg_database_size(current_database()), 'keepalive', keepalive, 'keepalive_http', http);
END;
$$;
REVOKE ALL ON FUNCTION public.sitestatus() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.sitestatus() TO authenticated;
