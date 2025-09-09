

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


CREATE SCHEMA IF NOT EXISTS "private";


ALTER SCHEMA "private" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_admin_request_approval"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
        NEW.reviewed_at = NOW();
        NEW.reviewed_by = auth.uid();
    ELSIF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
        NEW.reviewed_at = NOW();
        NEW.reviewed_by = auth.uid();
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_admin_request_approval"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RETURN auth.jwt() ->> 'role' = 'admin';
END;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_contact_inquiry_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    PERFORM log_security_event(
        'contact_inquiry_created',
        'contact_inquiries',
        NEW.id
    );
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."log_contact_inquiry_insert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_security_event"("p_action" "text", "p_table_name" "text" DEFAULT NULL::"text", "p_record_id" "uuid" DEFAULT NULL::"uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    INSERT INTO security_audit_log (
        user_id,
        action,
        table_name,
        record_id,
        ip_address,
        user_agent
    ) VALUES (
        auth.uid(),
        p_action,
        p_table_name,
        p_record_id,
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent'
    );
END;
$$;


ALTER FUNCTION "public"."log_security_event"("p_action" "text", "p_table_name" "text", "p_record_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."contact_inquiries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "message" "text" NOT NULL,
    "category" "text" NOT NULL,
    "priority" "text" DEFAULT 'normal'::"text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "user_id" "uuid",
    "assigned_to" "uuid",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "contact_inquiries_category_check" CHECK (("category" = ANY (ARRAY['general'::"text", 'bug_report'::"text", 'feature_request'::"text", 'support'::"text", 'other'::"text"]))),
    CONSTRAINT "contact_inquiries_email_format" CHECK (("email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::"text")),
    CONSTRAINT "contact_inquiries_message_length" CHECK ((("length"("message") >= 10) AND ("length"("message") <= 5000))),
    CONSTRAINT "contact_inquiries_name_length" CHECK ((("length"("name") >= 1) AND ("length"("name") <= 100))),
    CONSTRAINT "contact_inquiries_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'normal'::"text", 'high'::"text", 'urgent'::"text"]))),
    CONSTRAINT "contact_inquiries_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'in_progress'::"text", 'resolved'::"text", 'closed'::"text"]))),
    CONSTRAINT "contact_inquiries_subject_length" CHECK ((("length"("subject") >= 1) AND ("length"("subject") <= 200)))
);


ALTER TABLE "public"."contact_inquiries" OWNER TO "postgres";


CREATE OR REPLACE VIEW "private"."contact_inquiries_summary" WITH ("security_invoker"='on') AS
 SELECT "id",
    "name",
    "email",
    "message",
    "created_at",
    "user_id",
    "status"
   FROM "public"."contact_inquiries" "ci"
  WHERE ("user_id" = ( SELECT "auth"."uid"() AS "uid"));


ALTER VIEW "private"."contact_inquiries_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_activity_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "admin_id" "uuid",
    "action" "text" NOT NULL,
    "resource_type" "text" NOT NULL,
    "resource_id" "uuid",
    "details" "jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_activity_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "email" "text" NOT NULL,
    "name" "text" NOT NULL,
    "reason" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "review_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "admin_requests_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."admin_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "admin_id" "uuid",
    "token" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admins" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "name" "text" NOT NULL,
    "role" "text" DEFAULT 'admin'::"text",
    "is_active" boolean DEFAULT true,
    "last_login" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "admins_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])))
);


ALTER TABLE "public"."admins" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audio_files" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "word_id" "uuid",
    "file_name" "text" NOT NULL,
    "file_path" "text" NOT NULL,
    "file_size" integer NOT NULL,
    "mime_type" "text" NOT NULL,
    "duration_seconds" numeric(5,2),
    "uploaded_by" "uuid",
    "is_active" boolean DEFAULT true,
    "file_index" integer NOT NULL,
    "audio_type" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "audio_files_audio_type_check" CHECK (("audio_type" = ANY (ARRAY['word'::"text", 'example1'::"text", 'example2'::"text", 'example3'::"text"])))
);


