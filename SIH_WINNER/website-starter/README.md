# HarvestLink — Direct Farm-to-Market Platform (Supabase Integrated)

> **From Farm. Direct to Market.**
> A production-grade agricultural digital marketplace connecting farmers, FPOs, and cooperatives directly with consumers and bulk buyers across India.

---

## 🚀 Overview

HarvestLink is integrated with **Supabase (PostgreSQL + Auth + Row Level Security)**. The application features real user authentication, database-persisted shopping carts, atomic checkout with real-time inventory decrements, role-based dashboards, and a 3-language localized dictionary interface (English, Gujarati, Hindi).

---

## 🔑 Supabase Credentials & Configuration

The frontend connects directly to Supabase using the public publishable anon key:

| Key | Value |
|---|---|
| **Supabase URL** | `https://qywdstxkrllvbozivgod.supabase.co` |
| **Supabase Publishable Key** | `sb_publishable_mQQSelQfXSJviBJs9lANRg_rd1sFf16` |

> **Security Note**: In accordance with Supabase best practices, only the publishable key is used client-side. Privileged credentials like `service_role` keys and database passwords are **never** exposed in frontend code. Authorization and data segregation are strictly enforced at the database level via PostgreSQL Row Level Security (RLS).

An environment template is provided in `.env.example`.

---

## 🛠️ Database Setup (SQL Execution)

To initialize the database tables, triggers, RPC functions, and seed data:

1. Open your [Supabase Dashboard](https://supabase.com/dashboard/project/qywdstxkrllvbozivgod).
2. Navigate to the **SQL Editor** on the left menu.
3. Open and run [`supabase/schema.sql`](supabase/schema.sql):
   - Creates tables: `public.profiles`, `public.products`, `public.cart_items`, `public.orders`, `public.order_items`.
   - Creates atomic stock decrement function: `decrement_product_stock(p_product_id, p_qty)`.
   - Creates automatic profile creation trigger on `auth.users`: `handle_new_user()`.
   - Enables Row Level Security (RLS) on all tables with strict access policies.
4. Open and run [`supabase/seed.sql`](supabase/seed.sql):
   - Seeds authentic Indian agricultural produce (Lokwan Wheat, Gir Kesar Mango, Desi Tomatoes, Mahuva Onion, Deesa Potatoes, Turmeric, Toor Dal, Gir Cow Milk, etc.).
   - Seeds demo accounts in `auth.users` and `public.profiles` for immediate testing.

---

## 👥 Demo Accounts for Immediate Testing

After running `supabase/seed.sql`, the following accounts are ready to sign in (Password for all: `Farmer@123`):

| Role | Email | Password | Dashboard |
|---|---|---|---|
| **Farmer** | `ramesh.patel@harvestlink.org` | `Farmer@123` | `dashboard.html` |
| **FPO** | `anand.fpo@harvestlink.org` | `Farmer@123` | `dashboard-fpo.html` |
| **Bulk Buyer** | `priya.sharma@harvestlink.org` | `Farmer@123` | `dashboard-bulk.html` |

---

## 🏛️ Architecture & Modular Structure

```
website-starter/
├── index.html               # Main landing page
├── marketplace.html         # Live database product catalog with search, filter, sort
├── product.html             # Product detail page with real-time stock & Add-to-Cart
├── cart.html                # Database cart management & checkout
├── order-tracking.html      # Real-time order timeline & details
├── login.html               # Supabase email/password sign-in & demo login
├── signup.html              # Real multi-step Supabase signup
├── role-select.html         # Role picker for onboarding
├── dashboard.html           # Farmer dashboard (live metrics, products CRUD, incoming orders)
├── dashboard-fpo.html       # FPO dashboard
├── dashboard-bulk.html      # Bulk buyer dashboard
├── js/
│   ├── supabase.js          # Centralized Supabase client singleton
│   ├── i18n.js              # Pure dictionary translation engine (EN, GU, HI)
│   ├── auth.js              # Supabase Auth, session persistence, role routing, page guards
│   ├── products.js          # Live Supabase product queries & seller management
│   ├── cart.js              # Supabase cart_items persistence with guest migration
│   ├── orders.js            # Checkout transaction & atomic inventory decrement
│   └── dashboard.js         # Real dashboard metrics and seller product listings
├── supabase/
│   ├── schema.sql           # Complete PostgreSQL schema + RLS policies + RPC
│   └── seed.sql             # Authentic produce & verified demo accounts
├── .env.example             # Environment configuration template
├── style.css                # Global styles & design system
└── features.css             # Page-specific feature layouts
```

---

## 🛡️ Row Level Security (RLS) Policies

Every PostgreSQL table has RLS enabled with explicit policies:

1. **`profiles`**:
   - `SELECT`: Publicly readable (to display farmer/seller name and farm info on marketplace cards).
   - `INSERT` / `UPDATE`: Restricted to `auth.uid() = id`.
2. **`products`**:
   - `SELECT`: Anyone can view active listings; sellers can also view their inactive listings.
   - `INSERT` / `UPDATE` / `DELETE`: Restricted to authenticated seller matching `seller_id = auth.uid()`.
3. **`cart_items`**:
   - `SELECT`, `INSERT`, `UPDATE`, `DELETE`: Restricted strictly to `user_id = auth.uid()`. Users cannot view or modify another user's cart.
4. **`orders`**:
   - `SELECT`: Buyers can read their own orders; sellers can view orders containing their produce.
   - `INSERT`: Restricted to `buyer_id = auth.uid()`.
5. **`order_items`**:
   - `SELECT`: Accessible only to the order buyer or the seller of the specific product.
   - `INSERT`: Allowed when creating order items for `auth.uid() = orders.buyer_id`.

---

## 🌐 Language Localization (English, Gujarati, Hindi)

- **Supported Languages**: Strictly `en` (English), `gu` (Gujarati), and `hi` (Hindi).
- **Architecture**: Pure dictionary-based translation system in `js/i18n.js` using `data-i18n` and standard translation keys.
- **Persistence**: Saved in `localStorage('hl_lang')`. The preference remains preserved across refreshes, navigation, and dashboards.
- **Zero Google Translate UI**: All intrusive Google Translate frames, top bars, toolbars, and tooltips are suppressed, preventing any body top shifts or layout flickers.
- **Bidirectional Switching**: Works seamlessly in all directions:
  `EN ↔ GU`, `GU ↔ HI`, `HI ↔ EN`.

---

## 💻 Local Development

1. Serve the `website-starter` folder using any local HTTP static server:
   ```bash
   npx serve -l 52756 .
   # or
   python -m http.server 52756
   ```
2. Open `http://localhost:52756/` in your browser.

---

## 🧪 Verification & Testing Checklist

- [x] **Authentication**:
  - Sign in with `ramesh.patel@harvestlink.org` / `Farmer@123`.
  - Verify session persistence on page refresh.
  - Sign out and verify redirection to `index.html`.
  - Try invalid password and verify friendly error toast.
- [x] **Marketplace**:
  - Real products loaded from Supabase `products`.
  - Search by crop name (e.g., "Wheat", "Mango", "Tomato").
  - Filter by Category, Practice, Price Range, and Sorting.
- [x] **Cart & Checkout**:
  - Add product to cart.
  - Verify persistence after page refresh and across tabs.
  - Proceed to checkout -> verify order creation in `orders` and `order_items`.
  - Verify atomic stock decrement via `decrement_product_stock`.
  - Verify cart is automatically cleared upon successful order.
- [x] **Seller Dashboard**:
  - Farmer dashboard displays real listings, stock counts, and sales metrics.
  - Add new product listing -> instantly appears on marketplace.
- [x] **Language System**:
  - Switch between English, Gujarati, and Hindi.
  - Verify dropdown updates and text translates instantaneously with zero layout shifts.
