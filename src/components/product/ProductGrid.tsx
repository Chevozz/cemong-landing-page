import ProductCard from "@/components/product/ProductCard";
import type { ProductWithRelations } from "@/types/database";

export interface ProductGridProps {
  products: ProductWithRelations[];
  emptyMessage?: string;
}

export default function ProductGrid({ products, emptyMessage = "Belum ada produk tersedia" }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {products.map((product) => {
        const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];
        return (
          <ProductCard
            key={product.id}
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              weightGrams: product.weight_grams,
              imageUrl: primaryImage?.image_url ?? "/placeholder-photo.svg",
              isAvailable: product.is_available,
            }}
          />
        );
      })}
    </div>
  );
}
