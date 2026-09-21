"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <AlertTriangle size={48} className="mx-auto text-warning mb-4" aria-hidden="true" />
        <h1 className="text-xl font-bold text-foreground mb-2">
          Terjadi kesalahan
        </h1>
        <p className="text-muted mb-6">
          Maaf, terjadi kesalahan saat memuat halaman ini. Silakan coba lagi.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-white hover:bg-primary/90 transition-colors min-h-11"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
