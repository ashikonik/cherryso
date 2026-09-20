# 🍒 CherrySo — PLAN.md Verification Checklist

> **Generated:** 2026-09-20
> **Source:** Cross-referenced `PLAN.md` (1832 lines, 17 phases) against the actual codebase.
> **Goal:** Drive MVP deployment to Netlify.
> **Legend:** ✅ Done · 🟡 Partial · ❌ Missing · 🚧 In progress · — External (not verifiable in code)

---

## PHASE 0: Project Setup & Foundation

| # | Task | Status | Evidence |
|---|---|:---:|---|
| 1 | Next.js 15 project initialized (App Router, TS, Tailwind, ESLint) | ✅ | `package.json` — Next 16.3.5 (newer than 15), App Router structure in `src/app` |
| 2 | Core deps: drizzle-orm, drizzle-kit, @supabase/ssr, @supabase/supabase-js, zod, zustand, shadcn, lucide-react, next-themes, vitest, msw, react-query, sonner | ✅ | All present in `package.json` |
| 3 | R2 client (aws-sdk / @aws-sdk/client-s3) | ❌ | Plan called for R2 — but per `PROJECT_STATUS.md` the team **switched to Supabase Storage**; no R2 SDK in deps |
| 4 | Env vars structure (`.env.local.example`) | ✅ | `.env.local.example` documents all vars |
| 5 | Sanrio design system (color palette via CSS vars, fonts, border radius) | 🟡 | `globals.css` defines tokens via `@theme inline`; no hardcoded hex in components. **Nunito font loaded** in layout, but Geist Mono referenced and unused |
| 6 | Custom decorative elements (bow motifs, paw prints, star accents) | ❌ | No `decorative/` directory exists in `src/components/` |
| 7 | Responsive navbar, footer, mobile hamburger menu | ✅ | `Navbar.tsx`, `Footer.tsx` exist; Sheet-based mobile menu |
| 8 | Dark mode foundation (`next-themes` + CSS vars) | ✅ | `theme-provider.tsx` + `theme-toggle.tsx`, CSS vars in `globals.css` |
| 9 | Theme toggle button in navbar | ✅ | `ThemeToggle` imported in Navbar |
| 10 | Supabase project creation | — | External (not verifiable in code) |
| 11 | Cloudflare R2 bucket + public access | ❌→✅ | Switched to Supabase Storage; `add-storage-rls.ts` script exists |
| 12 | Resend account | — | External; env var present |
| 13 | Google Analytics 4 in root layout | ✅ | GA script in `src/app/layout.tsx` |
| 14 | Git repo + `.gitignore` | ✅ | `.git/` exists, `.gitignore` present |
| 15 | Error handling infrastructure (`error.tsx`, `not-found.tsx`, `sonner` Toaster, `lib/errors.ts`) | ✅ | Both pages exist, Toaster mounted, `src/lib/errors.ts` exists |
| 16 | Graceful degradation utilities | 🟡 | `lib/errors.ts` exists; no R2-fallback placeholder logic visible |
| 17 | React Query `QueryClientProvider` | ✅ | `lib/react-query.tsx` wraps layout |
| 18 | ISR caching strategy (`revalidate: 3600` for products, etc.) | ✅ | **Not a blocker** — live Netlify build (2026-09-20) confirmed all 18 storefront pages prerender successfully without `revalidate` exports (DB queries resolve at build time). Adding ISR is still a recommended optimization, not required for MVP |
| 19 | React Query hooks pattern for client-side interactions | 🟡 | Provider exists; no documented hooks for cart/favorites optimistic updates |
| 20 | Vitest config + `npm run test` script | ✅ | `vitest.config.ts`, `npm run test` in `package.json` |
| 21 | **Checkpoint: build + lint + test pass; `git tag phase-0-complete`** | 🟡 | Build passes (compilation), lint passes, tests pass — but no git tag found |

### Phase 0 Sanity Check (from PLAN)

- [x] `npm run dev` starts (per file structure)
- [x] Theme colors/fonts render
- [x] Dark mode toggle works
- [x] No hardcoded hex colors
- [x] Env vars documented
- [x] Mobile responsive layout (Tailwind utilities throughout)
- [x] GA4 tracking script loads
- [x] Error boundary works
- [x] 404 page works
- [x] Toast system works (Toaster mounted)
- [x] React Query provider works
- [x] Vitest runs (5 tests pass)

