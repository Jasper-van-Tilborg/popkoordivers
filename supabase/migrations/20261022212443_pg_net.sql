-- pg_net: laat de keepalive-cronjob een echt HTTP-verzoek naar de API doen,
-- zodat Supabase het project niet pauzeert na 7 dagen zonder verkeer.
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