ALTER TABLE "public"."audio_files" OWNER TO "postgres";


COMMENT ON COLUMN "public"."audio_files"."file_index" IS 'Sequential index of audio file within word folder (1, 2, 3, ...)';



COMMENT ON COLUMN "public"."audio_files"."audio_type" IS 'Type of audio file: word, example1, example2, or example3';



CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "color" "text" DEFAULT '#3B82F6'::"text",
    "sort_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chunk_english_data" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "chunk_text" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."chunk_english_data" OWNER TO "postgres";


COMMENT ON TABLE "public"."chunk_english_data" IS '将来の機能拡張用：英語コンテンツのチャンクデータ';



CREATE OR REPLACE VIEW "public"."contact_inquiries_summary" AS
 SELECT "category",
    "status",
    "priority",
    "count"(*) AS "count",
    "count"(*) FILTER (WHERE ("created_at" >= ("now"() - '24:00:00'::interval))) AS "last_24h",
    "count"(*) FILTER (WHERE ("created_at" >= ("now"() - '7 days'::interval))) AS "last_7d",
    "count"(*) FILTER (WHERE ("created_at" >= ("now"() - '30 days'::interval))) AS "last_30d"
   FROM "public"."contact_inquiries"
  GROUP BY "category", "status", "priority"
  ORDER BY "category", "status", "priority";


ALTER VIEW "public"."contact_inquiries_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."review_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "total_words" integer NOT NULL,
    "completed_words" integer NOT NULL,
    "correct_answers" integer NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."review_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."review_words" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "word_id" "uuid",
    "added_at" timestamp with time zone DEFAULT "now"(),
    "review_count" integer DEFAULT 0,
    "last_reviewed" timestamp with time zone,
    "next_review" timestamp with time zone,
    "difficulty_level" integer DEFAULT 3,
    CONSTRAINT "review_words_difficulty_level_check" CHECK ((("difficulty_level" >= 1) AND ("difficulty_level" <= 5)))
);


ALTER TABLE "public"."review_words" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."security_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "table_name" "text",
    "record_id" "uuid",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."security_audit_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."security_audit_log" IS 'セキュリティ監査ログ：重要な操作の記録';



CREATE TABLE IF NOT EXISTS "public"."study_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "category" "text" NOT NULL,
    "mode" "text" NOT NULL,
    "total_words" integer NOT NULL,
    "completed_words" integer NOT NULL,
    "correct_answers" integer NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "study_sessions_mode_check" CHECK (("mode" = ANY (ARRAY['flashcard'::"text", 'quiz'::"text"])))
);


ALTER TABLE "public"."study_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "value" "jsonb" NOT NULL,
    "description" "text",
    "category" "text" DEFAULT 'general'::"text",
    "is_public" boolean DEFAULT false,
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."system_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trivia" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "word_id" "uuid",
    "category" "text" NOT NULL,
    "question" "text" NOT NULL,
    "correct_answer" "text" NOT NULL,
    "wrong_answers" "text"[] NOT NULL,
    "explanation" "text",
    "difficulty_level" integer DEFAULT 1,
    "is_featured" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "trivia_difficulty_level_check" CHECK ((("difficulty_level" >= 1) AND ("difficulty_level" <= 5)))
);


