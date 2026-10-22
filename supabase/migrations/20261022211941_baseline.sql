


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."media_type" AS ENUM (
    'audio',
    'video'
);


ALTER TYPE "public"."media_type" OWNER TO "postgres";


CREATE TYPE "public"."stemgroep_type" AS ENUM (
    'Alt',
    'Mezzo',
    'Sopraan',
    'Tenor',
    'Bas'
);


ALTER TYPE "public"."stemgroep_type" OWNER TO "postgres";


CREATE TYPE "public"."user_rol" AS ENUM (
    'lid',
    'admin'
);


ALTER TYPE "public"."user_rol" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_rol"() RETURNS "public"."user_rol"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT rol FROM profiles WHERE id = auth.uid()
$$;


ALTER FUNCTION "public"."get_user_rol"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  BEGIN
    INSERT INTO public.profiles (id, email, rol)
    VALUES (NEW.id, NEW.email, 'lid')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
  END;
  $$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."agenda" (
    "id" bigint NOT NULL,
    "titel" "text" NOT NULL,
    "datum" "text" NOT NULL,
    "tijd" "text",
    "locatie" "text",
    "label" "text",
    "label_kleur" "text" DEFAULT '#F36A2A'::"text",
    "beschrijving" "text",
    "link" "text",
    "gepubliceerd" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "datum_sorteer" "date",
    "fotos_url" "text"
);


ALTER TABLE "public"."agenda" OWNER TO "postgres";


ALTER TABLE "public"."agenda" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."agenda_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."albums" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "titel" "text" NOT NULL,
    "datum" "text" NOT NULL,
    "volgorde" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."albums" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."berichten" (
    "id" bigint NOT NULL,
    "slug" "text" NOT NULL,
    "titel" "text" NOT NULL,
    "datum" "text" NOT NULL,
    "categorie" "text" DEFAULT 'Nieuws'::"text" NOT NULL,
    "intro" "text" NOT NULL,
    "inhoud" "text" NOT NULL,
    "afbeelding" "text" NOT NULL,
    "gepubliceerd" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."berichten" OWNER TO "postgres";


ALTER TABLE "public"."berichten" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."berichten_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."bestanden" (
    "id" bigint NOT NULL,
    "naam" "text" NOT NULL,
    "categorie" "text" NOT NULL,
    "stemgroep" "public"."stemgroep_type",
    "storage_path" "text" NOT NULL,
    "bucket" "text" NOT NULL,
    "bestandsnaam" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "r2_key" "text"
);


ALTER TABLE "public"."bestanden" OWNER TO "postgres";


ALTER TABLE "public"."bestanden" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."bestanden_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."bestuur" (
    "id" bigint NOT NULL,
    "naam" "text" NOT NULL,
    "rol" "text" NOT NULL,
    "initialen" "text" NOT NULL,
    "foto_url" "text",
    "volgorde" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."bestuur" OWNER TO "postgres";


ALTER TABLE "public"."bestuur" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."bestuur_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."choreo" (
    "id" bigint NOT NULL,
    "titel" "text" NOT NULL,
    "lied" "text" NOT NULL,
    "url" "text",
    "volgorde" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."choreo" OWNER TO "postgres";


ALTER TABLE "public"."choreo" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."choreo_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."fotos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "album_id" "uuid" NOT NULL,
    "r2_key" "text" NOT NULL,
    "impressies" boolean DEFAULT false,
    "volgorde" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."fotos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."liedjes" (
    "id" bigint NOT NULL,
    "titel" "text" NOT NULL,
    "componist" "text",
    "stemgroep" "public"."stemgroep_type" NOT NULL,
    "pdf_url" "text",
    "volgorde" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."liedjes" OWNER TO "postgres";


ALTER TABLE "public"."liedjes" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."liedjes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."media" (
    "id" bigint NOT NULL,
    "type" "text" NOT NULL,
    "url" "text",
    "r2_key" "text",
    "label" "text" NOT NULL,
    "datum" "text",
    "volgorde" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "media_type_check" CHECK (("type" = ANY (ARRAY['foto'::"text", 'video'::"text"])))
);


ALTER TABLE "public"."media" OWNER TO "postgres";


ALTER TABLE "public"."media" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."media_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."nieuwsbrieven" (
    "id" bigint NOT NULL,
    "datum" "text" NOT NULL,
    "titel" "text" NOT NULL,
    "pdf_url" "text",
    "volgorde" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."nieuwsbrieven" OWNER TO "postgres";


