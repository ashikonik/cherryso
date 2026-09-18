# 🍒 CherrySo - Project Status Report
**Generated on:** September 18, 2026

## 1. Current Progress & Completed Phases

The project has maintained a rapid development velocity and is currently in the middle of **Phase 7**. The following phases have been fully executed:

- ✅ **Phase 0: Project Setup** (Next.js 15, Turbopack, Tailwind, Shadcn UI setup)
- ✅ **Phase 1: Database & Storage Base** (Drizzle ORM, Postgres schemas)
- ✅ **Phase 2: Authentication & Roles** (Supabase Auth, Role-based access control)
- ✅ **Phase 3: Admin Dashboard Core** (Products, Categories, Tags, Metrics)
- ✅ **Phase 4: Storefront Browsing** (Product listings, dynamic image galleries, category filtering)
- ✅ **Phase 5: Cart & Guest Checkout** (Zustand persistent cart, robust guest checkout flow)
- ✅ **Phase 6: Manual Payment System** (Dynamic bKash, Nagad, COD handling)
- 🚧 **Phase 7: Order Management** (Orders list, instant status toggles, shipping edits)

---

## 2. New Decisions & Deviations from Original Plan

Several strategic architectural decisions were made during development that differ from the initial `PLAN.md`:

1. **Supabase Storage over Cloudflare R2:** 
   - *Decision:* We opted out of Cloudflare R2 to utilize Supabase Storage. 
   - *Reason:* Keeps the architecture unified under a single provider (Supabase for Auth, DB, and Storage), reducing integration complexity and points of failure.
2. **Dynamic Payment Configurations:**
   - *Decision:* Rather than hardcoding payment methods into the checkout form, we built a dynamic `siteSettings` architecture.
   - *Reason:* Admins can now add, disable, or modify payment methods (bKash, Nagad, etc.) directly from the admin dashboard without requiring code deployments.
3. **"Not Sure" Shipping Zone:**
   - *Decision:* Added a `0.00` base rate "Not Sure / Other Area" option.
   - *Reason:* Prevents cart abandonment when users don't know their zone. The UI gracefully adapts to say `(Calculated later)`, and admins can manually adjust the zone later via the dashboard.
4. **Instant Admin Edits:**
   - *Decision:* Bypassed traditional separate "Edit Pages" for standard order actions.
   - *Reason:* We implemented `QuickOrderConfirm` and `QuickShippingEdit` directly in the dashboard tables, allowing 1-click status and shipping updates to heavily reduce admin friction.

---

## 3. Bugs Found & Fixed

Throughout development, we executed rigorous sanity checks and eliminated several critical vulnerabilities:

- **Cart `NaN` Calculation Bug:** Complex UI re-renders with the "Not Sure" shipping zone caused the checkout math to occasionally output `NaN`. Fixed by wrapping the entire Zustand calculation engine in strict number enforcement (`Number() || 0`).
- **Negative Stock Vulnerability:** The admin dashboard lacked boundaries, allowing admins to set stock to `-5`. Fixed by enforcing `Math.max(0)` on the frontend and relying on the Postgres `CHECK (stock >= 0)` constraint on the backend.
- **Select Component `innerText` Extraction Glitch:** The UI library (`@base-ui/react`) was attempting to extract raw React component `innerText` (and sometimes rendering raw UUIDs) from the Dropdown elements on the Checkout and Admin pages. Fixed by injecting a custom Render Function into the `<SelectValue>` component to manually enforce proper text formatting.
- **Admin Users Counted as Customers:** The dashboard metrics mistakenly included admins in the "Total Registered Customers" count. Fixed by implementing a strict SQL `LEFT JOIN` to filter explicitly by `roles.role = 'customer'`.
- **Missing Order Notes:** The checkout form collected "Special Instructions", but the backend discarded them because the database lacked the column. Fixed by running a schema migration to add `customerNotes` to the `orders` table and wiring it into the server action.

---

## 4. Core Logic & Sanity Check Findings

A comprehensive review of the active codebase confirms high structural integrity:

- 🛡️ **Zero-Trust Pricing:** The frontend cart total is entirely ignored during checkout. The server securely re-fetches exact prices from the database for every single item before calculating the final subtotal.
- 🛡️ **Atomic Stock Reservation:** Stock reduction happens natively inside the database transaction (`sql`stock - quantity``) and is protected by `CHECK (stock >= 0)`. If two users check out the last item simultaneously, the database will safely abort one of the transactions. Race conditions are structurally impossible.
- 🛡️ **Transaction Integrity:** Payments and orders are created within a singular database transaction. Partial failures (e.g., order created but items missing) cannot occur.

---

## 5. Next Steps

We are currently at **Phase 7**. The immediate next steps to achieve MVP are:

- ✅ **Phase 7.2:** Auto-Generate HTML Invoices/Receipts.
- ✅ **Phase 7.3:** Detailed Order View Page for Admins.
- ✅ **Phase 8:** Steadfast Courier Integration.
- [ ] 🚀 **MVP DEPLOYMENT.**
