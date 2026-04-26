"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, GlassWater, ArrowLeft, Mail, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError("Gagal mengirim email. Periksa kembali alamat email Anda.");
      return;
    }

    setSent(true);
  };

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
        {sent ? (
          /* Tampilan setelah email berhasil dikirim */
          <div className="text-center space-y-4 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 rounded-full mx-auto">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Email Terkirim!</h2>
              <p className="text-slate-400 text-sm mt-2">
                Link untuk mengatur ulang kata sandi telah dikirim ke:
              </p>
              <p className="text-orange-400 font-semibold text-sm mt-1">{email}</p>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Silakan cek kotak masuk email Anda (termasuk folder <span className="text-slate-400 font-medium">Spam/Junk</span>). 
              Link berlaku selama 1 jam.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors mt-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke halaman login
            </Link>
          </div>
        ) : (
          /* Form input email */
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white">Lupa Kata Sandi?</h2>
              <p className="text-slate-400 text-sm mt-1">
                Masukkan email Anda dan kami akan mengirimkan link untuk mengatur ulang kata sandi.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="forgot-email" className="label">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kasir@jusbarbar.com"
                    className="input-field pl-10"
                    required
                    autoComplete="email"
                  />
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
                id="btn-send-reset"
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center py-3 mt-2 glow-orange disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  "Kirim Link Reset"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke halaman login
              </Link>
            </div>
          </>
        )}
      </div>

      <p className="text-center text-slate-600 text-xs mt-6">
        Jus Bar Bar POS © {new Date().getFullYear()}
      </p>
    </div>
  );
}
