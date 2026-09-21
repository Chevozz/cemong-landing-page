-- ============================================
-- 002: Admin Authorization & Storage RLS
-- ============================================

-- Helper function: check if current authenticated user is an admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.admin_profiles
    where user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- ============================================
-- Products RLS
-- ============================================

-- Admins can view ALL products (including is_available = false)
create policy "Admins can view all products" on public.products
  for select using (public.is_admin());

-- Admins can insert products
create policy "Admins can insert products" on public.products
  for insert with check (public.is_admin());

-- Admins can update products
create policy "Admins can update products" on public.products
  for update using (public.is_admin()) with check (public.is_admin());

-- Admins can delete products
create policy "Admins can delete products" on public.products
  for delete using (public.is_admin());

-- ============================================
-- Product Categories RLS
-- ============================================

create policy "Admins can insert categories" on public.product_categories
  for insert with check (public.is_admin());

create policy "Admins can update categories" on public.product_categories
  for update using (public.is_admin()) with check (public.is_admin());

create policy "Admins can delete categories" on public.product_categories
  for delete using (public.is_admin());

-- ============================================
-- Product Images RLS
-- ============================================

-- Admins can view all product images
create policy "Admins can view all product images" on public.product_images
  for select using (public.is_admin());

create policy "Admins can insert product images" on public.product_images
  for insert with check (public.is_admin());

create policy "Admins can update product images" on public.product_images
  for update using (public.is_admin()) with check (public.is_admin());

create policy "Admins can delete product images" on public.product_images
  for delete using (public.is_admin());

-- ============================================
-- Supabase Storage: product-images bucket
-- ============================================

-- Create product-images bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- Public can read images from product-images bucket
create policy "Public can view product images storage" on storage.objects
  for select using (bucket_id = 'product-images');

-- Only admins can upload images to product-images bucket
create policy "Admins can upload product images storage" on storage.objects
  for insert with check (
    bucket_id = 'product-images' and public.is_admin()
  );

-- Only admins can update images in product-images bucket
create policy "Admins can update product images storage" on storage.objects
  for update using (
    bucket_id = 'product-images' and public.is_admin()
  );

-- Only admins can delete images in product-images bucket
create policy "Admins can delete product images storage" on storage.objects
  for delete using (
    bucket_id = 'product-images' and public.is_admin()
  );