ALTER TABLE "public"."nieuwsbrieven" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."nieuwsbrieven_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."opnames" (
    "id" bigint NOT NULL,
    "titel" "text" NOT NULL,
    "datum" "text" NOT NULL,
    "type" "public"."media_type" DEFAULT 'video'::"public"."media_type" NOT NULL,
    "url" "text",
    "volgorde" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."opnames" OWNER TO "postgres";


ALTER TABLE "public"."opnames" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."opnames_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."oude_optredens" (
    "id" bigint NOT NULL,
    "titel" "text" NOT NULL,
    "datum" "text" NOT NULL,
    "locatie" "text" NOT NULL,
    "youtube_id" "text",
    "afbeelding_url" "text",
    "volgorde" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."oude_optredens" OWNER TO "postgres";


ALTER TABLE "public"."oude_optredens" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."oude_optredens_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "rol" "public"."user_rol" DEFAULT 'lid'::"public"."user_rol" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "naam" "text",
    "stemgroep" "public"."stemgroep_type"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."smoelenboek" (
    "id" bigint NOT NULL,
    "naam" "text" NOT NULL,
    "stemgroep" "public"."stemgroep_type" NOT NULL,
    "initialen" "text" NOT NULL,
    "foto_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."smoelenboek" OWNER TO "postgres";


ALTER TABLE "public"."smoelenboek" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."smoelenboek_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."sponsors" (
    "id" bigint NOT NULL,
    "naam" "text" NOT NULL,
    "url" "text" NOT NULL,
    "logo_url" "text",
    "volgorde" integer DEFAULT 0 NOT NULL,
    "actief" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."sponsors" OWNER TO "postgres";


ALTER TABLE "public"."sponsors" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."sponsors_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."agenda"
    ADD CONSTRAINT "agenda_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."albums"
    ADD CONSTRAINT "albums_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."albums"
    ADD CONSTRAINT "albums_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."berichten"
    ADD CONSTRAINT "berichten_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."berichten"
    ADD CONSTRAINT "berichten_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."bestanden"
    ADD CONSTRAINT "bestanden_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bestuur"
    ADD CONSTRAINT "bestuur_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."choreo"
    ADD CONSTRAINT "choreo_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fotos"
    ADD CONSTRAINT "fotos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."liedjes"
    ADD CONSTRAINT "liedjes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."media"
    ADD CONSTRAINT "media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."nieuwsbrieven"
    ADD CONSTRAINT "nieuwsbrieven_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."opnames"
    ADD CONSTRAINT "opnames_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."oude_optredens"
    ADD CONSTRAINT "oude_optredens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."smoelenboek"
    ADD CONSTRAINT "smoelenboek_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sponsors"
    ADD CONSTRAINT "sponsors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fotos"
    ADD CONSTRAINT "fotos_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admin schrijven albums" ON "public"."albums" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."rol" = 'admin'::"public"."user_rol")))));



CREATE POLICY "Admin schrijven fotos" ON "public"."fotos" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."rol" = 'admin'::"public"."user_rol")))));



CREATE POLICY "Publiek lezen albums" ON "public"."albums" FOR SELECT USING (true);



CREATE POLICY "Publiek lezen fotos" ON "public"."fotos" FOR SELECT USING (true);



