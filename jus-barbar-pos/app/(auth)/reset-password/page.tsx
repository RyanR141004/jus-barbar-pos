"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2, GlassWater, CheckCircle, KeyRound } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Cek apakah user punya session valid dari link reset password
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setValidSession(true);
      }
      setChecking(false);
    };
    checkSession();
  }, [supabase]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Kata sandi dan konfirmasi tidak cocok.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setError("Gagal memperbarui kata sandi. Coba minta link reset baru.");
      return;
    }

    setSuccess(true);

    // Redirect ke login setelah 3 detik
    setTimeout(() => {
      router.push("/login");
    }, 3000);
  };

  if (checking) {
    return (
      <div className="w-full max-w-md flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md animate-fade-in">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4 shadow-lg shadow-orange-500/30">
          <GlassWater className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Jus Bar Bar</h1>
        <p className="text-slate-400 text-sm mt-1">Sistem Point of Sale</p>
      </div>

      {/* Card */}
      <div className="card-glass p-8">
        {success ? (
          /* Tampilan sukses */
          <div className="text-center space-y-4 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 rounded-full mx-auto">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Kata Sandi Diperbarui!</h2>
              <p className="text-slate-400 text-sm mt-2">
                Kata sandi Anda berhasil diubah. Anda akan diarahkan ke halaman login dalam 3 detik...
              </p>
            </div>
          </div>
        ) : !validSession ? (
          /* Tampilan link tidak valid */
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mx-auto">
              <KeyRound className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Link Tidak Valid</h2>
              <p className="text-slate-400 text-sm mt-2">
                Link reset kata sandi sudah kadaluarsa atau tidak valid. Silakan minta link baru.
              </p>
            </div>
            <button
              onClick={() => router.push("/forgot-password")}
              className="btn-primary justify-center py-2.5 px-6 glow-orange"
            >
              Minta Link Baru
            </button>
          </div>
        ) : (
          /* Form reset password */
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white">Buat Kata Sandi Baru</h2>
              <p className="text-slate-400 text-sm mt-1">
                Masukkan kata sandi baru yang mudah Anda ingat.
              </p>
            </div>

            <form onSubmit={handleReset} className="space-y-4">
              {/* Password Baru */}
              <div>
                <label htmlFor="new-password" className="label">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="input-field pr-12"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password */}
              <div>
                <label htmlFor="confirm-password" className="label">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="input-field pr-12"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Indikator kekuatan password */}
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    <div className={`h-1 flex-1 rounded-full transition-colors ${password.length >= 1 ? 'bg-red-400' : 'bg-slate-700'}`} />
                    <div className={`h-1 flex-1 rounded-full transition-colors ${password.length >= 6 ? 'bg-amber-400' : 'bg-slate-700'}`} />
                    <div className={`h-1 flex-1 rounded-full transition-colors ${password.length >= 10 ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                  </div>
                  <p className="text-xs text-slate-500">
                    {password.length < 6 ? 'Terlalu pendek' : password.length < 10 ? 'Cukup kuat' : 'Sangat kuat'}
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                id="btn-reset-password"
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center py-3 mt-2 glow-orange disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Kata Sandi Baru"
                )}
              </button>
            </form>
          </>
        )}
      </div>

      <p className="text-center text-slate-600 text-xs mt-6">
        Jus Bar Bar POS © {new Date().getFullYear()}
      </p>
    </div>
  );
}