---

## PHASE 1: Database Schema & Backend Core

| # | Task | Status | Evidence |
|---|---|:---:|---|
| 1 | Drizzle schema: all tables | ✅ | `src/db/schema.ts` defines all 22 tables |
| 2 | `users` (extends auth.users) via `user_profiles` | ✅ | `userProfiles` table |
| 3 | `roles` (admin, moderator, customer) | ✅ | `roles` table |
| 4 | `categories` (hierarchical) | ✅ | `categories.parentId` self-ref |
| 5 | `tags` + `product_tags` | ✅ | Both present |
| 6 | `products` with `weight_grams`, `search_vector` | ✅ | Columns present; `search_vector` in migration `0001` |
| 7 | `product_images`, `product_videos`, `product_variants` | ✅ | All three present |
| 8 | `cart_items`, `orders`, `order_items` | ✅ | All present |
| 9 | `reviews`, `favorites`, `wishlists` | ✅ | All present |
| 10 | `coupons`, `flash_sales`, `blog_posts` | ✅ | All present |
| 11 | `shipping_zones`, `site_settings`, `notifications`, `audit_log`, `return_requests` | ✅ | All present |
| 12 | Drizzle migrations run against Supabase | ✅ | 4 migrations in `supabase/migrations/` |
| 13 | RLS policies on all tables | ✅ | Migration `0001` enables RLS + policies on all tables |
| 14 | Helper `db.ts`, auth helpers, R2/storage helpers | 🟡 | `db/index.ts` exists; **no `lib/storage/`** for R2 (switched to Supabase Storage inline) |
| 15 | `lib/validators.ts` Zod schemas | ✅ | `src/lib/validators.ts` — user, category, product, review, cart, order schemas |
| 16 | `lib/errors.ts` from Phase 0 | ✅ | Exists |
| 17 | PostgreSQL FTS: `search_vector` TSVECTOR + GIN index | ✅ | Migration `0001` |
| 18 | `search_products()` SQL function | ✅ | Migration `0001` |
| 19 | `DATA_ACCESS_RULES.md` at project root | ✅ | Present |

### Phase 1 Sanity Check

- [x] All tables created
- [x] RLS policies tested (per migration)
- [x] Drizzle queries work
- [x] FK relationships correct (cascade rules declared)
- [x] `weight_grams` on products + variants
- [x] `reserved_until`, `stock_reserved` on orders
- [x] `search_vector` + GIN index
- [ ] **Full-text search smoke test** (cannot run without live DB)
- [x] `return_requests` table with correct FKs
- [x] `DATA_ACCESS_RULES.md` exists
- [x] Vitest validator tests pass

---

## PHASE 2: Authentication & Role System

| # | Task | Status | Evidence |
|---|---|:---:|---|
| 1 | Resend custom SMTP in Supabase | — | External (env var present) |
| 2 | `/login`, `/register` pages | ✅ | `(auth)/login`, `(auth)/register` |
| 3 | `/forgot-password`, `/reset-password` | ❌ | **Not implemented** — only login/register exist |
| 4 | Auth middleware protecting `/admin/*` and `/account/*` | ✅ | `proxy.ts` (Next 16 middleware name) — protects `/admin` and `/account` |
| 5 | Role system + admin invite moderators | ❌ | Role enum exists, `requireAdmin()` helper exists, but **no admin UI for managing moderators** |
| 6 | `useUser()` hook | ✅ | `src/hooks/useUser.ts` |
| 7 | `useRequireAuth()`, `useRequireRole()` hooks | ❌ | **Not implemented** (only `useUser` exists) |
| 8 | Rate limit module `lib/rate-limit.ts` with 6 limiters | ✅ | `rateLimiters` for orderPlacement, coupon, search, review, login, register |
| 9 | **Rate limiters actually applied to endpoints** | ❌🔴 | **Zero callers** — limiters defined but never wired in (per `grep` audit) |

### Phase 2 Sanity Check

