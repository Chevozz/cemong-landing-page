import { getStoreSettingsForAdmin } from "@/lib/supabase/store-queries";
import { defaultStore } from "@/config/store";
import StoreSettingsForm from "./StoreSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  let settings: Awaited<ReturnType<typeof getStoreSettingsForAdmin>> = null;

  try {
    settings = await getStoreSettingsForAdmin();
  } catch {
    settings = null;
  }

  const loadWarning = !settings;

  const initial = {
    storeName: settings?.store_name ?? defaultStore.name,
    whatsappNumber: settings?.whatsapp_number ?? defaultStore.whatsappDisplay.replace(/-/g, ""),
    instagram: settings?.instagram ?? defaultStore.instagram ?? "",
    address: settings?.address ?? defaultStore.address,
  };

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

      {loadWarning && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-3.5 text-xs text-warning">
          Pengaturan dari database belum tersedia. Form di bawah memuat nilai bawaan;
          menyimpan akan membuat baris pengaturan baru.
        </div>
      )}

      <StoreSettingsForm initial={initial} />
    </div>
  );
}
