"use client";

import { useState, useEffect } from "react";
import { Briefcase, Plus, Trash2, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { getPositions, addPosition, deletePosition } from "@/lib/actions/organization";
import { Position } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

export default function PositionSettings() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newName, setNewName] = useState("");
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadPositions();
  }, []);

  async function loadPositions() {
    setIsLoading(true);
    try {
      const data = await getPositions();
      setPositions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAdd() {
    if (!newName.trim()) return;
    setIsSubmitting(true);
    setMessage(null);
    try {
      await addPosition(newName.trim());
      setNewName("");
      setMessage({ type: 'success', text: "Pozisyon başarıyla eklendi." });
      loadPositions();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Pozisyon eklenirken bir hata oluştu." });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu pozisyonu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
    try {
      await deletePosition(id);
      loadPositions();
    } catch (err: any) {
      alert(err.message || "Pozisyon silinirken bir hata oluştu.");
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <Briefcase className="text-blue-600" size={24} /> Şirket Pozisyonları
            </h3>
            <p className="text-slate-500 text-sm font-medium">Personel kartlarında kullanılacak unvan ve pozisyonları yönetin.</p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Yeni Pozisyon Adı..." 
              className="flex-1 md:w-64 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-sm"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button 
              disabled={isSubmitting || !newName.trim()}
              onClick={handleAdd}
              className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-blue-900/10 hover:bg-blue-700 disabled:opacity-50 disabled:translate-y-0 transition-all flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
              Ekle
            </button>
          </div>
        </div>

        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl flex items-center gap-3 mb-6 font-bold text-xs ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </motion.div>
        )}

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Yükleniyor...</p>
          </div>
        ) : positions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {positions.map((pos) => (
                <motion.div 
                  layout
                  key={pos.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] flex items-center justify-between group hover:bg-white hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors shadow-sm">
                      <Briefcase size={18} />
                    </div>
                    <span className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{pos.name}</span>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(pos.id)}
                    className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem]">
            <Briefcase className="text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-bold text-sm italic">Henüz pozisyon tanımlanmamış.</p>
          </div>
        )}
      </div>
    </div>
  );
}