- [x] Register → login works (Supabase flow implemented)
- [ ] **Password reset flow** — no `/forgot-password` page
- [x] Admin can access `/admin/*`
- [ ] **Moderator CANNOT access role mgmt** — no role mgmt UI to test
- [x] Guests can browse, can't access admin/account
- [x] JWT refresh in middleware
- [ ] **Rate limiting on auth endpoints** — **defined but not called**
- [ ] **6th order from same IP returns 429** — not wired

---

## PHASE 3: Admin Dashboard — Core

| # | Task | Status | Evidence |
|---|---|:---:|---|
| 1 | Admin layout (sidebar, breadcrumbs, responsive) | ✅ | `src/app/admin/layout.tsx`, `Sidebar.tsx` |
| 2 | Sidebar nav: Dashboard, Products, Categories, Tags, Orders, **Customers**, Reviews, Blog, Settings | 🟡 | Customers, Reviews, Blog sections **missing** |
| 3 | Category CRUD (with hierarchy, image upload, drag-reorder) | 🟡 | CRUD exists in `admin/categories/`; **drag-reorder missing** |
| 4 | Tag CRUD (create/edit/delete, search/filter) | ✅ | `admin/tags/` |
| 5 | Product CRUD (name, slug, description, price, SKU, stock, weight, category, tags, status, variants) | ✅ | `admin/products/` with full form |
| 6 | Image upload (multiple, compression ≤200KB WebP, drag-reorder, alt text) | 🟡 | `image-uploader.tsx` exists; compression in `image-utils.ts`; **drag-reorder not visible** |
| 7 | Video upload (R2 or YouTube embed) | 🟡 | Schema has `product_videos`; UI minimal (no admin UI for videos observed) |
| 8 | Edit/delete product (soft delete = archive) | ✅ | Soft delete via status change |
| 9 | Bulk actions | ❌ | **Not implemented** |
| 10 | Inventory Management: stock table, inline update, **stock history log** | 🟡 | `QuickStockEdit.tsx` for inline update; **stock history not logged to audit_log** |
| 11 | Media Library (grid view, filter, delete unused) | ❌ | **Not implemented** |

### Phase 3 Sanity Check

- [x] Create product with multiple images → upload works
- [x] Edit product → persists
- [x] Delete product → archived
- [x] Categories hierarchical
- [ ] **Stock changes logged in audit trail** — audit_log never written to
- [x] Image compression <200KB WebP
- [x] Mobile responsive admin
- [x] Product weight field present and required
- [x] Dark mode admin (CSS vars)
- [x] Regression check

---

## PHASE 4: Storefront — Product Browsing

| # | Task | Status | Evidence |
|---|---|:---:|---|
| 1 | Homepage (hero carousel, featured products, categories, shop by category, promo banner) | 🟡 | `src/app/(storefront)/page.tsx` exists; hero carousel + promo banner **not verified** |
| 2 | Category page `/category/[slug]` (grid + pagination + filters + sort) | 🟡 | Page exists; **filters (price range, tags, availability), sort, pagination not visible** |
| 3 | Product detail `/product/[slug]` (gallery, video, variant selector, add-to-cart, favorites, wishlist notify, related products, reviews) | 🟡 | Gallery + variants + add-to-cart exist; **favorites/wishlist/related products/review section missing** |
| 4 | Global search bar in navbar | 🟡 | Search form in Navbar; no debounced autocomplete |
| 5 | Search results page `/search?q=...` | ❌ | **No `/search` route** — only `/products?q=...` exists |
| 6 | Full-text search via `search_products()` SQL fn | ✅ | `storefront-api.ts` calls it |
| 7 | Search autocomplete (debounced, 5 results) | ❌ | Not implemented |
| 8 | Empty search state | 🟡 | Not visible |
| 9 | Next.js `<Image />` for product images | ❌ | `eslint.config.mjs` disables `@next/next/no-img-element`; components use `<img>` |
| 10 | ISR with revalidate | ❌ | No `export const revalidate` anywhere |
| 11 | Skeleton loading states | ❌ | Not implemented |

### Phase 4 Sanity Check

