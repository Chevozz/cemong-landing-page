import { store } from "@/config/store";
import { Store, MessageCircle, Camera, MapPin } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Pengaturan Toko
        </h1>
        <p className="text-sm text-muted">
          Informasi kontak dan identitas toko Cem&apos;ong yang ditampilkan di etalase publik
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6 sm:p-8 space-y-6 shadow-xs">
        <h2 className="text-base font-bold text-foreground border-b border-border pb-3">
          Informasi Publik Toko
        </h2>

        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-background border border-border/70">
            <Store size={18} className="text-primary mt-0.5 flex-shrink-0" />
            <div>
              <span className="block text-xs font-semibold text-muted uppercase tracking-wider">
                Nama Toko
              </span>
              <span className="font-bold text-foreground text-base">
                {store.name}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-background border border-border/70">
            <MessageCircle size={18} className="text-whatsapp mt-0.5 flex-shrink-0" />
            <div>
              <span className="block text-xs font-semibold text-muted uppercase tracking-wider">
                Nomor WhatsApp Pesanan
              </span>
              <span className="font-bold text-foreground text-base">
                {store.whatsappDisplay} ({store.whatsappNumber})
              </span>
              <span className="block text-xs text-muted mt-0.5">
                Nomor ini digunakan sebagai tujuan pengiriman format checkout pesanan pelanggan.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-background border border-border/70">
            <Camera size={18} className="text-foreground mt-0.5 flex-shrink-0" />
            <div>
              <span className="block text-xs font-semibold text-muted uppercase tracking-wider">
                Instagram
              </span>
              <span className="font-bold text-foreground text-base">
                {store.instagram}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-background border border-border/70">
            <MapPin size={18} className="text-muted mt-0.5 flex-shrink-0" />
            <div>
              <span className="block text-xs font-semibold text-muted uppercase tracking-wider">
                Alamat Toko
              </span>
              <span className="font-medium text-foreground">
                {store.address}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted">
            Catatan: Pengaturan ini tersimpan di konfigurasi terpusat <code className="font-mono text-xs bg-background px-1.5 py-0.5 rounded">src/config/store.ts</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
