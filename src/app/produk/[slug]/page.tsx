import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getProductBySlug } from "@/lib/supabase/queries";
import { placeholderProducts } from "@/data/placeholderProducts";
import { formatRupiah } from "@/lib/formatters/currency";
import AddToCartButton from "./AddToCartButton";
import ProductGallery from "@/components/product/ProductGallery";
import type { ProductWithRelations } from "@/types/database";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await resolveProduct(slug);

  if (!product) return { title: "Produk tidak ditemukan" };

  return {
    title: `${product.name} — Cem'ong`,
    description: product.description ?? `${product.name} dari Cem'ong`,
    openGraph: {
      title: `${product.name} — Cem'ong`,
      description: product.description ?? undefined,
    },
  };
}

async function resolveProduct(slug: string): Promise<ProductWithRelations | null> {
  try {
    const product = await getProductBySlug(slug);
    if (product) return product;
  } catch {
    // Supabase not configured
  }

  // Fallback to placeholder
  return placeholderProducts.find((p) => p.slug === slug) ?? null;
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await resolveProduct(slug);

  if (!product) notFound();

  const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];
  const mainImageUrl = primaryImage?.image_url ?? "/placeholder-photo.svg";

  return (
    <>
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-300 px-4 py-8 md:px-8 md:py-12">
          {/* Back link */}
          <Link
            href="/produk"
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Kembali ke produk</span>
          </Link>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 items-start">
            {/* Gallery (supports multiple images uploaded by admin) */}
            <ProductGallery
              images={product.images || []}
              productName={product.name}
            />

            {/* Info */}
            <div className="flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                {product.category?.name}
              </p>

              <h1 className="font-sans text-2xl font-bold text-foreground md:text-3xl">
                {product.name}
              </h1>

              <div className="mt-3 flex items-baseline gap-3">
                <p className="text-2xl font-bold text-primary">
                  {formatRupiah(product.price)}
                </p>
                <p className="text-sm text-muted">{product.weight_grams} g</p>
              </div>

              {product.description && (
                <p className="mt-6 text-base leading-relaxed text-muted">
                  {product.description}
                </p>
              )}

              <div className="mt-6">
                {product.is_available ? (
                  <span className="inline-flex items-center rounded-md bg-success/10 px-3 py-1 text-sm font-medium text-success">
                    Tersedia
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-md bg-warning/10 px-3 py-1 text-sm font-medium text-warning">
                    Sedang habis
                  </span>
                )}
              </div>

              <div className="mt-8">
                <AddToCartButton
                  product={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    weightGrams: product.weight_grams,
                    isAvailable: product.is_available,
                  }}
                  imageUrl={mainImageUrl}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
