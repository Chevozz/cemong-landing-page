-- Rename weight_grams -> pcs (jumlah pcs per produk, harga per pcs)
alter table public.products rename column weight_grams to pcs;
alter table public.products rename constraint products_weight_grams_check to products_pcs_positive;
