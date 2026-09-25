/**
 * Centralized error message mapping for admin UI.
 * Translates technical Supabase/PostgreSQL/storage errors into user-friendly
 * Indonesian messages. This is the single source of truth for admin error UX.
 */

export interface UserError {
  title: string;
  message: string;
}

export type AdminErrorContext =
  | "category"
  | "product"
  | "product-image"
  | "store-settings"
  | "auth"
  | "generic";

export function mapAdminError(
  error: unknown,
  context: AdminErrorContext = "generic"
): UserError {
  const normalized = normalizeError(error);
  const lower = normalized.toLowerCase();

  // 1. Client-side validation / application messages (already friendly)
  if (isFriendlyApplicationMessage(normalized)) {
    return {
      title: contextTitle(context, "action"),
      message: normalized,
    };
  }

  // 2. Image upload validation
  const imageValidationError = mapImageValidationError(normalized, context);
  if (imageValidationError) return imageValidationError;

  // 3. Unique constraint
  if (
    lower.includes("duplicate key") ||
    lower.includes("unique constraint") ||
    lower.includes("already exists")
  ) {
    return mapUniqueConstraintError(context, lower);
  }

  // 4. Foreign key constraint
  if (
    lower.includes("foreign key") ||
    lower.includes("violates foreign key constraint") ||
    lower.includes("still referenced")
  ) {
    return mapForeignKeyError(context);
  }

  // 5. Not-null / check constraint / validation
  if (
    lower.includes("not-null constraint") ||
    lower.includes("null value") ||
    lower.includes("check constraint") ||
    lower.includes("violates check constraint")
  ) {
    return mapValidationError(context);
  }

  // 6. Network / request failure
  if (
    lower.includes("network") ||
    lower.includes("fetch") ||
    lower.includes("timeout") ||
    lower.includes("connection") ||
    lower.includes("failed to fetch") ||
    lower.includes("abort")
  ) {
    return {
      title: "Koneksi bermasalah",
      message:
        "Tidak dapat terhubung ke server. Periksa koneksi internet dan coba lagi.",
    };
  }

  // 7. Permission / auth
  if (
    lower.includes("permission") ||
    lower.includes("unauthorized") ||
    lower.includes("forbidden") ||
    lower.includes("policy") ||
    lower.includes("jwt") ||
    lower.includes("auth")
  ) {
    return {
      title: "Tidak memiliki izin",
      message: "Anda tidak memiliki izin untuk melakukan aksi ini.",
    };
  }

  // 8. Storage generic
  if (
    lower.includes("storage") ||
    lower.includes("bucket") ||
    lower.includes("upload")
  ) {
    return {
      title: contextTitle(context === "product-image" ? context : "generic", "upload"),
      message: "Gambar belum berhasil diunggah. Silakan coba lagi.",
    };
  }

  return genericError(context);
}

