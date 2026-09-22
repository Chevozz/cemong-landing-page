import { unstable_cache, revalidatePath, updateTag } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "./server";
import { defaultStore, type StoreInfo } from "@/config/store";
import type { StoreSettingsRow, Database } from "@/types/database";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";

// ============================================
// Anonymous read client (no cookies, cache-safe)
// ============================================

function createAnonClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
  return createSupabaseClient<Database>(supabaseUrl, supabaseKey);
}

// ============================================
// Public store settings (server, cached)
// ============================================

function formatWhatsAppDisplay(number: string): string {
  const normalized = normalizeWhatsAppNumber(number);
  // 6281353908632 -> 0813-5390-8632
  if (normalized.startsWith("62") && normalized.length === 13) {
    const local = `0${normalized.slice(2)}`;
    return `${local.slice(0, 4)}-${local.slice(4, 8)}-${local.slice(8)}`;
  }
  return number;
}

function toStoreInfo(row: StoreSettingsRow): StoreInfo {
  return {
    name: row.store_name,
    whatsappNumber: normalizeWhatsAppNumber(row.whatsapp_number),
    whatsappDisplay: formatWhatsAppDisplay(row.whatsapp_number),
    instagram: row.instagram ?? null,
    address: row.address,
  };
}

const getCachedStoreSettings = unstable_cache(
  async () => {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from("store_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (!data) return defaultStore;
    return toStoreInfo(data);
  },
  ["store-settings"],
  { revalidate: 60, tags: ["store-settings"] }
);

export async function getStoreInfo(): Promise<StoreInfo> {
  try {
    return await getCachedStoreSettings();
  } catch {
    return defaultStore;
  }
}

// ============================================
// Admin: read + update (cookie client, RLS-guarded)
// ============================================

export async function getStoreSettingsForAdmin(): Promise<StoreSettingsRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  return data ?? null;
}

export interface StoreSettingsPayload {
  store_name: string;
  whatsapp_number: string;
  instagram: string | null;
  address: string;
}

export async function updateStoreSettings(
  payload: StoreSettingsPayload
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Upsert: update the single row, or create it if the seed is missing
  const { error } = await supabase.from("store_settings").upsert({
    id: 1,
    ...payload,
    updated_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };

  // Invalidate cached storefront settings so changes show without rebuild.
  // updateTag = immediate expiration, valid in Server Actions (Next 16).
  updateTag("store-settings");
  revalidatePath("/", "layout");
  return { error: null };
}