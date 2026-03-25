"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, Loader2, Save, Users, Clock, 
  Calendar, Package, BarChart3, Settings, CheckCircle2,
  ChevronRight, AlertCircle, Info, Lock
} from "lucide-react";
import { getDepartments, updateDepartmentPermissions } from "@/lib/actions/organization";
import { Department } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

const PERMISSION_KEYS: { key: keyof NonNullable<Department['permissions']>, label: string, icon: any, description: string }[] = [
  // Personnel
  { key: "can_view_personnel", label: "Personel Listesi", icon: Users, description: "Tüm personel listesini ve temel bilgileri görebilir." },
  { key: "can_manage_personnel", label: "Personel Yönetimi", icon: Users, description: "Yeni personel ekleyebilir ve bilgilerini güncelleyebilir." },
  
  // Attendance
  { key: "can_manage_self_attendance", label: "Kendi Mesaisini Yönetme", icon: Clock, description: "Giriş-çıkış yapabilir ve kendi kayıtlarını görebilir." },
  { key: "can_view_dept_attendance", label: "Departman Puantajı", icon: Clock, description: "Bağlı olduğu departmandaki tüm giriş-çıkışları görebilir." },
  { key: "can_view_company_attendance", label: "Şirket Puantajı", icon: Clock, description: "Tüm şirketin giriş-çıkış kayıtlarını ve admin panelini görebilir." },

  // Leaves
  { key: "can_create_self_leave", label: "Kendi İzin Talebi", icon: Calendar, description: "Kendisi için izin talebi oluşturabilir." },
  { key: "can_view_dept_leaves", label: "Departman İzinleri", icon: Calendar, description: "Bağlı olduğu departmandaki izin taleplerini görebilir." },
  { key: "can_view_company_leaves", label: "Tüm İzinler", icon: Calendar, description: "Şirketteki tüm izin taleplerini görebilir." },
  { key: "can_approve_leaves", label: "İzin Onay Yetkisi", icon: Calendar, description: "İzin taleplerini onaylama veya reddetme yetkisi." },

  // Assets
  { key: "can_view_own_assets", label: "Kendi Zimmetleri", icon: Package, description: "Üzerine zimmetli eşyaları görebilir." },
  { key: "can_view_company_assets", label: "Tüm Zimmetler", icon: Package, description: "Şirketteki tüm zimmetleri ve atamaları görebilir." },

  
  { key: "can_view_reports", label: "Raporlara Erişim", icon: BarChart3, description: "Özel raporları ve istatistikleri görebilir." },
  { key: "can_manage_settings", label: "Ayarları Yönet", icon: Settings, description: "Şirket bilgilerini ve sistem ayarlarını değiştirebilir." },
];

export default function DepartmentPermissions() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    loadDepartments();
  }, []);

  async function loadDepartments() {
    setIsLoading(true);
    try {
      const data = await getDepartments();
      setDepartments(data);
      if (data.length > 0) setSelectedDept(data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleToggle = (key: keyof NonNullable<Department['permissions']>) => {
    if (!selectedDept) return;
    
    const currentPermissions = selectedDept.permissions || {};
    const newPermissions = {
      ...currentPermissions,
      [key]: !currentPermissions[key]
    };

    setSelectedDept({
      ...selectedDept,
      permissions: newPermissions
    });
  };

  const handleSave = async () => {
    if (!selectedDept) return;
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await updateDepartmentPermissions(selectedDept.id, selectedDept.permissions);
      setMessage({ type: "success", text: `${selectedDept.name} yetkileri başarıyla güncellendi.` });
      // Update local list
      setDepartments(departments.map(d => d.id === selectedDept.id ? selectedDept : d));
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Kaydetme sırasında bir hata oluştu." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
      {/* Department List */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest px-2">Departmanlar</h3>
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => {
                  setSelectedDept(dept);
                  setMessage({ type: "", text: "" });
              }}
              className={`w-full p-6 text-left flex items-center justify-between border-b border-slate-50 last:border-0 transition-all ${
                selectedDept?.id === dept.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  selectedDept?.id === dept.id ? 'bg-white shadow-sm' : 'bg-slate-100'
                }`}>
                  {dept.name.charAt(0)}
                </div>
                <span className="font-bold text-sm">{dept.name}</span>
              </div>
              <ChevronRight size={16} className={selectedDept?.id === dept.id ? 'text-blue-600' : 'text-slate-300'} />
            </button>
          ))}
        </div>
      </div>

      {/* Permissions Grid */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-900/10">
                        <Lock size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900">{selectedDept?.name} Yetkileri</h3>
                        <p className="text-xs text-slate-500 font-medium">Bu departmandaki çalışanlara tanınacak modül yetkileri.</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Güncelle
                </button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div 
                    key={selectedDept?.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    {PERMISSION_KEYS.map((perm) => (
                        <div 
                            key={perm.key}
                            onClick={() => handleToggle(perm.key)}
                            className={`p-6 rounded-3xl border transition-all cursor-pointer group flex items-start gap-4 ${
                                selectedDept?.permissions?.[perm.key] 
                                ? 'bg-blue-50/50 border-blue-200' 
                                : 'bg-slate-50/30 border-slate-100 hover:border-slate-200'
                            }`}
                        >
                            <div className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                selectedDept?.permissions?.[perm.key]
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-slate-400 border border-slate-100'
                            }`}>
                                <perm.icon size={18} />
                            </div>
                            <div className="flex-1">
                                <h4 className={`text-sm font-bold ${
                                    selectedDept?.permissions?.[perm.key] ? 'text-blue-900' : 'text-slate-700'
                                }`}>
                                    {perm.label}
                                </h4>
                                <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">
                                    {perm.description}
                                </p>
                            </div>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                                selectedDept?.permissions?.[perm.key]
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-white border-slate-200'
                            }`}>
                                {selectedDept?.permissions?.[perm.key] && <CheckCircle2 size={12} strokeWidth={4} />}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </AnimatePresence>

            {message.text && (
                <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 ${
                    message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                    {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                </div>
            )}

            <div className="pt-4 flex items-center gap-3 text-amber-600 bg-amber-50 p-6 rounded-3xl border border-amber-100">
                <Info size={20} className="shrink-0" />
                <p className="text-[11px] font-medium leading-relaxed">
                    <strong>Dikkat:</strong> Departman bazlı yetkiler, çalışanların modül erişimlerini kısıtlar veya açar. Şirket yöneticisi (COMPANY_ADMIN) olan kullanıcılar bu kısıtlamalardan etkilenmez ve her zaman tam yetkiye sahiptir.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
