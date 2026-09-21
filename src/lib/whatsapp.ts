import { store } from "@/config/store";

export function buildWhatsAppMessage(order: {
  items: { name: string; price: number; quantity: number }[];
  total: number;
  name: string;
  address: string;
  note?: string;
}): string {
  const lines = ["Halo Cem'ong, saya ingin memesan:"];

  order.items.forEach((item, idx) => {
    lines.push(`${idx + 1}. ${item.name} x${item.quantity} — Rp ${item.price.toLocaleString("id-ID")}`);
  });

  lines.push("");
  lines.push(`Total: Rp ${order.total.toLocaleString("id-ID")}`);
  lines.push("");
  lines.push(`Nama: ${order.name}`);
  lines.push(`Alamat: ${order.address}`);

  if (order.note?.trim()) {
    lines.push(`Catatan: ${order.note.trim()}`);
  }

  return lines.join("\n");
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${store.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
