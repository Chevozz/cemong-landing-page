"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Lock, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const unauthorizedParam = searchParams.get("error") === "unauthorized";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    unauthorizedParam
      ? "Akun kamu belum memiliki hak akses admin di tabel admin_profiles."
      : ""
  );

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      // 1. Authenticate via Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        const lowerMsg = error.message.toLowerCase();
        if (
          lowerMsg.includes("invalid login credentials") ||
          lowerMsg.includes("email not confirmed")
        ) {
          setErrorMessage("Email atau kata sandi salah. Silakan coba lagi.");
        } else {
          setErrorMessage(
            "Gagal masuk. Periksa koneksi internet dan coba lagi."
          );
        }
        setLoading(false);
        return;
      }

      if (!data.user) {
        setErrorMessage("Gagal masuk. Silakan coba lagi.");
        setLoading(false);
        return;
      }

      // 2. Authorization check: check admin_profiles table
      const { data: adminProfile, error: profileError } = await supabase
        .from("admin_profiles")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (profileError || !adminProfile) {
        // User is authenticated but NOT in admin_profiles
        await supabase.auth.signOut();
        setErrorMessage(
          "Akun kamu terdaftar tetapi tidak memiliki izin admin di sistem ini."
        );
        setLoading(false);
        return;
      }

      // 3. Success -> Redirect to /admin
      router.push("/admin");
      router.refresh();
    } catch {
      setErrorMessage("Gagal masuk. Periksa koneksi internet dan coba lagi.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-sans text-2xl font-bold tracking-tight text-primary">
            Cem&apos;ong
          </Link>
          <h1 className="mt-2 text-xl font-bold text-foreground">
            Masuk ke Panel Admin
          </h1>
          <p className="mt-1 text-xs text-muted">
            Kelola katalog dan ketersediaan produk
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-xl border border-border p-6 sm:p-8 shadow-xs">
          {errorMessage && (
            <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-error/30 bg-error/10 p-3 text-xs text-error">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide"
              >
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cemong.com"
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 pl-9 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
                <Mail
                  size={15}
                  className="absolute left-3 top-3.5 text-muted pointer-events-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 pl-9 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
                <Lock
                  size={15}
                  className="absolute left-3 top-3.5 text-muted pointer-events-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 active:scale-[0.99] transition-all min-h-11 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Memverifikasi..." : "Masuk"}
            </button>
          </form>
        </div>

        {/* Back to storefront link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-muted hover:text-primary transition-colors"
          >
            &larr; Kembali ke etalase toko
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-muted">Memuat...</div>}>
      <LoginForm />
    </Suspense>
  );
}