ALTER TABLE "public"."trivia" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "display_name" "text",
    "avatar_url" "text",
    "bio" "text",
    "study_goal" integer DEFAULT 10,
    "preferred_language" "text" DEFAULT 'ja'::"text",
    "timezone" "text" DEFAULT 'Asia/Tokyo'::"text",
    "notification_settings" "jsonb" DEFAULT '{"achievement": true, "daily_reminder": true, "review_reminder": true}'::"jsonb",
    "study_streak" integer DEFAULT 0,
    "last_study_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_profiles_preferred_language_check" CHECK (("preferred_language" = ANY (ARRAY['ja'::"text", 'en'::"text"])))
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "word_id" "uuid",
    "mastery_level" numeric(3,2) DEFAULT 0,
    "study_count" integer DEFAULT 0,
    "correct_count" integer DEFAULT 0,
    "incorrect_count" integer DEFAULT 0,
    "last_studied" timestamp with time zone DEFAULT "now"(),
    "is_favorite" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_trivia_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "trivia_id" "uuid",
    "is_correct" boolean NOT NULL,
    "attempts" integer DEFAULT 1,
    "is_bookmarked" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_trivia_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."words" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category_id" "uuid",
    "category" "text" NOT NULL,
    "section" "text" DEFAULT '1'::"text" NOT NULL,
    "word" "text" NOT NULL,
    "japanese" "text" NOT NULL,
    "example1" "text" NOT NULL,
    "example2" "text" NOT NULL,
    "example3" "text" NOT NULL,
    "example1_jp" "text" NOT NULL,
    "example2_jp" "text" NOT NULL,
    "example3_jp" "text" NOT NULL,
    "audio_file" "text",
    "phonetic" "text",
    "is_active" boolean DEFAULT true,
    "trivia_content_jp" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "words_section_check" CHECK (("section" ~ '^[0-9]+$'::"text"))
);


ALTER TABLE "public"."words" OWNER TO "postgres";


COMMENT ON COLUMN "public"."words"."section" IS '学習セクション（数値：1, 2, 3... カテゴリー内での細かい分類）';



COMMENT ON COLUMN "public"."words"."audio_file" IS '音声ファイルのパスまたは説明';



ALTER TABLE ONLY "public"."admin_activity_logs"
    ADD CONSTRAINT "admin_activity_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_requests"
    ADD CONSTRAINT "admin_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_sessions"
    ADD CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_sessions"
    ADD CONSTRAINT "admin_sessions_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audio_files"
    ADD CONSTRAINT "audio_files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audio_files"
    ADD CONSTRAINT "audio_files_word_id_file_index_key" UNIQUE ("word_id", "file_index");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chunk_english_data"
    ADD CONSTRAINT "chunk_english_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_inquiries"
    ADD CONSTRAINT "contact_inquiries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."review_sessions"
    ADD CONSTRAINT "review_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."review_words"
    ADD CONSTRAINT "review_words_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."review_words"
    ADD CONSTRAINT "review_words_user_id_word_id_key" UNIQUE ("user_id", "word_id");



ALTER TABLE ONLY "public"."security_audit_log"
    ADD CONSTRAINT "security_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."study_sessions"
    ADD CONSTRAINT "study_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_key_key" UNIQUE ("key");



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trivia"
    ADD CONSTRAINT "trivia_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_user_id_word_id_key" UNIQUE ("user_id", "word_id");



ALTER TABLE ONLY "public"."user_trivia_progress"
    ADD CONSTRAINT "user_trivia_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_trivia_progress"
    ADD CONSTRAINT "user_trivia_progress_user_id_trivia_id_key" UNIQUE ("user_id", "trivia_id");



ALTER TABLE ONLY "public"."words"
    ADD CONSTRAINT "words_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."words"
    ADD CONSTRAINT "words_word_key" UNIQUE ("word");



CREATE INDEX "idx_admin_activity_logs_admin_id" ON "public"."admin_activity_logs" USING "btree" ("admin_id");



CREATE INDEX "idx_admin_activity_logs_created_at" ON "public"."admin_activity_logs" USING "btree" ("created_at");



CREATE INDEX "idx_admin_requests_email" ON "public"."admin_requests" USING "btree" ("email");



CREATE INDEX "idx_admin_requests_reviewed_by" ON "public"."admin_requests" USING "btree" ("reviewed_by");



CREATE INDEX "idx_admin_requests_status" ON "public"."admin_requests" USING "btree" ("status");



CREATE INDEX "idx_admin_requests_user_id" ON "public"."admin_requests" USING "btree" ("user_id");



CREATE INDEX "idx_admin_sessions_admin_id" ON "public"."admin_sessions" USING "btree" ("admin_id");



CREATE INDEX "idx_admin_sessions_expires_at" ON "public"."admin_sessions" USING "btree" ("expires_at");



CREATE INDEX "idx_admin_sessions_token" ON "public"."admin_sessions" USING "btree" ("token");



