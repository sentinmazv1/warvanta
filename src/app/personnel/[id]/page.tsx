"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEmployee, updateEmployee, getEmployeeDocuments } from "@/lib/actions/employees";
import { 
  ArrowLeft, Mail, Phone, Calendar, MapPin, 
  Briefcase, CreditCard, Save, Loader2, Camera,
  FileText, Clock, Shield, CheckCircle2, Trash2,
  Hash, Users, Droplets as DropletsIcon, Heart as HeartIcon, GraduationCap as GraduationCapIcon, Lightbulb as LightbulbIcon, Download as DownloadIcon
} from "lucide-react";
import { Employee } from "@/lib/types";
import Link from "next/link";

export default function PersonnelDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (id) {
        loadEmployee();
        loadDocuments();
    }
  }, [id]);

  async function loadDocuments() {
    try {
        const docs = await getEmployeeDocuments(id as string);
        setDocuments(docs);
    } catch (err) {
        console.error("Error loading documents:", err);
    }
  }

  async function loadEmployee() {
    try {
      const data = await getEmployee(id as string);
      setEmployee(data);
    } catch (err) {
      console.error("Error loading employee:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await updateEmployee(employee.id, {
        notes: employee.notes,
        phone: employee.phone,
        email: employee.email,
        blood_type: employee.blood_type,
        emergency_contact_name: employee.emergency_contact_name,
        emergency_contact_phone: employee.emergency_contact_phone,
        health_info: employee.health_info,
        education: employee.education,
        skills: employee.skills,
        tc_no: employee.tc_no,
        hire_date: employee.hire_date
      } as any);
      setMessage({ type: "success", text: "Bilgiler güncellendi." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Bir hata oluştu." });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !employee) return;

    setIsUploading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${employee.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateEmployee(employee.id, { photo_url: publicUrl });
      setEmployee({ ...employee, photo_url: publicUrl });
      setMessage({ type: "success", text: "Fotoğraf güncellendi." });
    } catch (err: any) {
      setMessage({ type: "error", text: "Fotoğraf yüklenemedi: " + err.message });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  if (!employee) return <div className="p-20 text-center">Personel bulunamadı.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <Link 
          href="/personnel"
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors"
        >
          <ArrowLeft size={18} /> Personel Listesine Dön
        </Link>
        <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                employee.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}>
                {employee.status === 'ACTIVE' ? 'Aktif Çalışan' : 'Pasif Çıkış Yapmış'}
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden text-center p-8">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-[2.5rem] bg-slate-50 border-2 border-slate-100 flex items-center justify-center overflow-hidden">
                {employee.photo_url ? (
                  <img src={employee.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-slate-300">
                    {employee.first_name[0]}{employee.last_name[0]}
                  </span>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <Loader2 className="animate-spin text-blue-600" />
                  </div>
                )}
              </div>
              <label 
                htmlFor="photo-upload"
                className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-2xl shadow-lg border-4 border-white hover:bg-blue-700 transition-all cursor-pointer"
              >
                <Camera size={16} />
                <input 
                  id="photo-upload"
                  type="file" 
                  accept="image/*"
                  className="hidden" 
                  onChange={handlePhotoChange}
                  disabled={isUploading}
                />
              </label>
            </div>
            
            <h2 className="text-2xl font-black text-slate-900">{employee.first_name} {employee.last_name}</h2>
            <p className="text-blue-600 font-bold text-sm mt-1">{employee.position_name || 'Pozisyon Belirtilmedi'}</p>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">{employee.department_name}</p>

            <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-3xl bg-slate-50/50 border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Puantaj</p>
                    <p className="text-lg font-black text-slate-900">%98</p>
                </div>
                <div className="p-4 rounded-3xl bg-slate-50/50 border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">İzin Bakiyesi</p>
                    <p className="text-lg font-black text-slate-900">14 GÜN</p>
                </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
             <div className="relative z-10 space-y-4">
                <h4 className="font-bold text-sm flex items-center gap-2">
                    <Shield className="text-blue-400" size={16} /> Hızlı Erişim
                </h4>
                <div className="grid grid-cols-1 gap-2">
                    <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700 font-bold text-xs group">
                        <span>Puantaj Kayıtları</span>
                        <Clock size={16} className="text-slate-500 group-hover:text-blue-400" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700 font-bold text-xs group">
                        <span>İzin Geçmişi</span>
                        <Calendar size={16} className="text-slate-500 group-hover:text-purple-400" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700 font-bold text-xs group">
                        <span>Bordrolar</span>
                        <CreditCard size={16} className="text-slate-500 group-hover:text-emerald-400" />
                    </button>
                </div>
             </div>
             <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl"></div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FileText className="text-blue-600" size={20} /> Personel Dosyası & Notlar
              </h3>
              {message.text && (
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {message.text}
                  </span>
              )}
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailItem icon={<Mail size={16}/>} label="E-Posta Adresi" value={employee.email} onChange={(val) => setEmployee({...employee, email: val} as any)} />
                    <DetailItem icon={<Phone size={16}/>} label="Telefon Numarası" value={employee.phone || ''} onChange={(val) => setEmployee({...employee, phone: val} as any)} />
                    <DetailItem icon={<Hash size={16}/>} label="TC Kimlik No" value={employee.tc_no} onChange={(val) => setEmployee({...employee, tc_no: val} as any)} />
                    <DetailItem icon={<Calendar size={16}/>} label="İşe Giriş" value={employee.hire_date} type="date" onChange={(val) => setEmployee({...employee, hire_date: val} as any)} />
                </div>

                <div className="pt-6 border-t border-slate-50">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Sağlık & Acil Durum</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DetailItem icon={<DropletsIcon size={16}/>} label="Kan Grubu" value={employee.blood_type || '-'} onChange={(val) => setEmployee({...employee, blood_type: val} as any)} />
                        <DetailItem icon={<HeartIcon size={16}/>} label="Acil Durum Kişisi" value={employee.emergency_contact_name || '-'} onChange={(val) => setEmployee({...employee, emergency_contact_name: val} as any)} />
                        <DetailItem icon={<Phone size={16}/>} label="Acil Durum Telefon" value={employee.emergency_contact_phone || '-'} onChange={(val) => setEmployee({...employee, emergency_contact_phone: val} as any)} />
                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Sağlık Bilgileri / İlaçlar</label>
                            <textarea 
                                className="w-full h-24 bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-sm"
                                value={employee.health_info || ""}
                                onChange={(e) => setEmployee({...employee, health_info: e.target.value} as any)}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-50">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Eğitim & Yetenekler</h4>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                <GraduationCapIcon size={14} className="text-slate-400" /> Eğitim Bilgisi
                            </label>
                            <textarea 
                                className="w-full h-24 bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-sm"
                                value={employee.education || ""}
                                onChange={(e) => setEmployee({...employee, education: e.target.value} as any)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                <LightbulbIcon size={14} className="text-slate-400" /> Yetenekler & Sertifikalar
                            </label>
                            <textarea 
                                className="w-full h-24 bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-sm"
                                value={employee.skills || ""}
                                onChange={(e) => setEmployee({...employee, skills: e.target.value} as any)}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-50">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Özel Personel Notları</label>
                    <textarea 
                        className="w-full h-32 bg-slate-50 border border-slate-100 rounded-[2rem] p-6 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-sm leading-relaxed"
                        placeholder="Ek notlar..."
                        value={employee.notes || ""}
                        onChange={(e) => setEmployee({...employee, notes: e.target.value} as any)}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                    <button 
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-900/10 hover:bg-blue-700 transition-all disabled:bg-slate-200"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Bilgileri Güncelle
                    </button>
                </div>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-800 text-sm">Yüklenen Dosyalar</h4>
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">{documents.length} DOSYA</span>
                </div>
                <div className="space-y-2">
                    {documents.map(doc => (
                        <div key={doc.id} className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-blue-500">
                                    <FileText size={16} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900">{doc.name}</p>
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{doc.category}</p>
                                </div>
                            </div>
                            <a 
                                href={doc.file_url} 
                                target="_blank" 
                                className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                            >
                                <DownloadIcon size={16} />
                            </a>
                        </div>
                    ))}
                    {documents.length === 0 && (
                        <p className="text-[10px] text-slate-400 italic text-center py-4 bg-slate-50 rounded-2xl">Yüklenen dosya bulunmuyor.</p>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value, type = "text", onChange }: { icon: React.ReactNode, label: string, value: string, type?: string, onChange?: (val: string) => void }) {
    return (
        <div className="space-y-1.5 group">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{label}</label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    {icon}
                </div>
                {onChange ? (
                    <input 
                        type={type}
                        className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-slate-100 focus:border-blue-200 outline-none transition-all text-sm font-medium"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                ) : (
                    <div className="w-full pl-12 pr-4 py-3 bg-slate-50/50 rounded-2xl border border-transparent text-sm font-bold text-slate-700">
                        {value}
                    </div>
                )}
            </div>
        </div>
    );
}
