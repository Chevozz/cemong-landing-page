"use server";

import { updateStoreSettings, type StoreSettingsPayload } from "@/lib/supabase/store-queries";

export async function saveStoreSettings(
  payload: StoreSettingsPayload
): Promise<{ error: string | null }> {
  // Basic server-side validation (trust boundary)
  if (!payload.store_name.trim()) return { error: "Nama toko wajib diisi." };
  if (!payload.whatsapp_number.trim())
    return { error: "Nomor WhatsApp wajib diisi." };
  if (!payload.address.trim()) return { error: "Alamat wajib diisi." };

  return updateStoreSettings({
    store_name: payload.store_name.trim(),
    whatsapp_number: payload.whatsapp_number.trim(),
    instagram: payload.instagram?.trim() ? payload.instagram.trim() : null,
    address: payload.address.trim(),
  });
}