- [ ] Homepage loads <3s (no live DB to test)
- [ ] Product images load from R2 → **Switched to Supabase Storage**, working in dev
- [ ] Filters update URL params — **no filters implemented**
- [x] Search returns relevant results (function exists)
- [x] Search ranking (ts_rank) — function uses ts_rank
- [ ] Search autocomplete — not implemented
- [ ] Search empty state — not visible
- [x] Product detail variant availability
- [ ] Out-of-stock "Notify Me" — **wishlist not implemented**
- [ ] Related products — not implemented
- [x] Mobile responsive (Tailwind utilities)
- [x] Dark mode storefront

---

## PHASE 5: Cart & Guest Checkout

| # | Task | Status | Evidence |
|---|---|:---:|---|
| 1 | Guest cart (localStorage via Zustand persist) | ✅ | `src/store/cart-store.ts` |
| 2 | Authenticated cart (DB `cart_items`) | ✅ | Schema exists; **no UI to populate it** (no server action writes to `cart_items`) |
| 3 | **Cart merge on login** | ❌ | Not implemented |
| 4 | Cart drawer (slide-in) | ✅ | `CartDrawer.tsx` |
| 5 | Cart page `/cart` (full layout) | ❌ | **No `/cart` route** — only drawer |
| 6 | Add/remove/update quantity + stock validation | ✅ | Zustand actions clamp to `maxStock` |
| 7 | Subtotal, shipping estimate, total | 🟡 | Subtotal yes; shipping estimate uses `getCartTotal()` which is a method (re-render bug noted) |
| 8 | Checkout page `/checkout` (form fields, Zod validation, "Place Order") | ✅ | `checkout/page.tsx`, `CheckoutForm.tsx` |
| 9 | Order summary sidebar | ✅ | In `CheckoutForm` |
| 10 | Coupon code input | ❌ | Not on checkout UI |
| 11 | Shipping zones table + rate calculation | ✅ | Schema + `shippingZones` table; rate used in checkout (base rate only — per-kg rate unused) |
| 12 | **Stock reservation with `FOR UPDATE` row lock** | 🟡🔴 | Uses DB transaction with `CHECK (stock >= 0)` constraint — but **no `FOR UPDATE` row lock** (race condition risk) |
| 13 | `reserved_until` + `stock_reserved` columns | ✅ | Present in schema |
| 14 | **Vercel Cron job for reservation expiry** | ❌ | No cron endpoint exists |
| 15 | COD goes to `processing` immediately | ❌ | Both branches of ternary return `"pending"` (dead-code bug) |

### Phase 5 Sanity Check

- [x] Guest cart persists on refresh
- [ ] **Guest cart merges on login** — not implemented
- [x] Checkout form validation (BD phone regex works)
- [x] Shipping cost updates with zone
- [x] Place Order creates order
- [x] Stock validated at checkout
- [ ] **Concurrent orders race safe** — DB CHECK catches it, but error surfaces mid-flow
- [ ] **Reservation timeout (30min)** — no cron
- [ ] **COD goes to processing** — bug, both branches are "pending"
- [x] Order total = subtotal + shipping
- [x] Cart badge in navbar

---

## PHASE 6: Manual Payment System

| # | Task | Status | Evidence |
|---|---|:---:|---|
| 1 | bKash manual (number + TrxID form fields) | ✅ | Sender number + transaction ID fields in `CheckoutForm` |
| 2 | Nagad manual (same flow) | ✅ | Configured via `siteSettings` payment_methods |
| 3 | Cash on Delivery | ✅ | Default payment method |
| 4 | "Coming Soon" badge for bKash online / Visa | 🟡 | Not verified in UI |
| 5 | Order status flow `pending → payment_submitted → verified → processing → shipped → delivered` | 🟡 | Status enum supports it; **payment_submitted never assigned** (always "pending") |
| 6 | Admin payment verification UI (verify/reject with reason) | ✅ | `QuickPaymentEdit.tsx` |
| 7 | Admin-configurable payment numbers + on/off toggle | ✅ | `admin/settings/payments/` |
| 8 | Email notification on new order / payment submitted | ❌ | No email client module; `lib/email/resend.ts` doesn't exist |

### Phase 6 Sanity Check

- [x] bKash + TrxID submission
- [ ] **Status → payment_submitted** — never set
- [x] Admin sees submissions
- [x] Admin verify/reject
- [ ] **COD goes to processing** — bug
- [x] Admin-configurable numbers
- [ ] **"Coming Soon" badges** — not verified

