CREATE TYPE "public"."bullet_category" AS ENUM('systems', 'api', 'reliability');--> statement-breakpoint
CREATE TYPE "public"."session_phase" AS ENUM('input', 'analysis', 'drill', 'output');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('paste', 'github');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"access_token_enc" text,
	"password_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_runs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"project_id" uuid NOT NULL,
	"stage" text NOT NULL,
	"model" text NOT NULL,
	"status" text NOT NULL,
	"latency_ms" integer,
	"input_tokens" integer,
	"output_tokens" integer,
	"ungrounded_stripped" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "bullet_revisions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"bullet_id" uuid NOT NULL,
	"text" text NOT NULL,
	"flags" text[] DEFAULT '{}' NOT NULL,
	"source" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bullets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"position" smallint NOT NULL,
	"category" "bullet_category" NOT NULL,
	"text" text NOT NULL,
	"grounding" text[] DEFAULT '{}' NOT NULL,
	"defense" jsonb NOT NULL,
	"flags" text[] DEFAULT '{}' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claims" (
	"project_id" uuid NOT NULL,
	"claim_key" text NOT NULL,
	"category" "bullet_category" NOT NULL,
	"text" text NOT NULL,
	"evidence" text[] DEFAULT '{}' NOT NULL,
	"status" text NOT NULL,
	"purged" boolean DEFAULT false NOT NULL,
	CONSTRAINT "claims_project_id_claim_key_pk" PRIMARY KEY("project_id","claim_key")
);
--> statement-breakpoint
CREATE TABLE "drill_answers" (
	"project_id" uuid NOT NULL,
	"claim_key" text NOT NULL,
	"answer" text NOT NULL,
	"answered_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "drill_answers_project_id_claim_key_pk" PRIMARY KEY("project_id","claim_key")
);
--> statement-breakpoint
CREATE TABLE "drill_questions" (
	"project_id" uuid NOT NULL,
	"claim_key" text NOT NULL,
	"question" text NOT NULL,
	"options" text[],
	CONSTRAINT "drill_questions_project_id_claim_key_pk" PRIMARY KEY("project_id","claim_key")
);
--> statement-breakpoint
CREATE TABLE "mock_interview_attempts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"bullet_id" uuid NOT NULL,
	"response" text NOT NULL,
	"verdict" text NOT NULL,
	"score" smallint,
	"feedback" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_sources" (
	"project_id" uuid PRIMARY KEY NOT NULL,
	"raw_source" text NOT NULL,
	"content_hash" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"source_type" "source_type" DEFAULT 'paste' NOT NULL,
	"source_ref" text DEFAULT 'Pasted Source' NOT NULL,
	"phase" "session_phase" DEFAULT 'input' NOT NULL,
	"model_used" text,
	"signals" jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"name" text,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_runs" ADD CONSTRAINT "ai_runs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_runs" ADD CONSTRAINT "ai_runs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bullet_revisions" ADD CONSTRAINT "bullet_revisions_bullet_id_bullets_id_fk" FOREIGN KEY ("bullet_id") REFERENCES "public"."bullets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bullets" ADD CONSTRAINT "bullets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mock_interview_attempts" ADD CONSTRAINT "mock_interview_attempts_bullet_id_bullets_id_fk" FOREIGN KEY ("bullet_id") REFERENCES "public"."bullets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_sources" ADD CONSTRAINT "project_sources_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_provider_account_idx" ON "accounts" USING btree ("provider","provider_account_id");--> statement-breakpoint
CREATE INDEX "auth_sessions_user_idx" ON "auth_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bullets_project_position_idx" ON "bullets" USING btree ("project_id","position");--> statement-breakpoint
CREATE INDEX "projects_user_updated_idx" ON "projects" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");