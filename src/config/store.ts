/**
 * Fallback store values used when the database settings row is unavailable
 * (e.g. Supabase not configured during development).
 * The database `store_settings` row is the source of truth for these fields.
 */
export interface StoreInfo {
  name: string;
  whatsappNumber: string; // normalized for wa.me, e.g. 6281353908632
  whatsappDisplay: string;
  instagram: string | null;
  address: string;
}

export const defaultStore: StoreInfo = {
  name: "Cem'ong",
  whatsappNumber: "6281353908632",
  whatsappDisplay: "0813-5390-8632",
  instagram: "@cheltavii",
  address:
    "Gang Durian 1, Blok A No. 1, JL. Srikandi, Kecamatan Buleleng, Kabupaten Buleleng, Bali 81119",
};