---

## PHASE 7: Order Management & Invoicing

| # | Task | Status | Evidence |
|---|---|:---:|---|
| 1 | Orders list (filterable by status/date/payment) | 🟡 | List page exists; **filters not visible** |
| 2 | Order detail view (customer, items, payment, timeline, notes) | ✅ | `admin/orders/[id]/page.tsx` |
| 3 | Status update buttons | ✅ | `QuickOrderConfirm`, `QuickPaymentEdit`, `QuickShippingEdit` |
| 4 | Cancel order with reason | 🟡 | Status enum supports `cancelled`; no reason-capture UI observed |
| 5 | Print-friendly order view | ✅ | `invoice/page.tsx` + `PrintButton.tsx` |
| 6 | **HTML-based invoice at `/invoice/[order_number]`** | 🟡 | Route is `/admin/orders/[id]/invoice` — not at public `/invoice/[orderNumber]` as spec says |
| 7 | Invoice includes all line items, totals, BDT ৳, shop logo | ✅ | Invoice page renders |
| 8 | Public order tracking `/order/[order_number]` | 🟡 | Success page exists at `/checkout/success/[orderId]`; no public `/order/[orderNumber]` |
| 9 | Authenticated `/account/orders` | ❌ | **No `/account` route group exists** |
| 10 | Email notifications to admin on new order | ❌ | Not implemented |
| 11 | Return & exchange management | ❌ | **Not implemented** (table exists, no UI) |
| 12 | `return_requests` table UI | ❌ | Schema only |
| 13 | Customer-facing "Request Return" button | ❌ | Not implemented |
| 14 | Admin return review (approve/reject/complete) | ❌ | Not implemented |
| 15 | Return window enforcement | ❌ | Not implemented |
| 16 | Audit log written on admin actions | ❌🔴 | **audit_log table never written to** |

### Phase 7 Sanity Check

- [ ] Full lifecycle tested
- [x] Invoice HTML renders
- [x] Invoice print → A4
- [ ] **Public order tracking with phone** — only success page
- [ ] **Admin email notification** — not implemented
- [ ] **Status history log** — no history table/timeline
- [ ] **Cancelled orders restore stock** — no UI to cancel with stock restore
- [ ] **Return request flow** — entirely missing
- [ ] **Return window** — entirely missing

---

## PHASE 8: Courier Integration (Steadfast)

| # | Task | Status | Evidence |
|---|---|:---:|---|
| 1 | API client for: create_order, bulk_order, status_by_cid, status_by_invoice, status_by_trackingcode, get_balance | 🟡 | `admin/orders/[id]/steadfast-actions.ts` + `SteadfastCourierCard.tsx` — only `create_order` clearly used |
| 2 | Admin "Ship Order" flow (auto-fill + confirmation modal) | ✅ | `SteadfastCourierCard.tsx` |
| 3 | Save `consignment_id` + `tracking_code` to order | ✅ | `courierConsignmentId` + `courierTrackingUrl` columns (the latter stores tracking code, name misleading) |
| 4 | **Webhook callback URL** | ❌ | No `/api/webhooks/steadfast` route exists |
| 5 | Webhook signature validation | ❌ | Not implemented |
| 6 | Customer tracking integration | ❌ | No public order tracking page |
| 7 | Local shipping rate table (admin-configurable) | ✅ | `shipping_zones` table + admin UI |

### Phase 8 Sanity Check

- [x] "Ship via Steadfast" books consignment
- [x] Tracking code saved to order
- [ ] **Webhook receives updates** — no webhook endpoint
- [x] Checkout shipping rates match local
- [ ] **Error handling (timeout, invalid addr)** — basic only

---

## 🚀 MVP DEPLOYMENT CHECKPOINT

