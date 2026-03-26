"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, ShieldCheck, ArrowRight, User, Mail, Lock, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import toast from "react-hot-toast";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams?.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setSuccess(true);
      toast.success("Kayıt başarılı! Lütfen e-postanızı kontrol edin.");
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl shadow-slate-200/50 text-center border border-slate-100"
      >
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-4">Harika!</h1>
        <p className="text-slate-500 leading-relaxed mb-8">
          Kaydınızı tamamlamak için <b>{email}</b> adresine bir doğrulama bağlantısı gönderdik.
        </p>
        <button 
          onClick={() => router.push("/login")}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
        >
          Giriş Sayfasına Dön
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-md w-full">
      {/* Logo */}
      <div className="text-center mb-10">
        <Link href="/" className="inline-block group">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 group-hover:text-blue-600 transition-colors uppercase">
            WARVANTA
          </h1>
        </Link>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">SaaS İK & Personel Yönetimi</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100"
      >
        <div className="mb-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Hesap Oluştur</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Platformu hemen kullanmaya başlayın.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Ad Soyad</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                required
                placeholder="İbrahim Şentinmaz"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-300 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">E-posta</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="email" 
                required
                placeholder="ahmet@sirket.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-300 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Şifre</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  required
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-300 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tekrar</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  required
                  placeholder="••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-300 transition-all"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 mt-4 group"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <> Kaydı Tamamla <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /> </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-400 font-medium">
          Zaten hesabınız var mı?{" "}
          <Link href="/login" className="text-blue-600 font-bold hover:underline">Giriş Yap</Link>
        </p>
      </motion.div>

      <p className="mt-8 text-[10px] text-slate-400 text-center leading-relaxed max-w-[280px] mx-auto uppercase tracking-tighter font-medium px-4">
        Devam ederek <span className="text-slate-600">Kullanım Şartları</span> ve <span className="text-slate-600">Gizlilik Politikası</span>'nı kabul etmiş olursunuz.
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
      <Suspense fallback={<div className="flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
