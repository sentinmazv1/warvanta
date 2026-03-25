"use client";

import { useState } from "react";
import { createInitialCompany } from "@/lib/actions/auth";
import { Building2, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Onboarding() {
  const [companyName, setCompanyName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await createInitialCompany(companyName);
      window.location.reload(); // Refresh to update layout state
    } catch (err: any) {
      setError(err.message || "Şirket oluşturulurken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center"
      >
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Building2 className="text-blue-600" size={32} />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Hoş Geldiniz!</h2>
        <p className="text-slate-500 mb-8 text-sm">
          Warvanta'yı kullanmaya başlamak için önce şirketinizin adını girmelisiniz.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Şirket Adı</label>
            <input 
              required
              type="text" 
              placeholder="örn: Warvanta Teknoloji A.Ş."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-lg text-left">{error}</p>
          )}

          <button 
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group disabled:bg-blue-400"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Şirketi Oluştur"}
            {!isSubmitting && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <p className="mt-8 text-[10px] text-slate-400 uppercase tracking-widest font-medium">
          Daha sonra şirket ayarlarından domain ve vergi no ekleyebilirsiniz.
        </p>
      </motion.div>
    </div>
  );
}
