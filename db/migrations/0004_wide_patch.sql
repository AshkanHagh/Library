ALTER TABLE "postCategory" DROP CONSTRAINT "postCategory_bookId_books_id_fk";
--> statement-breakpoint
ALTER TABLE "books" DROP CONSTRAINT "books_authorId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory" DROP CONSTRAINT "inventory_bookId_books_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "postCategory" ADD CONSTRAINT "postCategory_bookId_books_id_fk" FOREIGN KEY ("bookId") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "books" ADD CONSTRAINT "books_authorId_user_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory" ADD CONSTRAINT "inventory_bookId_books_id_fk" FOREIGN KEY ("bookId") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
