CREATE TABLE "documents" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36),
	"title" varchar(200) NOT NULL,
	"content" text NOT NULL,
	"upload_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "leaderboard" CASCADE;--> statement-breakpoint
ALTER TABLE "NotionIntegration" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "NotionIntegration" ADD COLUMN "notion_workspace_id" varchar(255);--> statement-breakpoint
ALTER TABLE "NotionIntegration" ADD COLUMN "notion_workspace_name" varchar(255);--> statement-breakpoint
ALTER TABLE "NotionIntegration" ADD COLUMN "notion_workspace_icon" text;--> statement-breakpoint
ALTER TABLE "NotionIntegration" ADD COLUMN "notion_bot_id" varchar(255);--> statement-breakpoint
ALTER TABLE "NotionIntegration" ADD COLUMN "notion_owner" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;