CREATE INDEX "idx_admins_email" ON "public"."admins" USING "btree" ("email");



CREATE INDEX "idx_audio_files_audio_type" ON "public"."audio_files" USING "btree" ("audio_type");



CREATE INDEX "idx_audio_files_created_at" ON "public"."audio_files" USING "btree" ("created_at");



CREATE INDEX "idx_audio_files_is_active" ON "public"."audio_files" USING "btree" ("is_active");



CREATE INDEX "idx_audio_files_uploaded_by" ON "public"."audio_files" USING "btree" ("uploaded_by");



CREATE INDEX "idx_audio_files_word_id" ON "public"."audio_files" USING "btree" ("word_id");



CREATE INDEX "idx_audio_files_word_id_file_index" ON "public"."audio_files" USING "btree" ("word_id", "file_index");



CREATE INDEX "idx_categories_name" ON "public"."categories" USING "btree" ("name");



CREATE INDEX "idx_categories_sort_order" ON "public"."categories" USING "btree" ("sort_order");



CREATE INDEX "idx_contact_inquiries_assigned_to" ON "public"."contact_inquiries" USING "btree" ("assigned_to");



CREATE INDEX "idx_contact_inquiries_category" ON "public"."contact_inquiries" USING "btree" ("category");



CREATE INDEX "idx_contact_inquiries_category_status" ON "public"."contact_inquiries" USING "btree" ("category", "status");



CREATE INDEX "idx_contact_inquiries_created_at" ON "public"."contact_inquiries" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_contact_inquiries_email" ON "public"."contact_inquiries" USING "btree" ("email");



CREATE INDEX "idx_contact_inquiries_priority" ON "public"."contact_inquiries" USING "btree" ("priority");



CREATE INDEX "idx_contact_inquiries_status" ON "public"."contact_inquiries" USING "btree" ("status");



CREATE INDEX "idx_contact_inquiries_status_priority" ON "public"."contact_inquiries" USING "btree" ("status", "priority");



CREATE INDEX "idx_contact_inquiries_user_id" ON "public"."contact_inquiries" USING "btree" ("user_id");



CREATE INDEX "idx_review_sessions_user_id" ON "public"."review_sessions" USING "btree" ("user_id");



CREATE INDEX "idx_review_words_next_review" ON "public"."review_words" USING "btree" ("next_review");



CREATE INDEX "idx_review_words_user_id" ON "public"."review_words" USING "btree" ("user_id");



CREATE INDEX "idx_security_audit_log_action" ON "public"."security_audit_log" USING "btree" ("action");



CREATE INDEX "idx_security_audit_log_created_at" ON "public"."security_audit_log" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_security_audit_log_table_name" ON "public"."security_audit_log" USING "btree" ("table_name");



CREATE INDEX "idx_security_audit_log_user_id" ON "public"."security_audit_log" USING "btree" ("user_id");



CREATE INDEX "idx_study_sessions_user_id" ON "public"."study_sessions" USING "btree" ("user_id");



CREATE INDEX "idx_system_settings_category" ON "public"."system_settings" USING "btree" ("category");



CREATE INDEX "idx_system_settings_key" ON "public"."system_settings" USING "btree" ("key");



CREATE INDEX "idx_trivia_category" ON "public"."trivia" USING "btree" ("category");



CREATE INDEX "idx_trivia_difficulty_level" ON "public"."trivia" USING "btree" ("difficulty_level");



CREATE INDEX "idx_trivia_is_featured" ON "public"."trivia" USING "btree" ("is_featured");



CREATE INDEX "idx_trivia_word_id" ON "public"."trivia" USING "btree" ("word_id");



CREATE INDEX "idx_user_profiles_user_id" ON "public"."user_profiles" USING "btree" ("user_id");



CREATE INDEX "idx_user_progress_user_id" ON "public"."user_progress" USING "btree" ("user_id");



CREATE INDEX "idx_user_progress_word_id" ON "public"."user_progress" USING "btree" ("word_id");



CREATE INDEX "idx_user_trivia_progress_is_bookmarked" ON "public"."user_trivia_progress" USING "btree" ("is_bookmarked");



