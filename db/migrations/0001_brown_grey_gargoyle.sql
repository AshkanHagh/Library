ALTER TABLE "UserTable" ADD COLUMN "password" varchar(255) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "emailIndex" ON "UserTable" ("phone");