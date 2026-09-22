/**
 * Normalize a WhatsApp number to the international format used by wa.me
 * (digits only, no leading +, with country code).
 * 081353908632 -> 6281353908632, +62 813-5390-8632 -> 6281353908632
 */
export function normalizeWhatsAppNumber(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return digits;
}

/**
 * Validate a WhatsApp number: digits only with optional leading +, spaces or
 * dashes. Must be 9-15 digits after normalization.
 */
export function isValidWhatsAppNumber(input: string): boolean {
  if (!/^\+?[0-9][0-9\s-]*$/.test(input.trim())) return false;
  const digits = normalizeWhatsAppNumber(input);
  return digits.length >= 9 && digits.length <= 15;
}