CREATE INDEX "idx_user_trivia_progress_trivia_id" ON "public"."user_trivia_progress" USING "btree" ("trivia_id");



CREATE INDEX "idx_user_trivia_progress_user_id" ON "public"."user_trivia_progress" USING "btree" ("user_id");



CREATE INDEX "idx_words_category" ON "public"."words" USING "btree" ("category");



CREATE INDEX "idx_words_category_id" ON "public"."words" USING "btree" ("category_id");



CREATE INDEX "idx_words_category_section" ON "public"."words" USING "btree" ("category", "section");



CREATE INDEX "idx_words_is_active" ON "public"."words" USING "btree" ("is_active");



CREATE INDEX "idx_words_section" ON "public"."words" USING "btree" ("section");



CREATE INDEX "idx_words_word" ON "public"."words" USING "btree" ("word");



CREATE OR REPLACE TRIGGER "trigger_handle_admin_request_approval" BEFORE UPDATE ON "public"."admin_requests" FOR EACH ROW EXECUTE FUNCTION "public"."handle_admin_request_approval"();



CREATE OR REPLACE TRIGGER "trigger_log_contact_inquiry_insert" AFTER INSERT ON "public"."contact_inquiries" FOR EACH ROW EXECUTE FUNCTION "public"."log_contact_inquiry_insert"();



CREATE OR REPLACE TRIGGER "trigger_update_admin_requests_updated_at" BEFORE UPDATE ON "public"."admin_requests" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_admins_updated_at" BEFORE UPDATE ON "public"."admins" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_audio_files_updated_at" BEFORE UPDATE ON "public"."audio_files" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_categories_updated_at" BEFORE UPDATE ON "public"."categories" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_chunk_english_data_updated_at" BEFORE UPDATE ON "public"."chunk_english_data" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_contact_inquiries_updated_at" BEFORE UPDATE ON "public"."contact_inquiries" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_system_settings_updated_at" BEFORE UPDATE ON "public"."system_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_trivia_updated_at" BEFORE UPDATE ON "public"."trivia" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_user_profiles_updated_at" BEFORE UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_user_progress_updated_at" BEFORE UPDATE ON "public"."user_progress" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_user_trivia_progress_updated_at" BEFORE UPDATE ON "public"."user_trivia_progress" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_words_updated_at" BEFORE UPDATE ON "public"."words" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."admin_activity_logs"
    ADD CONSTRAINT "admin_activity_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."admin_requests"
    ADD CONSTRAINT "admin_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."admins"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."admin_requests"
    ADD CONSTRAINT "admin_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."admin_sessions"
    ADD CONSTRAINT "admin_sessions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audio_files"
    ADD CONSTRAINT "audio_files_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."admins"("id");



ALTER TABLE ONLY "public"."audio_files"
    ADD CONSTRAINT "audio_files_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."admins"("id");



ALTER TABLE ONLY "public"."contact_inquiries"
    ADD CONSTRAINT "contact_inquiries_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."admins"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."contact_inquiries"
    ADD CONSTRAINT "contact_inquiries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."review_sessions"
    ADD CONSTRAINT "review_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."review_words"
    ADD CONSTRAINT "review_words_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."review_words"
    ADD CONSTRAINT "review_words_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."security_audit_log"
    ADD CONSTRAINT "security_audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."study_sessions"
    ADD CONSTRAINT "study_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."admins"("id");



ALTER TABLE ONLY "public"."trivia"
    ADD CONSTRAINT "trivia_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_trivia_progress"
    ADD CONSTRAINT "user_trivia_progress_trivia_id_fkey" FOREIGN KEY ("trivia_id") REFERENCES "public"."trivia"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_trivia_progress"
    ADD CONSTRAINT "user_trivia_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."words"
    ADD CONSTRAINT "words_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



CREATE POLICY "Admin activity logs are viewable by admins" ON "public"."admin_activity_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE (("admins"."email" = ("auth"."jwt"() ->> 'email'::"text")) AND ("admins"."is_active" = true)))));