ALTER TABLE "public"."agenda" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "agenda_delete_admin" ON "public"."agenda" FOR DELETE TO "authenticated" USING (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



CREATE POLICY "agenda_insert_admin" ON "public"."agenda" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



CREATE POLICY "agenda_select_public" ON "public"."agenda" FOR SELECT USING (("gepubliceerd" = true));



CREATE POLICY "agenda_update_admin" ON "public"."agenda" FOR UPDATE TO "authenticated" USING (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



ALTER TABLE "public"."albums" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."berichten" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "berichten_delete_admin" ON "public"."berichten" FOR DELETE TO "authenticated" USING (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



CREATE POLICY "berichten_insert_admin" ON "public"."berichten" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



CREATE POLICY "berichten_select_public" ON "public"."berichten" FOR SELECT USING (("gepubliceerd" = true));



CREATE POLICY "berichten_update_admin" ON "public"."berichten" FOR UPDATE TO "authenticated" USING (("public"."get_user_rol"() = 'admin'::"public"."user_rol")) WITH CHECK (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



ALTER TABLE "public"."bestanden" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "bestanden_delete_admin" ON "public"."bestanden" FOR DELETE TO "authenticated" USING (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



CREATE POLICY "bestanden_insert_admin" ON "public"."bestanden" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



CREATE POLICY "bestanden_select_auth" ON "public"."bestanden" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."bestuur" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "bestuur_delete_admin" ON "public"."bestuur" FOR DELETE TO "authenticated" USING (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



CREATE POLICY "bestuur_insert_admin" ON "public"."bestuur" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



CREATE POLICY "bestuur_select_auth" ON "public"."bestuur" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "bestuur_update_admin" ON "public"."bestuur" FOR UPDATE TO "authenticated" USING (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



ALTER TABLE "public"."choreo" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "choreo_delete_admin" ON "public"."choreo" FOR DELETE TO "authenticated" USING (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



CREATE POLICY "choreo_insert_admin" ON "public"."choreo" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



CREATE POLICY "choreo_select_auth" ON "public"."choreo" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "choreo_update_admin" ON "public"."choreo" FOR UPDATE TO "authenticated" USING (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



ALTER TABLE "public"."fotos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."liedjes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "liedjes_delete_admin" ON "public"."liedjes" FOR DELETE TO "authenticated" USING (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



CREATE POLICY "liedjes_insert_admin" ON "public"."liedjes" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



CREATE POLICY "liedjes_select_auth" ON "public"."liedjes" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "liedjes_update_admin" ON "public"."liedjes" FOR UPDATE TO "authenticated" USING (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



ALTER TABLE "public"."media" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "media_delete_admin" ON "public"."media" FOR DELETE TO "authenticated" USING (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



CREATE POLICY "media_insert_admin" ON "public"."media" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



CREATE POLICY "media_select_public" ON "public"."media" FOR SELECT USING (true);



CREATE POLICY "media_update_admin" ON "public"."media" FOR UPDATE TO "authenticated" USING (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



ALTER TABLE "public"."nieuwsbrieven" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "nieuwsbrieven_delete_admin" ON "public"."nieuwsbrieven" FOR DELETE TO "authenticated" USING (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



CREATE POLICY "nieuwsbrieven_insert_admin" ON "public"."nieuwsbrieven" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



CREATE POLICY "nieuwsbrieven_select_auth" ON "public"."nieuwsbrieven" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "nieuwsbrieven_update_admin" ON "public"."nieuwsbrieven" FOR UPDATE TO "authenticated" USING (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



ALTER TABLE "public"."opnames" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "opnames_delete_admin" ON "public"."opnames" FOR DELETE TO "authenticated" USING (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



CREATE POLICY "opnames_insert_admin" ON "public"."opnames" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



CREATE POLICY "opnames_select_auth" ON "public"."opnames" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "opnames_update_admin" ON "public"."opnames" FOR UPDATE TO "authenticated" USING (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



ALTER TABLE "public"."oude_optredens" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "oude_optredens_delete_admin" ON "public"."oude_optredens" FOR DELETE TO "authenticated" USING (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



CREATE POLICY "oude_optredens_insert_admin" ON "public"."oude_optredens" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



CREATE POLICY "oude_optredens_select_auth" ON "public"."oude_optredens" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "oude_optredens_update_admin" ON "public"."oude_optredens" FOR UPDATE TO "authenticated" USING (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_select_admin" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



CREATE POLICY "profiles_select_own" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("id" = "auth"."uid"()));



CREATE POLICY "profiles_update_admin" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("public"."get_user_rol"() = 'admin'::"public"."user_rol")) WITH CHECK (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



ALTER TABLE "public"."smoelenboek" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "smoelenboek_delete_admin" ON "public"."smoelenboek" FOR DELETE TO "authenticated" USING (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



CREATE POLICY "smoelenboek_insert_admin" ON "public"."smoelenboek" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



CREATE POLICY "smoelenboek_select_auth" ON "public"."smoelenboek" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "smoelenboek_update_admin" ON "public"."smoelenboek" FOR UPDATE TO "authenticated" USING (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



ALTER TABLE "public"."sponsors" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "sponsors_delete_admin" ON "public"."sponsors" FOR DELETE TO "authenticated" USING (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



CREATE POLICY "sponsors_insert_admin" ON "public"."sponsors" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));



CREATE POLICY "sponsors_select_public" ON "public"."sponsors" FOR SELECT USING (("actief" = true));



CREATE POLICY "sponsors_update_admin" ON "public"."sponsors" FOR UPDATE TO "authenticated" USING (("public"."get_user_rol"() = 'admin'::"public"."user_rol"));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."get_user_rol"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_rol"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_rol"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";
























GRANT ALL ON TABLE "public"."agenda" TO "anon";
GRANT ALL ON TABLE "public"."agenda" TO "authenticated";
GRANT ALL ON TABLE "public"."agenda" TO "service_role";



GRANT ALL ON SEQUENCE "public"."agenda_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."agenda_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."agenda_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."albums" TO "anon";
GRANT ALL ON TABLE "public"."albums" TO "authenticated";
GRANT ALL ON TABLE "public"."albums" TO "service_role";



GRANT ALL ON TABLE "public"."berichten" TO "anon";
GRANT ALL ON TABLE "public"."berichten" TO "authenticated";
GRANT ALL ON TABLE "public"."berichten" TO "service_role";



GRANT ALL ON SEQUENCE "public"."berichten_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."berichten_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."berichten_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."bestanden" TO "anon";
GRANT ALL ON TABLE "public"."bestanden" TO "authenticated";
GRANT ALL ON TABLE "public"."bestanden" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bestanden_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bestanden_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bestanden_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."bestuur" TO "anon";
GRANT ALL ON TABLE "public"."bestuur" TO "authenticated";
GRANT ALL ON TABLE "public"."bestuur" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bestuur_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bestuur_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bestuur_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."choreo" TO "anon";
GRANT ALL ON TABLE "public"."choreo" TO "authenticated";
GRANT ALL ON TABLE "public"."choreo" TO "service_role";



GRANT ALL ON SEQUENCE "public"."choreo_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."choreo_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."choreo_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."fotos" TO "anon";
GRANT ALL ON TABLE "public"."fotos" TO "authenticated";
GRANT ALL ON TABLE "public"."fotos" TO "service_role";



GRANT ALL ON TABLE "public"."liedjes" TO "anon";
GRANT ALL ON TABLE "public"."liedjes" TO "authenticated";
GRANT ALL ON TABLE "public"."liedjes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."liedjes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."liedjes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."liedjes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."media" TO "anon";
GRANT ALL ON TABLE "public"."media" TO "authenticated";
GRANT ALL ON TABLE "public"."media" TO "service_role";



GRANT ALL ON SEQUENCE "public"."media_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."media_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."media_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."nieuwsbrieven" TO "anon";
GRANT ALL ON TABLE "public"."nieuwsbrieven" TO "authenticated";
GRANT ALL ON TABLE "public"."nieuwsbrieven" TO "service_role";



GRANT ALL ON SEQUENCE "public"."nieuwsbrieven_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."nieuwsbrieven_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."nieuwsbrieven_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."opnames" TO "anon";
GRANT ALL ON TABLE "public"."opnames" TO "authenticated";
GRANT ALL ON TABLE "public"."opnames" TO "service_role";



GRANT ALL ON SEQUENCE "public"."opnames_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."opnames_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."opnames_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."oude_optredens" TO "anon";
GRANT ALL ON TABLE "public"."oude_optredens" TO "authenticated";
GRANT ALL ON TABLE "public"."oude_optredens" TO "service_role";



GRANT ALL ON SEQUENCE "public"."oude_optredens_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."oude_optredens_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."oude_optredens_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."smoelenboek" TO "anon";
GRANT ALL ON TABLE "public"."smoelenboek" TO "authenticated";
GRANT ALL ON TABLE "public"."smoelenboek" TO "service_role";



GRANT ALL ON SEQUENCE "public"."smoelenboek_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."smoelenboek_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."smoelenboek_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."sponsors" TO "anon";
GRANT ALL ON TABLE "public"."sponsors" TO "authenticated";
GRANT ALL ON TABLE "public"."sponsors" TO "service_role";



GRANT ALL ON SEQUENCE "public"."sponsors_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."sponsors_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."sponsors_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
































-- Trigger op auth.users: maakt bij elke nieuwe gebruiker een profiel aan.
-- Staat in het auth-schema en zit daarom niet in de standaard dump.
CREATE OR REPLACE TRIGGER "on_auth_user_created" AFTER INSERT ON "auth"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_user"();
