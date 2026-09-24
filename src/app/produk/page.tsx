import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductGrid from "@/components/product/ProductGrid";
import { getProducts } from "@/lib/supabase/queries";
import { placeholderProducts } from "@/data/placeholderProducts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Produk — Keripik Talas & Rengginang",
  description:
    "Semua camilan Cem'ong: keripik ubi talas gurih dan pedas, serta rengginang renyah. Pilih, masukkan keranjang, dan pesan lewat WhatsApp.",
  alternates: { canonical: "/produk" },
};

export default async function ProdukPage() {
  let products = placeholderProducts;

  try {
    const supabaseProducts = await getProducts();
    if (supabaseProducts.length > 0) {
      products = supabaseProducts;
    }
  } catch {
    // Supabase not configured, use placeholder
  }

  return (
    <>
      <Navbar />

      <main className="flex-1">
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-300 px-4 md:px-8">
            <h1 className="font-sans text-2xl font-bold text-foreground mb-2 md:text-3xl">
              Semua Produk
            </h1>
            <p className="text-base text-muted mb-8">
              Pilih camilan favoritmu, lalu pesan lewat WhatsApp.
            </p>
            <ProductGrid products={products} />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
