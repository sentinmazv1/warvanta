"use client";

import { useState } from "react";
import { MessageSquare, Send, Loader2, CheckCircle2, AlertCircle, LifeBuoy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendFeedback } from "@/lib/actions/support";

export default function FeedbackForm() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null, text: string }>({ type: null, text: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    setIsSubmitting(true);
    setStatus({ type: null, text: "" });

    try {
      await sendFeedback(subject, message);
      setStatus({ 
        type: "success", 
        text: "Geri bildiriminiz başarıyla iletildi. Teşekkür ederiz!" 
      });
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setStatus({ 
        type: "error", 
        text: err.message || "Geri bildirim gönderilirken bir hata oluştu." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
            <MessageSquare size={24} />
        </div>
        <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Geri Bildirim & Talep</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Warvanta'yı birlikte geliştirelim. Taleplerinizi bekliyoruz.</p>
        </div>
      </div>

      <div className="p-8">
        <AnimatePresence mode="wait">
          {status.type === "success" ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center text-center space-y-4"
            >
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle2 size={40} />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-slate-900">Mesajınız Alındı</h4>
                <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
                  {status.text}
                </p>
              </div>
              <button 
                onClick={() => setStatus({ type: null, text: "" })}
                className="mt-4 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs transition-all hover:bg-slate-800"
              >
                Yeni Form Gönder
              </button>
            </motion.div>
          ) : (
            <motion.form 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit} 
              className="space-y-6"
            >
                {status.type === "error" && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
                        <AlertCircle size={18} />
                        {status.text}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Konu / Kategori</label>
                    <input 
                        type="text"
                        placeholder="Örn: Yeni özellik talebi, Hata bildirimi vb."
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-200 outline-none transition-all font-medium text-sm"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Detaylı Mesajınız</label>
                    <textarea 
                        placeholder="Lütfen talebinizi veya yaşadığınız sorunu detaylandırın..."
                        className="w-full h-40 px-6 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-blue-100 focus:border-blue-200 outline-none transition-all font-medium text-sm leading-relaxed"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                    />
                </div>

                <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50 flex items-start gap-4">
                    <LifeBuoy className="text-blue-500 shrink-0" size={20} />
                    <p className="text-[11px] text-blue-800/70 leading-relaxed font-medium">
                        Gönderdiğiniz her geri bildirim doğrudan geliştirici ekibimize (ibrahimsentinmaz@gmail.com) iletilmektedir. Platformu iyileştirmek için katkılarınız bizim için çok değerlidir.
                    </p>
                </div>

                <div className="flex justify-end pt-4">
                    <button 
                        type="submit"
                        disabled={isSubmitting || !subject || !message}
                        className="flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-900/10 hover:bg-blue-700 transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                        Geri Bildirim Gönder
                    </button>
                </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
