import { supabase } from "./client";
import type { ProductWithRelations, ProductCategory, ProductImage } from "@/types/database";

export function sortProductImages(images: ProductImage[] = []): ProductImage[] {
  return [...images].sort((a, b) => {
    // Primary first
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    // Then by sort_order ascending
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });
}

export function getPrimaryImageUrl(images: ProductImage[] = []): string {
  const sorted = sortProductImages(images);
  return sorted[0]?.image_url || "/placeholder-photo.svg";
}

export async function getProducts(): Promise<ProductWithRelations[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:product_categories(*),
      images:product_images(*)
    `)
    .order("created_at", { ascending: false });

  if (error || !data) {
    if (error) console.error("Error fetching products:", error.message);
    return [];
  }

  return data.map((product) => {
    const category = Array.isArray(product.category)
      ? product.category[0]
      : product.category;
    const rawImages = Array.isArray(product.images) ? product.images : [];

    return {
      ...product,
      category: category as ProductCategory,
      images: sortProductImages(rawImages as ProductImage[]),
    };
  });
}

export async function getAvailableProducts(): Promise<ProductWithRelations[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:product_categories(*),
      images:product_images(*)
    `)
    .eq("is_available", true)
    .order("created_at", { ascending: false });

  if (error || !data) {
    if (error) console.error("Error fetching available products:", error.message);
    return [];
  }

  return data.map((product) => {
    const category = Array.isArray(product.category)
      ? product.category[0]
      : product.category;
    const rawImages = Array.isArray(product.images) ? product.images : [];

    return {
      ...product,
      category: category as ProductCategory,
      images: sortProductImages(rawImages as ProductImage[]),
    };
  });
}

export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:product_categories(*),
      images:product_images(*)
    `)
    .eq("slug", slug)
    .single();

  if (error || !data) {
    if (error) console.error("Error fetching product:", error.message);
    return null;
  }

  const category = Array.isArray(data.category)
    ? data.category[0]
    : data.category;
  const rawImages = Array.isArray(data.images) ? data.images : [];

  return {
    ...data,
    category: category as ProductCategory,
    images: sortProductImages(rawImages as ProductImage[]),
  };
}

export async function getCategories(): Promise<ProductCategory[]> {
  const { data, error } = await supabase
    .from("product_categories")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching categories:", error.message);
    return [];
  }

  return data ?? [];
}
