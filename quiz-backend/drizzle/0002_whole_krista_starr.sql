CREATE TABLE "NotionIntegration" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36),
	"notion_access_token_hash" varchar(255),
	"notion_refresh_token_hash" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leaderboard" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"total_score" integer DEFAULT 0 NOT NULL,
	"highest_score" integer DEFAULT 0 NOT NULL,
	"quizzes_played" integer DEFAULT 0 NOT NULL,
	"rank" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quizzes" RENAME COLUMN "submitted_at" TO "submitted";--> statement-breakpoint
ALTER TABLE "NotionIntegration" ADD CONSTRAINT "NotionIntegration_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard" ADD CONSTRAINT "leaderboard_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;