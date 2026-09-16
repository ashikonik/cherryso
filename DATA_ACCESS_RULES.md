# Data Access Rules for CherrySo

⚠️ **CRITICAL: Adhere to these rules to maintain security and consistency.**

Both Drizzle ORM and the Supabase Client can query the database. Without clear rules, mixing them will cause inconsistent security enforcement.

| Use Case | Client to Use | Why |
| :--- | :--- | :--- |
| **Storefront queries** (products, categories, reviews) | **Supabase Client** (`@supabase/supabase-js`) | Respects RLS automatically — public data is public, private data is blocked |
| **User-facing mutations** (place order, submit review, update profile) | **Supabase Client** with user's auth token | RLS ensures users can only modify their own data |
| **Authentication** (login, register, sessions) | **Supabase Client** | Built-in auth module |
| **Realtime subscriptions** (notifications) | **Supabase Client** | Only works through Supabase |
| **Admin dashboard queries** (all orders, all customers, analytics) | **Drizzle ORM** via `service_role` connection | Complex aggregations, joins, and admin-level access that RLS would block |
| **Server-side background tasks** (webhooks, cron jobs, stock updates) | **Drizzle ORM** via `service_role` connection | Needs full database access |
| **Database migrations** | **Drizzle Kit** | Schema management |

## The Golden Rule
- **If the operation is user-initiated and user-scoped → Supabase Client.**
- **If it's admin/server-only → Drizzle ORM.**
- **Never** use `service_role` key in client-side code (browser). It bypasses all RLS.
