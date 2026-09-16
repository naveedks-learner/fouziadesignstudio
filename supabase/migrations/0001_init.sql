-- Fouzia Design Studio — initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh project.
--
-- After running this, go to Project Settings -> Data API -> "Exposed schemas"
-- in the Supabase dashboard and add `fouzia_design_studio` (Supabase only
-- exposes `public` and `graphql_public` to the API by default).

-- ---------------------------------------------------------------------------
-- Extensions & schema
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

create schema if not exists fouzia_design_studio;

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table if not exists fouzia_design_studio.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table if not exists fouzia_design_studio.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  category_id uuid references fouzia_design_studio.categories(id) on delete set null,
  price numeric(10, 2) not null,
  sizes text[] not null default '{}',
  images text[] not null default '{}',
  stock integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists products_category_id_idx on fouzia_design_studio.products(category_id);
create index if not exists products_active_idx on fouzia_design_studio.products(active);

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists fouzia_design_studio.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  default_address text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function fouzia_design_studio.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = fouzia_design_studio
as $$
begin
  insert into fouzia_design_studio.profiles (id, full_name, is_admin)
  values (new.id, new.raw_user_meta_data ->> 'full_name', false)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure fouzia_design_studio.handle_new_user();

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
create table if not exists fouzia_design_studio.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  total numeric(10, 2) not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on fouzia_design_studio.orders(user_id);

-- ---------------------------------------------------------------------------
-- wishlists
-- ---------------------------------------------------------------------------
create table if not exists fouzia_design_studio.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references fouzia_design_studio.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists wishlists_user_id_idx on fouzia_design_studio.wishlists(user_id);

-- ---------------------------------------------------------------------------
-- helper: is the current user an admin?
-- ---------------------------------------------------------------------------
create or replace function fouzia_design_studio.is_admin()
returns boolean
language sql
security definer set search_path = fouzia_design_studio
stable
as $$
  select coalesce((select is_admin from fouzia_design_studio.profiles where id = auth.uid()), false);
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table fouzia_design_studio.categories enable row level security;
alter table fouzia_design_studio.products enable row level security;
alter table fouzia_design_studio.profiles enable row level security;
alter table fouzia_design_studio.orders enable row level security;
alter table fouzia_design_studio.wishlists enable row level security;

-- categories: public read, admin write
create policy "categories are publicly readable"
  on fouzia_design_studio.categories for select
  using (true);

create policy "admins can manage categories"
  on fouzia_design_studio.categories for all
  using (fouzia_design_studio.is_admin())
  with check (fouzia_design_studio.is_admin());

-- products: public read, admin write
create policy "products are publicly readable"
  on fouzia_design_studio.products for select
  using (true);

create policy "admins can manage products"
  on fouzia_design_studio.products for all
  using (fouzia_design_studio.is_admin())
  with check (fouzia_design_studio.is_admin());

-- profiles: users manage their own row, admins can read all
create policy "users can view own profile"
  on fouzia_design_studio.profiles for select
  using (auth.uid() = id or fouzia_design_studio.is_admin());

create policy "users can update own profile"
  on fouzia_design_studio.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "users can insert own profile"
  on fouzia_design_studio.profiles for insert
  with check (auth.uid() = id);

-- orders: users manage their own orders, admins can read/update all
create policy "users can view own orders"
  on fouzia_design_studio.orders for select
  using (auth.uid() = user_id or fouzia_design_studio.is_admin());

create policy "users can create own orders"
  on fouzia_design_studio.orders for insert
  with check (auth.uid() = user_id);

create policy "admins can update any order"
  on fouzia_design_studio.orders for update
  using (fouzia_design_studio.is_admin())
  with check (fouzia_design_studio.is_admin());

-- wishlists: users manage their own wishlist only
create policy "users can view own wishlist"
  on fouzia_design_studio.wishlists for select
  using (auth.uid() = user_id);

create policy "users can add to own wishlist"
  on fouzia_design_studio.wishlists for insert
  with check (auth.uid() = user_id);

create policy "users can remove from own wishlist"
  on fouzia_design_studio.wishlists for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Let the API roles use the new schema (required alongside exposing it via
-- the dashboard's "Exposed schemas" setting mentioned above).
-- ---------------------------------------------------------------------------
grant usage on schema fouzia_design_studio to anon, authenticated, service_role;
grant all on all tables in schema fouzia_design_studio to anon, authenticated, service_role;
grant all on all sequences in schema fouzia_design_studio to anon, authenticated, service_role;
alter default privileges in schema fouzia_design_studio
  grant all on tables to anon, authenticated, service_role;