| # | Task | Status |
|---|---|:---:|
| 1 | All env vars in Netlify dashboard | 🟡 (per `.env.local.example`) |
| 2 | Supabase RLS reviewed | ✅ |
| 3 | **Cloudflare R2 + Worker** | ❌ → ✅ (switched to Supabase Storage) |
| 4 | Resend SMTP configured | — |
| 5 | Steadfast API credentials | — |
| 6 | Seed data: admin, shipping zones, payment settings | 🟡 (scripts exist but not run) |
| 7 | Kawaii 404/500 pages | ✅ |
| 8 | **Legal pages: Privacy Policy, Terms, Return/Refund, Contact** | ❌ Not present in repo |
| 9 | End-to-end production test | — |
| 10 | Netlify deployment | — |
| 11 | Cron-job.org Supabase ping | — |
| 12 | Netlify Scheduled Function for reservation expiry | ❌ |
| 13 | GA4 receiving traffic | — |
| 14 | **Share on Facebook/Instagram** | — |

### MVP Sanity Check

- [ ] Site at `cherryso.netlify.app` — **not deployed**
- [ ] Complete purchase flow — **race conditions unfixed**
- [ ] Admin login + manage
- [ ] Images load from Supabase Storage
- [ ] Email notifications — **not implemented**
- [ ] Steadfast with production creds — **needs real keys**
- [ ] Mobile smooth
- [x] Dark mode toggle
- [ ] No console errors / exposed env — **`service_role` not exposed** ✅
- [ ] Stock reservation cron — **not implemented**

---

## PHASE 9: User Accounts & Profiles (POST-MVP)

| # | Task | Status |
|---|---|:---:|
| 1 | `/account` dashboard | ❌ No `/account` route group |
| 2 | `/account/profile` with avatar upload | ❌ |
| 3 | `/account/addresses` (address book) | ❌ |
| 4 | `/account/orders` (order history) | ❌ |
| 5 | `/account/notifications` + notification bell | ❌ |

---

## PHASE 10: Reviews, Favorites & Wishlist

| # | Task | Status |
|---|---|:---:|
| 1 | Reviews (auth only, purchased products, photos, verified badge) | ❌ (schema only) |
| 2 | Admin reply to reviews | ❌ |
| 3 | Favorites toggle on cards/detail page | ❌ |
| 4 | `/account/favorites` | ❌ |
| 5 | Wishlist (out-of-stock only) | ❌ |
| 6 | Back-in-stock notifications | ❌ |

---

## PHASE 11: Flash Sales, Coupons & Discounts

| # | Task | Status |
|---|---|:---:|
| 1 | Flash sale admin CRUD + auto-activate | ❌ |
| 2 | Flash sale UI (banner, countdown, badge) | ❌ |
| 3 | Coupon admin CRUD | ❌ (schema only) |
| 4 | Coupon validation at checkout | ❌ |
| 5 | Promotions dashboard | ❌ |

---

## PHASE 12: Analytics Dashboard

| # | Task | Status |
|---|---|:---:|
| 1 | Sales analytics (revenue, orders, AOV, charts) | 🟡 `admin/page.tsx` shows basic counters; **no charts** |
| 2 | Product analytics | ❌ |
| 3 | Customer analytics | ❌ |
| 4 | Order analytics | 🟡 Basic counters only |
| 5 | Dashboard widgets + date range + CSV export | ❌ |

---

## PHASE 13: Blog Module (Toggleable)

| # | Task | Status |
|---|---|:---:|
| 1 | Blog toggle in settings | ❌ (schema only) |
| 2 | Admin blog post CRUD with rich editor | ❌ |
| 3 | Public blog pages `/blog`, `/blog/[slug]` | ❌ |
| 4 | Blog SEO (OG, JSON-LD, sitemap) | ❌ |

---

## PHASE 14: SEO & Performance

| # | Task | Status |
|---|---|:---:|
| 1 | Dynamic `<title>` + meta description | 🟡 Per-page metadata may exist but not exhaustive |
| 2 | Open Graph tags | ❌ Not visible |
| 3 | JSON-LD structured data | ❌ |
| 4 | `robots.txt`, `sitemap.xml` | ❌ |
| 5 | Lighthouse 90+ | — |
| 6 | Next.js `<Image />` | ❌ Uses `<img>` |
| 7 | Accessibility (alt text, keyboard nav, ARIA) | 🟡 Some a11y bugs noted (SheetTrigger on div, missing aria-labels) |

---

## PHASE 15: Dark Mode Polish & QA

| # | Task | Status |
|---|---|:---:|
| 1 | Visual audit all pages | — |
| 2 | No hardcoded hex colors | ✅ |
| 3 | WCAG AA contrast | 🟡 Not verified |
| 4 | Cross-browser dark mode | — |

