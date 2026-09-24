import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";
import { getProducts } from "@/lib/supabase/queries";
import { placeholderProducts } from "@/data/placeholderProducts";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: { slug: string; updated_at: string }[] = [];

  try {
    const data = await getProducts();
    if (data.length > 0) {
      products = data.map((p) => ({
        slug: p.slug,
        updated_at: p.updated_at,
      }));
    }
  } catch {
    products = [];
  }

  if (products.length === 0) {
    // Supabase not configured: fall back to placeholder slugs so sitemap still lists pages
    products = placeholderProducts.map((p) => ({
      slug: p.slug,
      updated_at: new Date().toISOString(),
    }));
  }

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/produk`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...products.map((p) => ({
      url: `${siteUrl}/produk/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
