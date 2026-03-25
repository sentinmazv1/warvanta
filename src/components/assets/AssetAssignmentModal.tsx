"use client";

import { useState, useEffect } from "react";
import { X, User, ArrowRightLeft, Loader2, Save, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { assignAsset } from "@/lib/actions/assets";
import { getEmployees } from "@/lib/actions/employees";
import { Asset, Employee } from "@/lib/types";

interface AssetAssignmentModalProps {
  isOpen: boolean;
  asset: Asset | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssetAssignmentModal({ isOpen, asset, onClose, onSuccess }: AssetAssignmentModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen]);

  async function loadEmployees() {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset || !selectedEmployeeId) return;
    
    setIsSubmitting(true);
    setError("");

    try {
      await assignAsset(asset.id, selectedEmployeeId, note);
      onSuccess();
      onClose();
      setSelectedEmployeeId("");
      setNote("");
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !asset) return null;

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
              <ArrowRightLeft className="text-blue-600" size={24} /> Zimmet Atama
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Zimmetlenecek Ürün</p>
                <h4 className="font-black text-slate-900 text-lg">{asset.name}</h4>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">{asset.serial_no}</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Personel Seçimi</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <select 
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold appearance-none"
                      value={selectedEmployeeId}
                      onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    >
                      <option value="">İsim seçiniz...</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                      ))}
                    </select>
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Ek Not (Opsiyonel)</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 text-slate-300" size={18} />
                    <textarea 
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium min-h-[100px]"
                      placeholder="Zimmet teslimi ile ilgili not..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
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
                disabled={isSubmitting}
                onClick={onClose}
                className="flex-1 px-6 py-4 rounded-2xl text-slate-400 font-bold text-sm hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Vazgeç
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting || !selectedEmployeeId}
                className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-900/10 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:bg-slate-200 shadow-none border border-transparent shadow-blue-900/20"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Zimmeti Onayla
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