function normalizeError(error: unknown): string {
  if (error === null || error === undefined) return "";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

function isFriendlyApplicationMessage(message: string): boolean {
  const known = [
    "kategori masih digunakan",
    "hanya file gambar",
    "ukuran gambar maksimal",
    "nama kategori wajib",
    "slug kategori wajib",
    "kategori dengan nama atau slug",
    "produk dengan nama atau slug",
  ];
  const lower = message.toLowerCase();
  return known.some((prefix) => lower.includes(prefix));
}

function mapImageValidationError(
  normalized: string,
  context: AdminErrorContext
): UserError | null {
  const lower = normalized.toLowerCase();

  const sizeKeywords = [
    "5 mb",
    "file too large",
    "too large",
    "maksimal",
    "ukuran gambar",
    "ukuran file",
  ];
  const formatKeywords = [
    "mime",
    "file type",
    "hanya file gambar",
    "format gambar",
    "format file",
  ];

  // Image validation keywords are only meaningful for image operations; a
  // generic "size" hit on a database error would be misclassified.
  const isSizeError =
    sizeKeywords.some((k) => lower.includes(k)) ||
    (context === "product-image" && lower.includes("size"));
  const isFormatError =
    formatKeywords.some((k) => lower.includes(k)) ||
    (context === "product-image" && lower.includes("format"));

  if (isSizeError && isFormatError) {
    return {
      title: "Gambar tidak valid",
      message:
        "Format gambar belum didukung atau ukurannya terlalu besar. Gunakan JPG/PNG/WebP dengan ukuran maksimal 5 MB.",
    };
  }

  if (isSizeError) {
    return {
      title: "Ukuran gambar terlalu besar",
      message: "Ukuran gambar maksimal 5 MB. Gunakan gambar yang lebih kecil.",
    };
  }

  if (isFormatError) {
    return {
      title: "Format gambar tidak didukung",
      message: "Format gambar belum didukung. Gunakan JPG, PNG, atau WebP.",
    };
  }

  if (context === "product-image") {
    return {
      title: "Gagal mengunggah gambar",
      message: "Gambar belum berhasil diunggah. Silakan coba lagi.",
    };
  }

  return null;
}

function mapUniqueConstraintError(
  context: AdminErrorContext,
  lower: string
): UserError {
  const isSlug = lower.includes("slug");

  switch (context) {
    case "category":
      return isSlug
        ? {
            title: "Slug sudah digunakan",
            message:
              "Slug ini sudah digunakan oleh kategori lain. Silakan gunakan slug yang berbeda.",
          }
        : {
            title: "Kategori sudah ada",
            message:
              "Kategori dengan nama atau slug tersebut sudah terdaftar. Silakan gunakan yang lain.",
          };
    case "product":
      return isSlug
        ? {
            title: "Slug sudah digunakan",
            message:
              "Slug ini sudah digunakan oleh produk lain. Silakan gunakan slug yang berbeda.",
          }
        : {
            title: "Produk sudah ada",
            message:
              "Produk dengan nama atau slug tersebut sudah terdaftar. Silakan gunakan yang lain.",
          };
    case "store-settings":
      return {
        title: "Pengaturan sudah ada",
        message: "Pengaturan toko sudah tersedia. Silakan perbarui yang ada.",
      };
    default:
      return {
        title: "Data sudah ada",
        message: "Data dengan nilai tersebut sudah terdaftar. Silakan gunakan yang lain.",
      };
  }
}

function mapForeignKeyError(context: AdminErrorContext): UserError {
  if (context === "category") {
    return {
      title: "Kategori tidak bisa dihapus",
      message:
        "Kategori ini masih digunakan oleh produk. Hapus atau pindahkan produk tersebut terlebih dahulu.",
    };
  }
  return {
    title: "Data terkait masih digunakan",
    message:
      "Data ini masih memiliki keterkaitan dengan data lain dan tidak dapat dihapus.",
  };
}

function mapValidationError(context: AdminErrorContext): UserError {
  switch (context) {
    case "category":
      return {
        title: "Data tidak lengkap",
        message: "Nama dan slug kategori wajib diisi.",
      };
    case "product":
      return {
        title: "Data tidak lengkap",
        message:
          "Ada field wajib yang belum diisi. Periksa kembali nama, slug, kategori, harga, dan jumlah pcs produk.",
      };
    case "store-settings":
      return {
        title: "Data tidak lengkap",
        message:
          "Nama toko, nomor WhatsApp, dan alamat wajib diisi. Periksa kembali form pengaturan.",
      };
    default:
      return {
        title: "Data tidak lengkap",
        message: "Ada field wajib yang belum diisi. Periksa kembali data yang dimasukkan.",
      };
  }
}

function genericError(context: AdminErrorContext): UserError {
  switch (context) {
    case "category":
      return {
        title: "Gagal menyimpan kategori",
        message: "Kategori belum berhasil disimpan. Silakan coba lagi.",
      };
    case "product":
      return {
        title: "Gagal menyimpan produk",
        message: "Produk belum berhasil disimpan. Silakan coba lagi.",
      };
    case "product-image":
      return {
        title: "Gagal mengunggah gambar",
        message: "Gambar belum berhasil diunggah. Silakan coba lagi.",
      };
    case "store-settings":
      return {
        title: "Gagal menyimpan pengaturan",
        message: "Pengaturan belum berhasil disimpan. Silakan coba lagi.",
      };
    case "auth":
      return {
        title: "Gagal masuk",
        message: "Email atau kata sandi salah. Silakan coba lagi.",
      };
    default:
      return {
        title: "Terjadi kesalahan",
        message: "Silakan coba lagi.",
      };
  }
}

function contextTitle(
  context: AdminErrorContext,
  type: "action" | "upload"
): string {
  if (type === "upload") {
    return "Gagal mengunggah gambar";
  }
  switch (context) {
    case "category":
      return "Gagal menyimpan kategori";
    case "product":
      return "Gagal menyimpan produk";
    case "store-settings":
      return "Gagal menyimpan pengaturan";
    case "auth":
      return "Gagal masuk";
    default:
      return "Terjadi kesalahan";
  }
}
