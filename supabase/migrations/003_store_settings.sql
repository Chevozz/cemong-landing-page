-- ============================================
-- 003: Store Settings (single row, admin editable)
-- ============================================

create table if not exists public.store_settings (
  id integer primary key default 1 check (id = 1),
  store_name varchar(120) not null,
  whatsapp_number varchar(20) not null,
  instagram varchar(120),
  address text not null,
  updated_at timestamptz not null default now()
);

alter table public.store_settings enable row level security;

-- Anonymous can read public store settings
create policy "Public can view store settings" on public.store_settings
  for select using (true);

-- Only admins can insert/update settings
create policy "Admins can insert store settings" on public.store_settings
  for insert with check (public.is_admin());

create policy "Admins can update store settings" on public.store_settings
  for update using (public.is_admin()) with check (public.is_admin());

-- Seed with current known values (single row, id = 1)
insert into public.store_settings (id, store_name, whatsapp_number, instagram, address)
values (
  1,
  'Cem''ong',
  '081353908632',
  '@cheltavii',
  'Gang Durian 1, Blok A No. 1, JL. Srikandi, Kecamatan Buleleng, Kabupaten Buleleng, Bali 81119'
)
on conflict (id) do nothing;
