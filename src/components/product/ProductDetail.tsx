import Image from "next/image";
import { formatRupiah } from "@/lib/formatters/currency";

export interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    weightGrams: number;
    description: string | null;
    isAvailable: boolean;
    imageUrl: string;
  };
}

export default function ProductDetail({ product }: ProductDetailProps) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-background">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Info */}
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">{product.name}</h1>

        <div className="mt-3 flex items-center gap-3">
          <p className="text-2xl font-semibold text-primary">{formatRupiah(product.price)}</p>
          <p className="text-sm text-muted">{product.weightGrams} g</p>
        </div>

        {product.description && (
          <p className="mt-6 text-base leading-relaxed text-foreground/90">{product.description}</p>
        )}

        <div className="mt-6">
          {product.isAvailable ? (
            <span className="inline-flex items-center rounded-full bg-success/15 px-3 py-1 text-sm font-medium text-success">
              Tersedia
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-warning/15 px-3 py-1 text-sm font-medium text-warning">
              Sedang habis
            </span>
          )}
        </div>

        <div className="mt-8">
          {product.isAvailable ? (
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-white transition-colors hover:bg-primary/90 min-h-[44px]"
              aria-label={`Tambahkan ${product.name} ke keranjang`}
            >
              Tambah ke Keranjang
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center rounded-md bg-muted/30 px-6 py-3 text-base font-medium text-muted cursor-not-allowed min-h-[44px]"
              aria-disabled="true"
            >
              Sedang habis
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
