"use client";

import { useState } from "react";
import { X, Calendar, Plane, Heart, Home, Star, Send, Loader2, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { requestLeave } from "@/lib/actions/leaves";

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LEAVE_TYPES = [
  { id: 'ANNUAL', label: 'Yıllık İzin', icon: <Plane size={18} /> },
  { id: 'SICK', label: 'Hastalık / Sağlık', icon: <Heart size={18} /> },
  { id: 'PATERNITY', label: 'Babalık / Evlilik', icon: <Star size={18} /> },
  { id: 'OTHER', label: 'Mazeret / Diğer', icon: <Home size={18} /> },
];

export default function LeaveRequestModal({ isOpen, onClose, onSuccess }: LeaveRequestModalProps) {
  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
    type: "ANNUAL",
    reason: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await requestLeave(formData as any);
      onSuccess();
      onClose();
      setFormData({ start_date: "", end_date: "", type: "ANNUAL", reason: "" });
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
          onClick={onClose} 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-8 border-b border-slate-50">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="text-blue-600" size={24} /> Yeni İzin Talebi
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-2 mb-6">
              {LEAVE_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData({...formData, type: type.id})}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                    formData.type === type.id 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-900/10' 
                      : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {type.icon}
                  <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Başlangıç Tarihi</label>
                  <input 
                    required
                    type="date"
                    className="w-full px-5 py-3 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Bitiş Tarihi</label>
                  <input 
                    required
                    type="date"
                    className="w-full px-5 py-3 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  />
               </div>
            </div>

            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">İzin Gerekçesi</label>
               <textarea 
                 required
                 className="w-full h-24 px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                 placeholder="Lütfen kısa bir açıklama yazınız..."
                 value={formData.reason}
                 onChange={(e) => setFormData({...formData, reason: e.target.value})}
               />
            </div>

            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-3">
                <Info size={18} className="text-blue-500 shrink-0" />
                <p className="text-[10px] text-blue-700 font-bold leading-relaxed">
                    Talebiniz departman yöneticiniz ve İK birimi tarafından incelenecek ve onaylandığında size bildirim gönderilecektir.
                </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-2xl border border-red-100">
                {error}
              </div>
            )}

            <div className="pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 px-6 py-4 rounded-2xl text-slate-400 font-bold text-sm hover:bg-slate-50 transition-all"
              >
                Vazgeç
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-900/10 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                Talebi Gönder
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
