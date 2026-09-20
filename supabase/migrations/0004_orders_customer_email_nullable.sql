-- Allow guest checkouts to omit email.
-- Old code stored literal "guest@example.com" as a sentinel; new code stores NULL.
-- Invoice page already filters both the sentinel and null correctly.

ALTER TABLE "orders" ALTER COLUMN "customer_email" DROP NOT NULL;