CREATE POLICY "Admin authentication check" ON "public"."admins" FOR SELECT USING ((("auth"."jwt"() ->> 'email'::"text") IS NOT NULL));



CREATE POLICY "Admin sessions are managed by admins" ON "public"."admin_sessions" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE (("admins"."email" = ("auth"."jwt"() ->> 'email'::"text")) AND ("admins"."is_active" = true)))));



CREATE POLICY "Admins can delete requests" ON "public"."admin_requests" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE (("admins"."email" = ("auth"."jwt"() ->> 'email'::"text")) AND ("admins"."is_active" = true)))));



CREATE POLICY "Admins can manage admins" ON "public"."admins" USING ((("auth"."jwt"() ->> 'email'::"text") IS NOT NULL));



CREATE POLICY "Admins can manage audio files" ON "public"."audio_files" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE (("admins"."email" = ("auth"."jwt"() ->> 'email'::"text")) AND ("admins"."is_active" = true)))));



CREATE POLICY "Admins can review requests" ON "public"."admin_requests" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE (("admins"."email" = ("auth"."jwt"() ->> 'email'::"text")) AND ("admins"."is_active" = true)))));



CREATE POLICY "Admins can view all requests" ON "public"."admin_requests" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE (("admins"."email" = ("auth"."jwt"() ->> 'email'::"text")) AND ("admins"."is_active" = true)))));



CREATE POLICY "Admins see all inquiries" ON "public"."contact_inquiries" FOR SELECT USING ((( SELECT ("auth"."jwt"() ->> 'user_role'::"text")) = 'admin'::"text"));



CREATE POLICY "Anyone can insert inquiries" ON "public"."contact_inquiries" FOR INSERT WITH CHECK (true);



CREATE POLICY "Authenticated users can read chunk_english_data" ON "public"."chunk_english_data" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Categories are viewable by everyone" ON "public"."categories" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Only admins can delete inquiries" ON "public"."contact_inquiries" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE (("admins"."email" = ("auth"."jwt"() ->> 'email'::"text")) AND ("admins"."is_active" = true)))));



CREATE POLICY "Only admins can manage categories" ON "public"."categories" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE (("admins"."email" = ("auth"."jwt"() ->> 'email'::"text")) AND ("admins"."is_active" = true)))));



CREATE POLICY "Only admins can manage system settings" ON "public"."system_settings" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE (("admins"."email" = ("auth"."jwt"() ->> 'email'::"text")) AND ("admins"."is_active" = true)))));



CREATE POLICY "Only admins can manage words" ON "public"."words" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE (("admins"."email" = ("auth"."jwt"() ->> 'email'::"text")) AND ("admins"."is_active" = true)))));



CREATE POLICY "Only admins can modify chunk_english_data" ON "public"."chunk_english_data" USING ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Only admins can update inquiries" ON "public"."contact_inquiries" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE (("admins"."email" = ("auth"."jwt"() ->> 'email'::"text")) AND ("admins"."is_active" = true)))));



CREATE POLICY "Only admins can view security audit log" ON "public"."security_audit_log" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE (("admins"."email" = ("auth"."jwt"() ->> 'email'::"text")) AND ("admins"."is_active" = true)))));



CREATE POLICY "Public settings are viewable by everyone" ON "public"."system_settings" FOR SELECT USING (("is_public" = true));



CREATE POLICY "System functions can insert audit logs" ON "public"."security_audit_log" FOR INSERT WITH CHECK (true);



CREATE POLICY "Trivia is viewable by everyone" ON "public"."trivia" FOR SELECT USING (true);



CREATE POLICY "Users can create own inquiries" ON "public"."contact_inquiries" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can create own requests" ON "public"."admin_requests" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own inquiries" ON "public"."contact_inquiries" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete own pending requests" ON "public"."admin_requests" FOR DELETE USING ((("auth"."uid"() = "user_id") AND ("status" = 'pending'::"text")));