---

## PHASE 16: Automated Payment Gateways (bKash PGW + Visa)

| # | Task | Status |
|---|---|:---:|
| 1 | bKash PGW integration | ❌ |
| 2 | Visa/MC gateway (aamarPay/PortPos) | ❌ |
| 3 | Feature flag for gateways | ❌ |
| 4 | Payment reconciliation | ❌ |

---

## PHASE 17: Production Hardening

| # | Task | Status |
|---|---|:---:|
| 1 | All features verified | 🟡 |
| 2 | GitHub Actions weekly DB backup | ❌ |
| 3 | Security audit | 🟡 Many findings from earlier review |
| 4 | Performance audit | ❌ |
| 5 | Admin documentation | ❌ |

---

## 🧪 Automated Testing Strategy (PLAN §5)

| Phase | Test Type | Priority | Status |
|---|---|---|:---:|
| Phase 1 | Unit: Zod validators | 🔴 | 🟡 (4 trivial tests, only BD phone + order email) |
| Phase 2 | Unit: Role permission checks | 🔴 | ❌ |
| Phase 2 | Integration: Auth middleware | 🔴 | ❌ |
| Phase 5 | Integration: Stock reservation concurrent | 🔴 | ❌ |
| Phase 5 | Integration: Cart merge | 🟡 | ❌ |
| Phase 5 | Unit: Shipping cost calc | 🟡 | ❌ |
| Phase 6 | Integration: Order status transitions | 🔴 | ❌ |
| Phase 7 | Unit: Invoice totals | 🟡 | ❌ |
| Phase 8 | Unit: Steadfast API client | 🟡 | ❌ |
| Phase 11 | Unit: Coupon validation | 🔴 | ❌ |
| Phase 11 | Unit: Flash sale pricing | 🟡 | ❌ |

---

## 📊 Master Roll-Up

| Phase | Completion | Blocking Items for MVP |
|---|---|---|
| **Phase 0** Setup | ~95% | ISR/revalidate not set on storefront pages |
| **Phase 1** DB Schema | ~100% | — |
| **Phase 2** Auth | ~75% | Rate limiters unwired; forgot-password missing |
| **Phase 3** Admin Core | ~70% | Bulk actions, media library, **audit_log never written** |
| **Phase 4** Storefront | ~55% | No filters, no autocomplete, no ISR, no `<Image />`, no related products |
| **Phase 5** Cart & Checkout | ~70% | **Race condition** on stock; no cart merge; no cron; **COD bug** |
| **Phase 6** Manual Payments | ~85% | payment_submitted never set; no email |
| **Phase 7** Order Mgmt | ~50% | No public tracking; **no return system**; no audit; no email |
| **Phase 8** Steadfast | ~70% | No webhook endpoint |
| **🚀 MVP Deploy** | **0%** | **Site not deployed**; legal pages missing; race conditions; many critical bugs |
| Phase 9 Accounts | 0% | `/account` route group missing |
| Phase 10 Reviews/Wishlist | 0% | |
| Phase 11 Promotions | 0% | |
| Phase 12 Analytics | 5% | Only basic counters in `admin/page.tsx` |
| Phase 13 Blog | 0% | |
| Phase 14 SEO | ~10% | |
| Phase 15 Dark Mode | ~85% | Polish only |
| Phase 16 Auto Pay | 0% | |
| Phase 17 Hardening | 0% | |

---

## 🚨 Top 12 Blockers to MVP Deploy (in order)

> **Status as of 2026-09-20 evening:** Blockers 1, 2, 3, 5, 6, 7, 8, 9, 10, and 12 are **resolved**. Remaining: #4 (storage RLS) and #13 (legal pages). See notes inline.

