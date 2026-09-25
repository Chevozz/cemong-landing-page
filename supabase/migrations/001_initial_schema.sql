-- Cem'ong Database Schema
-- Based on schema.md

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- Tables
-- ============================================

-- Product Categories
create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  slug varchar(120) not null unique,
  created_at timestamptz not null default now()
);

-- Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.product_categories(id) on delete restrict,
  name varchar(160) not null,
  slug varchar(180) not null unique,
  description text,
  price integer not null check (price >= 0),
  pcs integer not null check (pcs > 0),
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Product Images
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  is_primary boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now()
);

-- Admin Profiles (Phase 2)
create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name varchar(120),
  created_at timestamptz not null default now()
);

-- ============================================
-- Indexes
-- ============================================

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_is_available_idx on public.products(is_available);
create index if not exists product_images_product_id_idx on public.product_images(product_id);

-- ============================================
-- RLS Policies
-- ============================================

-- Enable RLS
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.admin_profiles enable row level security;

-- Product Categories: Public read
create policy "Public can view categories" on public.product_categories
  for select using (true);

-- Products: Public can view available products
create policy "Public can view available products" on public.products
  for select using (is_available = true);

-- Product Images: Public can view images of available products
create policy "Public can view product images" on public.product_images
  for select using (
    exists (
      select 1 from public.products
      where products.id = product_images.product_id
      and products.is_available = true
    )
  );

-- Admin Profiles: Only authenticated users can read their own profile
create policy "Users can read own profile" on public.admin_profiles
  for select using (auth.uid() = user_id);

-- ============================================
-- Functions & Triggers
-- ============================================

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_products_updated
  before update on public.products
  for each row
  execute function public.handle_updated_at();

-- ============================================
-- Seed Data (Development)
-- ============================================

-- Insert categories
insert into public.product_categories (name, slug) values
  ('Keripik', 'keripik'),
  ('Rengginang', 'rengginang')
on conflict (slug) do nothing;

-- Insert sample products
insert into public.products (category_id, name, slug, description, price, pcs, is_available)
values
  ((select id from public.product_categories where slug = 'keripik'), 'Keripik Talas Gurih', 'keripik-talas-gurih', 'Keripik ubi talas yang renyah dengan bumbu gurih khas.', 25000, 10, true),
  ((select id from public.product_categories where slug = 'keripik'), 'Keripik Talas Pedas', 'keripik-talas-pedas', 'Keripik ubi talas dengan rasa pedas yang pas.', 27000, 10, true),
  ((select id from public.product_categories where slug = 'rengginang'), 'Rengginang Original', 'rengginang-original', 'Rengginang tradisional dengan tekstur renyah dan rasa gurih.', 22000, 10, true),
  ((select id from public.product_categories where slug = 'rengginang'), 'Rengginang Jagung', 'rengginang-jagung', 'Rengginang campuran jagung manis dengan rasa khas.', 24000, 10, false)
on conflict (slug) do nothing;

-- Insert placeholder images for products
insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, '/placeholder-product.svg', true, 0
from public.products
on conflict do nothing;
