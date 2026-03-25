"use client";

import { useState } from "react";
import { X, Laptop, Smartphone, Monitor, Briefcase, Hash, Save, Loader2, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addAsset } from "@/lib/actions/assets";

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ASSET_TYPES = [
  { id: 'COMPUTER', label: 'Bilgisayar', icon: <Laptop size={18} /> },
  { id: 'PHONE', label: 'Telefon', icon: <Smartphone size={18} /> },
  { id: 'MONITOR', label: 'Monitör / Ekran', icon: <Monitor size={18} /> },
  { id: 'OTHER', label: 'Diğer / Çanta vb.', icon: <Briefcase size={18} /> },
];

export default function AddAssetModal({ isOpen, onClose, onSuccess }: AddAssetModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "COMPUTER",
    serial_no: "",
    model: "",
    location: "Merkez"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await addAsset(formData as any);
      onSuccess();
      onClose();
      setFormData({ name: "", type: "COMPUTER", serial_no: "", model: "", location: "Merkez" });
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
              <Laptop className="text-blue-600" size={24} /> Yeni Varlık Kaydı
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-2 mb-6">
              {ASSET_TYPES.map((type) => (
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

            <div className="space-y-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Ürün / Varlık Adı</label>
                  <input 
                    required
                    className="w-full px-5 py-3 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                    placeholder="Örn: MacBook Pro 14 M3"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Seri No / IMEI</label>
                    <div className="relative">
                       <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                       <input 
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                        placeholder="ABC-123"
                        value={formData.serial_no}
                        onChange={(e) => setFormData({...formData, serial_no: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Lokasyon</label>
                    <div className="relative">
                       <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                       <input 
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                        placeholder="Örn: Merkez Depo"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                      />
                    </div>
                  </div>
               </div>
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
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Kaydet
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
