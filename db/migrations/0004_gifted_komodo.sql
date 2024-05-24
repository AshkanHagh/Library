DROP INDEX IF EXISTS "emailIndex";--> statement-breakpoint
ALTER TABLE "UserTable" ADD COLUMN "email" varchar(255) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "emailIndex" ON "UserTable" ("email");