CREATE POLICY "Users can manage own profile" ON "public"."user_profiles" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can manage own progress" ON "public"."user_progress" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can manage own review sessions" ON "public"."review_sessions" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can manage own review words" ON "public"."review_words" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can manage own sessions" ON "public"."study_sessions" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can manage own trivia progress" ON "public"."user_trivia_progress" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update own inquiries" ON "public"."contact_inquiries" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update own pending requests" ON "public"."admin_requests" FOR UPDATE USING ((("auth"."uid"() = "user_id") AND ("status" = 'pending'::"text")));



CREATE POLICY "Users can view own inquiries" ON "public"."contact_inquiries" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view own requests" ON "public"."admin_requests" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users see own inquiries" ON "public"."contact_inquiries" FOR SELECT USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Words are viewable by everyone" ON "public"."words" FOR SELECT USING (("is_active" = true));



ALTER TABLE "public"."admin_activity_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admin_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admin_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admins" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audio_files" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chunk_english_data" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact_inquiries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."review_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."review_words" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."security_audit_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."study_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trivia" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_trivia_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."words" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."handle_admin_request_approval"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_admin_request_approval"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_admin_request_approval"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_contact_inquiry_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_contact_inquiry_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_contact_inquiry_insert"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_security_event"("p_action" "text", "p_table_name" "text", "p_record_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."log_security_event"("p_action" "text", "p_table_name" "text", "p_record_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_security_event"("p_action" "text", "p_table_name" "text", "p_record_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."contact_inquiries" TO "anon";
GRANT ALL ON TABLE "public"."contact_inquiries" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_inquiries" TO "service_role";



GRANT ALL ON TABLE "public"."admin_activity_logs" TO "anon";
GRANT ALL ON TABLE "public"."admin_activity_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_activity_logs" TO "service_role";



GRANT ALL ON TABLE "public"."admin_requests" TO "anon";
GRANT ALL ON TABLE "public"."admin_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_requests" TO "service_role";



GRANT ALL ON TABLE "public"."admin_sessions" TO "anon";
GRANT ALL ON TABLE "public"."admin_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."admins" TO "anon";
GRANT ALL ON TABLE "public"."admins" TO "authenticated";
GRANT ALL ON TABLE "public"."admins" TO "service_role";



GRANT ALL ON TABLE "public"."audio_files" TO "anon";
GRANT ALL ON TABLE "public"."audio_files" TO "authenticated";
GRANT ALL ON TABLE "public"."audio_files" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."chunk_english_data" TO "anon";
GRANT ALL ON TABLE "public"."chunk_english_data" TO "authenticated";
GRANT ALL ON TABLE "public"."chunk_english_data" TO "service_role";



GRANT ALL ON TABLE "public"."contact_inquiries_summary" TO "anon";
GRANT ALL ON TABLE "public"."contact_inquiries_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_inquiries_summary" TO "service_role";



GRANT ALL ON TABLE "public"."review_sessions" TO "anon";
GRANT ALL ON TABLE "public"."review_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."review_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."review_words" TO "anon";
GRANT ALL ON TABLE "public"."review_words" TO "authenticated";
GRANT ALL ON TABLE "public"."review_words" TO "service_role";



GRANT ALL ON TABLE "public"."security_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."security_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."security_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."study_sessions" TO "anon";
GRANT ALL ON TABLE "public"."study_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."study_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."system_settings" TO "anon";
GRANT ALL ON TABLE "public"."system_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."system_settings" TO "service_role";



GRANT ALL ON TABLE "public"."trivia" TO "anon";
GRANT ALL ON TABLE "public"."trivia" TO "authenticated";
GRANT ALL ON TABLE "public"."trivia" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_progress" TO "anon";
GRANT ALL ON TABLE "public"."user_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."user_progress" TO "service_role";



GRANT ALL ON TABLE "public"."user_trivia_progress" TO "anon";
GRANT ALL ON TABLE "public"."user_trivia_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."user_trivia_progress" TO "service_role";



GRANT ALL ON TABLE "public"."words" TO "anon";
GRANT ALL ON TABLE "public"."words" TO "authenticated";
GRANT ALL ON TABLE "public"."words" TO "service_role";









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






























RESET ALL;
