-- Sitestatus voor de pagina Beheer → Sitestatus: ook de laatste keepalive-runs.
CREATE OR REPLACE FUNCTION public.sitestatus() RETURNS json
  LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  keepalive json;
  runs json;
  http int;
BEGIN
  IF get_user_rol() IS DISTINCT FROM 'admin' THEN RAISE EXCEPTION 'Geen toegang'; END IF;
  BEGIN
    SELECT json_build_object('start', d.start_time, 'status', d.status) INTO keepalive
    FROM cron.job_run_details d JOIN cron.job j ON j.jobid = d.jobid
    WHERE j.jobname = 'keepalive' ORDER BY d.start_time DESC LIMIT 1;
    SELECT json_agg(r) INTO runs FROM (
      SELECT d.start_time AS start, d.status, d.return_message AS bericht
      FROM cron.job_run_details d JOIN cron.job j ON j.jobid = d.jobid
      WHERE j.jobname = 'keepalive' ORDER BY d.start_time DESC LIMIT 7
    ) r;
  EXCEPTION WHEN others THEN keepalive := NULL; runs := NULL;
  END;
  BEGIN
    SELECT status_code INTO http FROM net._http_response ORDER BY created DESC LIMIT 1;
  EXCEPTION WHEN others THEN http := NULL;
  END;
  RETURN json_build_object(
    'db_bytes', pg_database_size(current_database()),
    'keepalive', keepalive,
    'keepalive_runs', runs,
    'keepalive_http', http
  );
END;
$$;
