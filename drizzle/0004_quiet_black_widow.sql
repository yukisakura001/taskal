CREATE TABLE "pj" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"goal" text NOT NULL,
	"deadline" text NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "project" text;--> statement-breakpoint
ALTER TABLE "pj" ADD CONSTRAINT "pj_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_pj_id_fk" FOREIGN KEY ("project") REFERENCES "public"."pj"("id") ON DELETE set null ON UPDATE no action;