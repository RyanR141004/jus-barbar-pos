"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2, GlassWater, ShieldCheck, UserRound } from "lucide-react";

type LoginRole = "kasir" | "admin";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loginRole, setLoginRole] = useState<LoginRole>("kasir");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Email atau password salah. Silakan coba lagi.");
      setLoading(false);
      return;
    }

    // Cek role di tabel profiles
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const userRole = profile?.role ?? "kasir";

      // Validasi: admin hanya bisa login di tab admin, kasir di tab kasir
      if (loginRole === "admin" && userRole !== "admin") {
        setError("Akun ini tidak memiliki akses admin. Silakan masuk sebagai Kasir.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (loginRole === "kasir" && userRole === "admin") {
        // Admin boleh login di mana saja, lanjut
      }
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4 shadow-lg shadow-orange-500/30">
          <GlassWater className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Jus Bar Bar</h1>
        <p className="text-slate-400 text-sm mt-1">Selamat Datang Bos Opin</p>
      </div>

      {/* Card */}
      <div className="card-glass p-8">
        {/* Role Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => { setLoginRole("kasir"); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
              loginRole === "kasir"
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                : ""
            }`}
            style={
              loginRole !== "kasir"
                ? { backgroundColor: "var(--bg-input)", color: "var(--text-muted)", border: "1px solid var(--bg-input-border)" }
                : {}
            }
          >
            <UserRound className="w-4 h-4" />
            Kasir
          </button>
          <button
            type="button"
            onClick={() => { setLoginRole("admin"); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
              loginRole === "admin"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                : ""
            }`}
            style={
              loginRole !== "admin"
                ? { backgroundColor: "var(--bg-input)", color: "var(--text-muted)", border: "1px solid var(--bg-input-border)" }
                : {}
            }
          >
            <ShieldCheck className="w-4 h-4" />
            Admin (Owner)
          </button>
        </div>

        {/* Role Info Card */}
        <div
          className="mb-6 rounded-xl p-4 relative overflow-hidden"
          style={{
            background: loginRole === "admin"
              ? "linear-gradient(135deg, rgba(249,115,22,0.1), rgba(234,88,12,0.05))"
              : "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(37,99,235,0.05))",
            border: `1px solid ${loginRole === "admin" ? "rgba(249,115,22,0.2)" : "rgba(59,130,246,0.2)"}`,
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                loginRole === "admin"
                  ? "bg-orange-500/20"
                  : "bg-blue-500/20"
              }`}
            >
              {loginRole === "admin"
                ? <ShieldCheck className="w-5 h-5 text-orange-400" />
                : <UserRound className="w-5 h-5 text-blue-400" />
              }
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                {loginRole === "admin" ? "Masuk sebagai Admin" : "Masuk sebagai Kasir"}
              </h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {loginRole === "admin" ? "Akses penuh ke seluruh sistem" : "Akses operasional harian"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {loginRole === "admin" ? (
              <>
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 font-medium">Dashboard</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 font-medium">Kasir POS</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 font-medium">Manajemen Produk</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 font-medium">Laporan</span>
              </>
            ) : (
              <>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-medium">Dashboard</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-medium">Kasir POS</span>
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kasir@jusbarbar.com"
              className="input-field"
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field pr-12"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {/* Lupa Kata Sandi */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
              >
                Lupa kata sandi?
              </Link>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            id="btn-login"
            type="submit"
            disabled={loading}
            className={`w-full justify-center py-3 mt-2 font-semibold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              loginRole === "admin"
                ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 glow-orange"
                : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Masuk...
              </>
            ) : (
              <>
                {loginRole === "admin" ? <ShieldCheck className="w-4 h-4" /> : <UserRound className="w-4 h-4" />}
                {loginRole === "admin" ? "Masuk sebagai Admin" : "Masuk sebagai Kasir"}
              </>
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-xs mt-6" style={{ color: "var(--text-muted)" }}>
        Jus Bar Bar POS © {new Date().getFullYear()}
      </p>
    </div>
  );
}
