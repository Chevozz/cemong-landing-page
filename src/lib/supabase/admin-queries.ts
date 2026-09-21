import { supabase } from "./client";
import type {
  ProductWithRelations,
  ProductCategory,
  ProductRow,
  ProductImage,
} from "@/types/database";

// ============================================
// Overview Statistics
// ============================================

export interface AdminStats {
  total: number;
  available: number;
  unavailable: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const { data, error } = await supabase
    .from("products")
    .select("is_available");

  if (error || !data) {
    return { total: 0, available: 0, unavailable: 0 };
  }

  const total = data.length;
  const available = data.filter((p) => p.is_available).length;
  const unavailable = total - available;

  return { total, available, unavailable };
}

// ============================================
// Products CRUD
// ============================================

export async function getAllProductsAdmin(): Promise<ProductWithRelations[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:product_categories(*),
      images:product_images(*)
    `)
    .order("created_at", { ascending: false });

  if (error || !data) {
    if (error) console.error("Admin fetch products error:", error.message);
    return [];
  }

  // Sort images per product (primary first, then sort_order ascending)
  const sorted: ProductWithRelations[] = data.map((product) => {
    const category = Array.isArray(product.category)
      ? product.category[0]
      : product.category;
    const rawImages = Array.isArray(product.images) ? product.images : [];

    return {
      ...product,
      category: category as ProductCategory,
      images: (rawImages as ProductImage[]).sort((a, b) => {
        if (a.is_primary) return -1;
        if (b.is_primary) return 1;
        return (a.sort_order ?? 0) - (b.sort_order ?? 0);
      }),
    };
  });

  return sorted;
}

export async function getProductByIdAdmin(id: string): Promise<ProductWithRelations | null> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:product_categories(*),
      images:product_images(*)
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    if (error) console.error("Admin fetch product by id error:", error.message);
    return null;
  }

  const category = Array.isArray(data.category)
    ? data.category[0]
    : data.category;
  const rawImages = Array.isArray(data.images) ? data.images : [];

  const images = (rawImages as ProductImage[]).sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });

  return {
    ...data,
    category: category as ProductCategory,
    images,
  };
}

export async function createProduct(payload: {
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  weight_grams: number;
  is_available: boolean;
}): Promise<{ data: ProductRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from("products")
    .insert([payload])
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function updateProduct(
  id: string,
  payload: {
    category_id?: string;
    name?: string;
    slug?: string;
    description?: string | null;
    price?: number;
    weight_grams?: number;
    is_available?: boolean;
  }
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("products")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function deleteProduct(id: string): Promise<{ error: string | null }> {
  // 1. Fetch images to delete from storage
  const { data: images } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("product_id", id);

  if (images && images.length > 0) {
    const filePaths = images
      .map((img) => extractStoragePath(img.image_url))
      .filter(Boolean) as string[];

    if (filePaths.length > 0) {
      await supabase.storage.from("product-images").remove(filePaths);
    }
  }

  // 2. Delete product (cascade deletes product_images rows in DB)
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

// ============================================
// Product Images
// ============================================

export async function uploadProductImage(
  productId: string,
  file: File,
  isPrimary: boolean = false
): Promise<{ data: ProductImage | null; error: string | null }> {
  // Validate mime type
  if (!file.type.startsWith("image/")) {
    return { data: null, error: "Hanya file gambar yang diperbolehkan (PNG, JPG, WebP)." };
  }

  // Validate size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { data: null, error: "Ukuran gambar maksimal 5 MB." };
  }

  // Sanitize filename
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const cleanName = `${productId}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(cleanName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return { data: null, error: uploadError.message };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("product-images").getPublicUrl(cleanName);

  // If this is set to primary, clear existing primary flags first
  if (isPrimary) {
    await supabase
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", productId);
  }

  // Insert row into product_images table
  const { data, error: insertError } = await supabase
    .from("product_images")
    .insert([
      {
        product_id: productId,
        image_url: publicUrl,
        is_primary: isPrimary,
        sort_order: 0,
      },
    ])
    .select()
    .single();

  if (insertError) {
    return { data: null, error: insertError.message };
  }

  return { data, error: null };
}

export async function setPrimaryImage(
  productId: string,
  imageId: string
): Promise<{ error: string | null }> {
  // Unset all primary for this product
  await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId);

  // Set this one as primary
  const { error } = await supabase
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", imageId);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function deleteProductImage(
  imageId: string,
  imageUrl: string
): Promise<{ error: string | null }> {
  // Delete from storage
  const path = extractStoragePath(imageUrl);
  if (path) {
    await supabase.storage.from("product-images").remove([path]);
  }

  // Delete from DB
  const { error } = await supabase.from("product_images").delete().eq("id", imageId);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function reorderProductImages(
  orderedIds: string[]
): Promise<{ error: string | null }> {
  // Batch update sort orders
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase
      .from("product_images")
      .update({ sort_order: i })
      .eq("id", orderedIds[i]);
  }

  return { error: null };
}

// ============================================
// Categories
// ============================================

export async function getCategoriesAdmin(): Promise<ProductCategory[]> {
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

export async function createCategory(name: string, slug: string): Promise<{ data: ProductCategory | null; error: string | null }> {
  const { data, error } = await supabase
    .from("product_categories")
    .insert([{ name, slug }])
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

// ============================================
// Helpers
// ============================================

function extractStoragePath(url: string): string | null {
  try {
    const parts = url.split("/product-images/");
    if (parts.length > 1) {
      return decodeURIComponent(parts[1]);
    }
  } catch {
    // Ignore URL parse errors
  }
  return null;
}
