import { Price } from "@/types/product";

export function formatRupiah(amount: Price): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}
