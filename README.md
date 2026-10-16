# 🍒 CherrySo — Modern Full-Stack E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-PostgreSQL-C5F74F?style=flat-square&logo=drizzle)](https://orm.drizzle.team/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_Storage-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Netlify](https://img.shields.io/badge/Deployed_on-Netlify-00C7B7?style=flat-square&logo=netlify)](https://www.netlify.com/)

CherrySo is a high-performance, full-stack e-commerce platform built for modern online retail in Bangladesh. Engineered with **Next.js 15 (App Router)**, **Drizzle ORM**, **Supabase**, and **Tailwind CSS v4**, CherrySo provides an intuitive shopping experience for customers and a rapid backoffice workflow for administrators.

---

## 🌟 Key Features

### 🛍️ Customer Experience & Storefront
- **High-Performance Catalog:** Server-rendered product listings with instant category filtering, tag search, and responsive image galleries.
- **Persistent Shopping Cart:** Client-side cart backed by **Zustand** with local storage synchronization and stock validation.
- **Frictionless Guest Checkout:** Customers can place orders without forcing upfront account creation.
- **Flexible Bangladeshi Payments:**
  - **Mobile Financial Services (MFS):** Dynamic bKash and Nagad payment flows with sender number and Transaction ID (TrxID) verification.
  - **Cash on Delivery (COD):** Low-friction ordering with automated order verification prompts.
- **Intelligent Delivery Zones:** Automated shipping fee calculation across **Inside Dhaka**, **Sub-Dhaka**, and **Outside Dhaka**, plus a graceful fallback for unlisted zones.

### 🛡️ Admin Backoffice & Operations
- **Role-Based Access Control (RBAC):** Granular permissions ensuring only authenticated administrators can access management routes.
- **Product Catalog Management:** Multi-image uploads directly to Supabase Storage, variant management, rich descriptions, and inventory tracking.
- **Fast Order Processing:** 1-click status updates (`QuickOrderConfirm`, `QuickShippingEdit`) to minimize operational friction.
- **Steadfast Courier Integration:** Direct parcel booking via the Steadfast Courier API and incoming webhook synchronization for automated tracking.
- **Dynamic Payment Configurations:** Toggle or edit MFS numbers (bKash/Nagad) from the admin dashboard without redeploying code.

### ⚡ Architecture & Performance
- **Drizzle ORM + PostgreSQL:** Type-safe database queries with zero-overhead relational modeling.
- **Upstash Redis Rate Limiting:** Abuse protection on checkout endpoints, authentication attempts, and order submissions.
- **Input Validation:** Strict type enforcement with **Zod** across both server actions and client forms.
- **Netlify Scheduled Functions:** Background cron jobs for automated reconciliation and cleanup tasks.

---

## 🛠️ Tech Stack

| Domain | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, Server Actions, Turbopack) |
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Shadcn UI / Radix |
| **State Management** | Zustand (persistent client cart) & TanStack React Query v5 |
| **Database & ORM** | PostgreSQL via Supabase, Drizzle ORM, Drizzle Kit |
| **Auth & Storage** | Supabase Auth (SSR session management), Supabase Storage Buckets |
| **Courier & Logistics** | Steadfast Courier API + Webhooks |
| **Security & Rate Limiting**| Upstash Redis (`@upstash/ratelimit`), Supabase RLS |
| **Testing** | Vitest, React Testing Library, JSDOM |
| **Deployment** | Netlify (Next Runtime + Netlify Scheduled Functions) |

---

## 📁 Repository Structure

```
cherryso/
├── app/ or src/app/          # Next.js App Router (pages, API routes, server actions)
│   ├── (store)/              # Customer-facing storefront routes
│   ├── admin/                # Admin backoffice dashboard
│   ├── api/                  # REST endpoints (webhooks, cron jobs, courier sync)
│   └── layout.tsx            # Root layout with global providers
├── src/
│   ├── components/           # UI components (Shadcn primitives, header, cart, product card)
│   ├── db/                   # Drizzle schema definitions, relations, and DB client
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities (auth helpers, courier clients, rate limiters)
│   └── stores/               # Zustand state stores (cart, filters)
├── supabase/
│   └── migrations/           # Database migration files and RLS policies
├── drizzle.config.ts         # Drizzle ORM configuration
├── netlify.toml              # Netlify build and scheduled function config
├── .env.local.example        # Environment variables template
└── vitest.config.ts          # Unit and integration test setup
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher
- **Package Manager**: `npm`, `pnpm`, or `yarn`
- **PostgreSQL Database** (e.g., Supabase instance)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/ashikonik/cherryso.git
cd cherryso
npm install
```

### 2. Configure Environment Variables
Copy the example environment configuration and fill in your credentials:
```bash
cp .env.local.example .env.local
```

Key variables required:
```env
# Database & Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=postgres://...

# Courier (Steadfast)
STEADFAST_API_KEY=your_api_key
STEADFAST_SECRET_KEY=your_secret_key
STEADFAST_BASE_URL=https://portal.steadfast.com.bd/api/v1
STEADFAST_WEBHOOK_SECRET=your_webhook_secret

# Rate Limiting (Optional for local dev)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# Cron Secret
CRON_SECRET=generate_with_openssl_rand_hex_32
```

### 3. Apply Database Migrations
Push Drizzle schema migrations to your database:
```bash
npx drizzle-kit push
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the storefront.

---

## 🧪 Testing

Run unit and component tests with Vitest:
```bash
npm run test
```

---

## 🚢 Deployment

CherrySo is configured for automated builds on **Netlify**:

1. Connect the repository to Netlify.
2. Ensure environment variables from `.env.local.example` are set in the Netlify site settings.
3. Configure the Next.js runtime plugin (`@netlify/plugin-nextjs`).
4. Scheduled cron functions (under `netlify/functions/`) will automatically trigger background reconciliation tasks according to `netlify.toml`.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
