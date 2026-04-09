"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LogIn, Mail, Lock, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { forceConfirmUser } from "@/lib/actions/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        setError("Email not confirmed. Hesabınız henüz doğrulanmamış.");
      } else {
        setError(error.message);
      }
      setIsSubmitting(false);
    } else {
      window.location.href = "/";
    }
  };

  const handleForceConfirm = async () => {
    setIsConfirming(true);
    try {
      await forceConfirmUser(email);
      setMessage("Hesabınız doğrulandı! Şimdi giriş yapabilirsiniz.");
      setError("");
    } catch (err: any) {
      setError("Doğrulama hatası: " + err.message);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleSignUp = async () => {
    setIsSubmitting(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Kayıt başarılı! Lütfen e-postanızı kontrol edin (veya doğrudan giriş yapmayı deneyin).");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            WARVANTA
          </h1>
          <p className="text-slate-500 text-sm italic">Personel Yönetiminde Yeni Nesil</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">E-posta</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                type="email" 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="ornek@sirket.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Şifre</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                type="password" 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 flex items-center justify-between">
                {error}
                {error.includes("Email not confirmed") && (
                  <button 
                    type="button"
                    onClick={handleForceConfirm}
                    disabled={isConfirming}
                    className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 transition-colors flex items-center gap-1"
                  >
                    {isConfirming ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                    Hemen Doğrula
                  </button>
                )}
              </p>
            </div>
          )}
          {message && <p className="text-xs font-bold text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100">{message}</p>}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button 
              type="submit" 
              disabled={isSubmitting || isConfirming}
              className="bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group disabled:bg-blue-400"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Giriş Yap"}
            </button>
            <button 
              type="button"
              onClick={() => window.location.href = "/signup?email=" + email}
              disabled={isSubmitting || isConfirming}
              className="bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
            >
              Kayıt Ol
            </button>
          </div>
        </form>

        <p className="mt-8 text-[11px] text-slate-400 text-center leading-relaxed">
          Giriş yaparak kullanım koşullarını ve gizlilik politikasını kabul etmiş sayılırsınız.
        </p>
      </motion.div>
    </div>
  );
}
