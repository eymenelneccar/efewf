
CREATE TABLE IF NOT EXISTS "shipments" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_name" text NOT NULL,
	"address" text NOT NULL,
	"phone" text,
	"status" text DEFAULT 'unpaid' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
