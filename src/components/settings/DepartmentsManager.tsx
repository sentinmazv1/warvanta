"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, MapPin, Loader2, Users } from "lucide-react";
import { getDepartments, addDepartment } from "@/lib/actions/organization";
import { Department } from "@/lib/types";

export default function DepartmentsManager() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDeptName, setNewDeptName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  async function loadDepartments() {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (err) {
      console.error("Error loading departments:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    setIsAdding(true);
    try {
      const newItem = await addDepartment(newDeptName);
      setDepartments([...departments, newItem]);
      setNewDeptName("");
    } catch (err: any) {
      console.error("Error adding department:", err);
      alert("Departman eklenirken bir hata oluştu: " + (err.message || "Yetki hatası."));
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-50">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="text-blue-600" size={24} /> Departman Yönetimi
        </h3>
        <p className="text-slate-500 text-sm mt-1 font-medium">Şirketinizin organizasyon yapısını buradan oluşturun.</p>
      </div>

      <div className="p-8 space-y-8">
        <form onSubmit={handleAdd} className="flex gap-4">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Yeni departman adı (örn: Muhasebe)"
              className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-sm"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            disabled={isAdding || !newDeptName.trim()}
            className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-900/10 hover:bg-blue-700 transition-all disabled:bg-slate-200 flex items-center gap-2"
          >
            {isAdding ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            Ekle
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            <div className="col-span-2 py-12 flex justify-center">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : departments.length > 0 ? (
            departments.map((dept) => (
              <div key={dept.id} className="group p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
                    <Users size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{dept.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Aktif Departman</p>
                  </div>
                </div>
                <button className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-2 py-12 text-center text-slate-400 text-sm font-medium italic">
              Henüz bir departman tanımlanmamış.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
