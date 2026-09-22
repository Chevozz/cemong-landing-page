import Image from "next/image";
import { MessageCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductGrid from "@/components/product/ProductGrid";
import { getAvailableProducts } from "@/lib/supabase/queries";
import { placeholderProducts } from "@/data/placeholderProducts";
import { getStoreInfo } from "@/lib/supabase/store-queries";

export default async function Home() {
  const store = await getStoreInfo();
  let products = placeholderProducts.filter((p) => p.is_available);

  try {
    const supabaseProducts = await getAvailableProducts();
    if (supabaseProducts.length > 0) {
      products = supabaseProducts;
    }
  } catch {
    // Supabase not configured, fallback to placeholder
  }

  return (
    <>
      <Navbar />

      <main className="flex-1">
        {/* ==================== 1. HERO (Editorial, Warm Surface) ==================== */}
        <section className="bg-[#FAF7F2] border-b border-border/80 py-12 md:py-18">
          <div className="mx-auto max-w-300 px-4 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
              {/* Left: Headline & Actions */}
              <div className="lg:col-span-6 flex flex-col items-start">
                <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2.5">
                  Cem&apos;ong
                </span>

                <h1 className="font-sans text-3xl sm:text-4xl lg:text-[46px] font-bold text-foreground leading-[1.16] tracking-tight mb-4">
                  Keripik talas dan rengginang untuk teman ngemil.
                </h1>

                <p className="text-base sm:text-lg text-muted leading-relaxed mb-8 max-w-lg">
                  Pilihan camilan rumahan yang renyah dan gurih, bisa kamu pesan langsung lewat WhatsApp.
                </p>

                <div className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto">
                  <a
                    href="#produk"
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3.5 text-base font-semibold text-white hover:bg-primary/90 transition-colors min-h-11 shadow-xs"
                  >
                    Lihat Produk
                  </a>
                  <a
                    href={`https://wa.me/${store.whatsappNumber}?text=${encodeURIComponent(`Halo ${store.name}, saya mau pesan camilan.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-6 py-3.5 text-base font-semibold text-foreground hover:bg-background transition-colors min-h-11"
                  >
                    Pesan via WhatsApp
                  </a>
                </div>
              </div>

              {/* Right: Dominant Product Visual Hero */}
              <div className="lg:col-span-6 w-full">
                <div className="relative aspect-[4/3] lg:aspect-[5/4] w-full overflow-hidden rounded-2xl border border-border/80 bg-[#F4EFE6] shadow-sm">
                  <Image
                    src="/images/hero-camilan.svg"
                    alt="Keripik talas dan rengginang Cem'ong"
                    fill
                    priority
                    fetchPriority="high"
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 2. PRODUCTS (Clean Surface, Generous Presence) ==================== */}
        <section id="produk" className="bg-surface py-14 md:py-20 border-b border-border">
          <div className="mx-auto max-w-300 px-4 md:px-8">
            <div className="mb-8 md:mb-12 max-w-xl">
              <h2 className="font-sans text-2xl sm:text-3xl font-bold text-foreground mb-1.5">
                Produk Kami
              </h2>
              <p className="text-sm sm:text-base text-muted">
                Pilihan camilan rumahan yang renyah dan gurih.
              </p>
            </div>

            <ProductGrid products={products} />
          </div>
        </section>

        {/* ==================== 3. BRAND STORY (Editorial Warm Tint) ==================== */}
        <section id="tentang" className="bg-[#F6F1E9] py-14 md:py-22 border-b border-border">
          <div className="mx-auto max-w-300 px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-14 items-center">
              {/* Left: Large Editorial Packaging Photo */}
              <div className="md:col-span-5">
                <div className="relative aspect-[4/3] md:aspect-square lg:aspect-[5/4] w-full overflow-hidden rounded-xl border border-border/80 bg-[#ECE4D8] shadow-sm">
                  <Image
                    src="/images/story-packaging.svg"
                    alt="Kemasan keripik talas dan rengginang Cem'ong"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                </div>
              </div>

              {/* Right: Editorial Narrative */}
              <div className="md:col-span-7">
                <h2 className="font-sans text-2xl sm:text-3xl font-bold text-foreground leading-snug mb-4">
                  Tentang Cem&apos;ong
                </h2>
                <div className="space-y-4 text-base sm:text-lg text-muted leading-relaxed max-w-xl">
                  <p>
                    Cem&apos;ong dibuat untuk camilan sederhana yang enak dinikmati kapan saja.
                  </p>
                  <p>
                    Kami membuat keripik ubi talas dan rengginang rumahan yang cocok untuk teman ngopi santai atau dinikmati bersama keluarga di rumah.
                  </p>
                  <p className="text-sm sm:text-base">
                    Setiap pesanan kami siapkan dengan cermat dan dikemas rapat agar kerenyahannya tetap terjaga saat sampai di tanganmu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 4. HOW TO ORDER (Clean Typographic Steps) ==================== */}
        <section id="cara-pesan" className="bg-surface py-14 md:py-20 border-b border-border">
          <div className="mx-auto max-w-300 px-4 md:px-8">
            <div className="mb-10 md:mb-14 max-w-xl">
              <h2 className="font-sans text-2xl sm:text-3xl font-bold text-foreground mb-1.5">
                Cara Pesan
              </h2>
              <p className="text-sm sm:text-base text-muted">
                Pemesanan sederhana langsung terhubung ke WhatsApp kami.
              </p>
            </div>

            {/* Large Typography Process Steps (NO cards, NO icons) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
              <div className="border-t-2 border-border pt-4">
                <span className="font-sans text-3xl sm:text-4xl font-extrabold text-secondary/60 block mb-2">
                  01
                </span>
                <h3 className="font-sans text-base font-bold text-foreground mb-1">
                  Pilih produk
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  Pilih keripik talas atau rengginang yang ingin kamu beli.
                </p>
              </div>

              <div className="border-t-2 border-border pt-4">
                <span className="font-sans text-3xl sm:text-4xl font-extrabold text-secondary/60 block mb-2">
                  02
                </span>
                <h3 className="font-sans text-base font-bold text-foreground mb-1">
                  Masukkan ke keranjang
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  Tentukan berapa bungkus yang kamu perlukan.
                </p>
              </div>

              <div className="border-t-2 border-border pt-4">
                <span className="font-sans text-3xl sm:text-4xl font-extrabold text-secondary/60 block mb-2">
                  03
                </span>
                <h3 className="font-sans text-base font-bold text-foreground mb-1">
                  Isi alamat
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  Tulis nama penerima dan alamat pengiriman di form checkout.
                </p>
              </div>

              <div className="border-t-2 border-border pt-4">
                <span className="font-sans text-3xl sm:text-4xl font-extrabold text-secondary/60 block mb-2">
                  04
                </span>
                <h3 className="font-sans text-base font-bold text-foreground mb-1">
                  Kirim ke WhatsApp
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  Rincian pesanan langsung kami terima dan siapkan via WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 5. FINAL CTA (Warm & Direct) ==================== */}
        <section className="bg-[#4A3266] py-12 md:py-16 text-white">
          <div className="mx-auto max-w-300 px-4 md:px-8 text-center">
            <div className="max-w-xl mx-auto space-y-4">
              <h2 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Sudah tahu mau ngemil apa?
              </h2>

              <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                Pilih camilanmu, masukkan ke keranjang, lalu lanjutkan pesanan lewat WhatsApp.
              </p>

              <div className="pt-2">
                <a
                  href={`https://wa.me/${store.whatsappNumber}?text=${encodeURIComponent(`Halo ${store.name}, saya mau pesan camilan.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-whatsapp px-6 py-3.5 text-base font-semibold text-white hover:bg-whatsapp/90 transition-all min-h-11 shadow-sm"
                >
                  <MessageCircle size={19} aria-hidden="true" />
                  <span>Pesan via WhatsApp ({store.whatsappDisplay})</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
