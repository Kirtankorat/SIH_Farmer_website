-- ==============================================================================
-- HARVESTLINK — SUPABASE POSTGRESQL DATABASE SCHEMA
-- Direct Farm-to-Market Platform with Row-Level Security (RLS)
-- Safe to execute in Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- Enable required extensions
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE (linked to Supabase auth.users)
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  role text not null default 'farmer' check (
    role in ('farmer', 'fpo', 'cooperative', 'agri_entrepreneur', 'individual_buyer', 'bulk_buyer', 'admin')
  ),
  avatar_url text,
  farm_name text,
  business_name text,
  address text,
  village text,
  city text,
  district text,
  state text default 'Gujarat',
  pincode text,
  farm_size_acres numeric(10, 2),
  farming_practice text default 'organic' check (
    farming_practice in ('organic', 'natural', 'conventional')
  ),
  primary_crops text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Index for fast lookup by role & email
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_email on public.profiles(email);

-- ------------------------------------------------------------------------------
-- 2. PRODUCTS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  category text not null check (
    category in ('vegetables', 'fruits', 'grains', 'pulses', 'spices', 'dairy', 'cotton', 'oilseeds', 'other')
  ),
  subcategory text,
  farming_practice text not null default 'organic' check (
    farming_practice in ('organic', 'natural', 'conventional')
  ),
  price numeric(10, 2) not null check (price >= 0),
  unit text not null default 'kg',
  quantity_available numeric(10, 2) not null default 0 check (quantity_available >= 0),
  minimum_order_quantity numeric(10, 2) default 1 check (minimum_order_quantity > 0),
  image_url text,
  emoji text default '🌾',
  location text default 'Gujarat, India',
  status text not null default 'active' check (
    status in ('active', 'inactive', 'out_of_stock')
  ),
  rating numeric(2, 1) default 4.5 check (rating >= 1.0 and rating <= 5.0),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_products_seller on public.products(seller_id);
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_practice on public.products(farming_practice);
create index if not exists idx_products_status on public.products(status);

-- ------------------------------------------------------------------------------
-- 3. CART ITEMS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity numeric(10, 2) not null default 1 check (quantity > 0),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  constraint uq_cart_user_product unique (user_id, product_id)
);

create index if not exists idx_cart_user on public.cart_items(user_id);

-- ------------------------------------------------------------------------------
-- 4. ORDERS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (
    status in ('pending', 'confirmed', 'packed', 'in_transit', 'delivered', 'cancelled')
  ),
  subtotal numeric(10, 2) not null default 0 check (subtotal >= 0),
  delivery_charge numeric(10, 2) not null default 40 check (delivery_charge >= 0),
  discount numeric(10, 2) not null default 0 check (discount >= 0),
  total_amount numeric(10, 2) not null check (total_amount >= 0),
  shipping_name text not null,
  shipping_phone text not null,
  shipping_address text not null,
  shipping_city text default 'Anand',
  shipping_state text default 'Gujarat',
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_orders_buyer on public.orders(buyer_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_number on public.orders(order_number);

-- ------------------------------------------------------------------------------
-- 5. ORDER ITEMS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  seller_id uuid not null references public.profiles(id),
  product_name text not null,
  quantity numeric(10, 2) not null check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  total_price numeric(10, 2) not null check (total_price >= 0),
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_order_items_seller on public.order_items(seller_id);

-- ------------------------------------------------------------------------------
-- 6. ATOMIC INVENTORY DECREMENT RPC (prevents race conditions & negative stock)
-- ------------------------------------------------------------------------------
create or replace function public.decrement_product_stock(
  p_product_id uuid,
  p_qty numeric
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_current numeric;
begin
  select quantity_available into v_current
  from public.products
  where id = p_product_id for update;

  if not found then
    raise exception 'Product not found';
  end if;

  if v_current < p_qty then
    raise exception 'Insufficient stock available';
  end if;

  update public.products
  set quantity_available = quantity_available - p_qty,
      status = case when (quantity_available - p_qty) <= 0 then 'out_of_stock' else status end,
      updated_at = timezone('utc'::text, now())
  where id = p_product_id;

  return true;
end;
$$;

-- ------------------------------------------------------------------------------
-- 7. AUTOMATIC PROFILE CREATION TRIGGER (runs when a user registers in auth.users)
-- ------------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    phone,
    role,
    farm_name,
    business_name,
    village,
    state,
    farming_practice,
    farm_size_acres
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'farmer'),
    new.raw_user_meta_data->>'farm_name',
    new.raw_user_meta_data->>'business_name',
    new.raw_user_meta_data->>'village',
    coalesce(new.raw_user_meta_data->>'state', 'Gujarat'),
    coalesce(new.raw_user_meta_data->>'farming_practice', 'organic'),
    (new.raw_user_meta_data->>'farm_size_acres')::numeric
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    phone = coalesce(excluded.phone, profiles.phone),
    role = coalesce(excluded.role, profiles.role),
    updated_at = timezone('utc'::text, now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- PROFILES POLICIES
-- Anyone can view seller profiles (public info on marketplace)
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- Authenticated users can insert their own profile
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users can update only their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- PRODUCTS POLICIES
-- Anyone can view active products
create policy "Active products are viewable by everyone"
  on public.products for select
  using (status = 'active' or seller_id = auth.uid());

-- Authenticated sellers can insert their own products
create policy "Sellers can insert their own products"
  on public.products for insert
  with check (auth.uid() = seller_id);

-- Sellers can update only their own products
create policy "Sellers can update their own products"
  on public.products for update
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

-- Sellers can delete only their own products
create policy "Sellers can delete their own products"
  on public.products for delete
  using (auth.uid() = seller_id);

-- CART ITEMS POLICIES
-- Users can read only their own cart items
create policy "Users can view their own cart items"
  on public.cart_items for select
  using (auth.uid() = user_id);

-- Users can insert items into their own cart
create policy "Users can insert their own cart items"
  on public.cart_items for insert
  with check (auth.uid() = user_id);

-- Users can update only their own cart items
create policy "Users can update their own cart items"
  on public.cart_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can delete only their own cart items
create policy "Users can delete their own cart items"
  on public.cart_items for delete
  using (auth.uid() = user_id);

-- ORDERS POLICIES
-- Buyers can view their own orders; sellers can view orders containing their items
create policy "Users can view their own orders"
  on public.orders for select
  using (
    auth.uid() = buyer_id
    or id in (select order_id from public.order_items where seller_id = auth.uid())
  );

-- Buyers can create their own orders
create policy "Buyers can insert their own orders"
  on public.orders for insert
  with check (auth.uid() = buyer_id);

-- Buyers and sellers involved can update order status
create policy "Involved parties can update orders"
  on public.orders for update
  using (
    auth.uid() = buyer_id
    or id in (select order_id from public.order_items where seller_id = auth.uid())
  );

-- ORDER ITEMS POLICIES
-- Buyers and sellers can view order items
create policy "Involved parties can view order items"
  on public.order_items for select
  using (
    seller_id = auth.uid()
    or order_id in (select id from public.orders where buyer_id = auth.uid())
  );

-- Authenticated users placing an order can insert order items
create policy "Order creators can insert order items"
  on public.order_items for insert
  with check (
    order_id in (select id from public.orders where buyer_id = auth.uid())
  );