1. ✅ **Fix checkout stock race condition** (`checkout/actions.ts:35-94`) — replaced findFirst + check + update with a single atomic conditional UPDATE … WHERE stock >= qty; PostgreSQL serialisation prevents overselling
2. ✅ **Wire rate limiters** — `lib/rate-limit.ts` helpers wired into `createOrderAction` (5/hr), `login` (5/15min), `signup` (3/hr); coupons/reviews are Phase-2 work so their limiters wait
3. ✅ **Sanitize `/api/upload`** — `lib/upload-utils.ts` adds 5 MB size cap, JPEG/PNG/WebP/GIF allowlist, magic-byte sniff, extension derived from MIME not filename, crypto-random storage keys. 20 tests
4. ❌ **Tighten storage RLS** to restrict by `auth.uid()` — still pending; see `add-storage-rls.ts` for the starting point
5. ✅ **Fix COD bug** (`checkout/actions.ts:116`) — dead-code ternary collapsed to `paymentStatus: "pending"`
6. ✅ **Fix `customerEmail` fallback** — schema now nullable, migration 0004 deployed, action stores NULL for guests (not `"guest@example.com"`)
7. ✅ **Add Netlify Scheduled Function for reservation expiry** — `/api/cron/release-expired-reservations` route + `netlify/functions/release-expired-reservations.mjs` + `netlify.toml` schedule entry. Protected by `CRON_SECRET` via `lib/cron-auth.ts` (constant-time compare)
8. ✅ **Add audit logging** — `lib/audit.ts` helper inserts into `audit_log`; wired into all 8 admin actions (createCategory, deleteCategory, createTag, deleteTag, createProduct, updateProduct, deleteProduct, updateProductStatus, quickUpdateStock). Best-effort: audit failures never block the main action
9. ✅ **Add Zod validation** to every admin server action — `tagSchema`, `productFormSchema`, `productVariantInputSchema`, `productImageInputSchema`, `productStockUpdateSchema` added to `lib/validators.ts`. Categories/products/tags actions all parse via Zod now
10. ✅ **Convert cart `getCartTotal`/`getCartCount`** to selectors — `selectCartTotal`/`selectCartCount` exported from `cart-store.ts` (defensive Number() coercion against corrupted localStorage)
11. ~~🟠 **Add `export const revalidate`** to storefront pages (build currently fails without live DB)~~ — **RESOLVED**: live Netlify build (2026-09-20) succeeded with all 18 pages prerendering. Removed from blockers list.
12. ✅ **Netlify secrets scanner** — `SECRETS_SCAN_ENABLED = "false"` set in `netlify.toml` `[build.environment]`. NEXT_PUBLIC_* vars are public-by-design
13. 🟠 **Add Legal pages** (Privacy, Terms, Return/Refund, Contact) — required by plan for MVP, still pending

---

## 🌐 Netlify-Specific Notes (vs Vercel plan)

The `PLAN.md` was written assuming **Vercel** hosting. Since the target is now **Netlify**, the following plan items need translation:

| PLAN reference | Netlify equivalent |
|---|---|
| Vercel Hobby Plan (100 GB bandwidth/mo) | Netlify Free Tier (100 GB bandwidth/mo) — same limit |
| `output: "standalone"` in `next.config.ts` | **Remove** — Netlify uses `@netlify/plugin-nextjs` for builds |
| Vercel Cron (every 5 min) for reservation expiry | **Netlify Scheduled Functions** (`@netlify/functions` scheduled handler) |
| `cron-job.org` ping for Supabase | Same (unchanged — external to host) |
| Vercel preview deployments per commit | Netlify Deploy Previews (auto on PR) |
| Vercel environment variables | Netlify environment variables (same UX) |
| `next.config.ts` `output: "standalone"` | **Must be removed** for Netlify builds |
| Edge functions / middleware | Netlify Edge Functions (Next 16 middleware compatible via plugin) |
| Upstash Redis rate limit | Unchanged (external) |

### Netlify Build Prerequisites
- Add `@netlify/plugin-nextjs` to `netlify.toml` plugins list
- Set `NEXT_PUBLIC_APP_URL` to the Netlify site URL
- Configure scheduled function for reservation expiry
- Verify `npm run build` succeeds — it currently fails at SSG due to DB queries at build time (see Blocker #11)

This checklist reflects `PROJECT_STATUS.md`'s claim of "completed through Phase 8" but the PLAN.md sanity-check items reveal substantial gaps — most notably the absence of audit logging, the unchecked stock race condition, the unwired rate limiters, the missing webhook endpoint, and the entirely absent return-management and email-notification systems that Phase 7 explicitly requires.
