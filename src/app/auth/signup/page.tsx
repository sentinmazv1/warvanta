"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, ShieldCheck, ArrowRight, User, Mail, Lock, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { bypassSignup } from "@/lib/actions/auth";

export default function SignupPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const translateError = (msg: string) => {
    if (msg.includes("rate limit exceeded")) return "Çok fazla deneme yaptınız. Lütfen güvenlik nedeniyle bir süre bekleyip tekrar deneyin.";
    if (msg.includes("only request this after")) {
      const seconds = msg.match(/\d+/)?.[0] || "birkaç";
      return `Güvenlik nedeniyle ${seconds} saniye sonra tekrar deneyebilirsiniz.`;
    }
    if (msg.includes("Email address") && msg.includes("invalid")) return "Geçersiz e-posta adresi. Lütfen kontrol edip tekrar deneyin.";
    if (msg.includes("User already registered")) return "Bu e-posta adresi ile zaten bir hesap oluşturulmuş.";
    if (msg.includes("Signup is disabled")) return "Şu anda yeni üyelik alımı kapalıdır.";
    return msg;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Şifreler uyuşmuyor.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Using administrative bypass to avoid IP rate limits
      await bypassSignup(email, password);
      setIsCompleted(true);
    } catch (err: any) {
      setError(translateError(err.message || "Bir hata oluştu."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-12 text-center space-y-6"
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-500 mx-auto shadow-lg shadow-emerald-500/10">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Harika! Hesabınız Hazır.</h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            Kaydınız başarıyla tamamlandı. Artık giriş yaparak <strong>Warvanta</strong> dünyasına adım atabilirsiniz.
          </p>
          <button 
            onClick={() => window.location.href = "/login"}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
          >
            Giriş Yap <ArrowRight size={20} />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-24 opacity-5 pointer-events-none">
        <Sparkles size={400} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-10 relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6 shadow-lg shadow-blue-500/10">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 mb-2">
            Warvanta'ya Hoş Geldiniz!
          </h1>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Başvurunuz onaylandı. Lütfen hesabınız için bir şifre belirleyin.
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">E-Posta Adresi</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                readOnly
                type="email" 
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-500 font-bold outline-none"
                value={email}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Yeni Şifre</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                required
                type="password" 
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold placeholder:text-slate-300"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Şifre Tekrar</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                required
                type="password" 
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold placeholder:text-slate-300"
                placeholder="••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-red-50 rounded-2xl border border-red-100"
              >
                <p className="text-xs font-bold text-red-500 leading-relaxed text-center">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-2xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:bg-blue-400 transform active:scale-[0.98]"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Hesabımı Oluştur ve Başla"}
          </button>
        </form>

        <p className="mt-8 text-[10px] text-slate-400 text-center leading-relaxed font-bold">
          Devam ederek Kullanım Şartları ve Gizlilik Politikası'nı kabul etmiş olursunuz.
        </p>
      </motion.div>
    </div>
  );
}
