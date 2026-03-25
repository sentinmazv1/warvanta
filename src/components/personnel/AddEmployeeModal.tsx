"use client";

import { useState, useEffect } from "react";
import { X, User, MapPin, Briefcase, CreditCard, Calendar, Loader2, Camera, Trash2, Plus, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addEmployee, addEmployeeDocument } from "@/lib/actions/employees";
import { getDepartments, getPositions } from "@/lib/actions/organization";
import { Department, Position as PositionType } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (employee: any) => void;
}

export default function AddEmployeeModal({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    tc_no: "",
    email: "",
    phone: "",
    birth_date: "",
    hire_date: new Date().toISOString().split('T')[0],
    department_id: "",
    position_id: "",
    base_salary: "",
    photo_url: "",
    blood_type: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    health_info: "",
    education: "",
    skills: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<PositionType[]>([]);
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  
  const [selectedDocs, setSelectedDocs] = useState<{file: File, category: string}[]>([]);

  async function loadData() {
    try {
      const [depts, pos] = await Promise.all([
        getDepartments(),
        getPositions()
      ]);
      setDepartments(depts);
      setPositions(pos);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `employees/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const uploadDoc = async (file: File, employeeId: string, category: string) => {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `employees/${employeeId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    await addEmployeeDocument(employeeId, file.name, publicUrl, category);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      let finalPhotoUrl = formData.photo_url;
      if (photoFile) {
        finalPhotoUrl = await uploadPhoto(photoFile);
      }

      const newEmployee = await addEmployee({
        ...formData,
        photo_url: finalPhotoUrl,
        base_salary: Number(formData.base_salary)
      } as any);

      if (selectedDocs.length > 0) {
        await Promise.all(selectedDocs.map(doc => uploadDoc(doc.file, newEmployee.id, doc.category)));
      }

      onSuccess(newEmployee);
      onClose();
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
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
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0 bg-white">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <User className="text-blue-600" size={20} /> Yeni Personel Kaydı
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-0 overflow-y-auto flex-1">
            <div className="p-8 space-y-8">
              {/* Photo Upload Section */}
              <div className="flex flex-col items-center gap-4 py-4 border-b border-slate-50">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-300">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={32} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {photoPreview && (
                    <button 
                      type="button"
                      onClick={() => { setPhotoFile(null); setPhotoPreview(""); }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-xl shadow-lg hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profil Fotoğrafı Yükle</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Adı</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                    placeholder="örn: Ahmet"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Soyadı</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                    placeholder="örn: Yılmaz"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">TC Kimlik No</label>
                  <input 
                    required
                    maxLength={11}
                    type="text" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                    placeholder="11 haneli"
                    value={formData.tc_no}
                    onChange={(e) => setFormData({...formData, tc_no: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Doğum Tarihi</label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="date" 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm pr-10"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Departman</label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select 
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm appearance-none bg-white pr-10 font-medium"
                      value={formData.department_id}
                      onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                    >
                      <option value="">Departman Seçiniz</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Pozisyon</label>
                  <div className="relative">
                    <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select 
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm appearance-none bg-white pr-10 font-medium"
                      value={formData.position_id}
                      onChange={(e) => setFormData({...formData, position_id: e.target.value})}
                    >
                      <option value="">Pozisyon Seçiniz</option>
                      {positions.map(pos => (
                        <option key={pos.id} value={pos.id}>{pos.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Maaş (Net)</label>
                  <div className="relative">
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="number" 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm pr-10"
                      placeholder="0.00"
                      value={formData.base_salary}
                      onChange={(e) => setFormData({...formData, base_salary: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">İşe Giriş Tarihi</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                    value={formData.hire_date}
                    onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
                  />
                </div>
              </div>

              {/* Sağlık & İletişim Section */}
              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Sağlık & Acil Durum</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Kan Grubu</label>
                    <select 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm bg-white font-medium"
                      value={formData.blood_type}
                      onChange={(e) => setFormData({...formData, blood_type: e.target.value})}
                    >
                      <option value="">Seçiniz</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'].map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Acil Durum İletişim (İsim)</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                      placeholder="örn: Yakın Adı"
                      value={formData.emergency_contact_name}
                      onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Acil Durum İletişim (Telefon)</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                      placeholder="örn: 0555..."
                      value={formData.emergency_contact_phone}
                      onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Kronik Rahatsızlıklar / İlaçlar</label>
                    <textarea 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm min-h-[80px]"
                      placeholder="Varsa belirtiniz..."
                      value={formData.health_info}
                      onChange={(e) => setFormData({...formData, health_info: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Eğitim & Yetenekler Section */}
              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Eğitim & Yetenekler</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Eğitim Bilgisi</label>
                    <textarea 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm min-h-[80px]"
                      placeholder="Okul, Mezuniyet Yılı vb."
                      value={formData.education}
                      onChange={(e) => setFormData({...formData, education: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Yetenekler</label>
                    <textarea 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm min-h-[80px]"
                      placeholder="Sertifikalar, Teknik Bilgi vb."
                      value={formData.skills}
                      onChange={(e) => setFormData({...formData, skills: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Dosya Yükleme Section */}
              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dosya Yükleme</h4>
                  <div className="relative">
                    <input 
                      type="file" 
                      multiple
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setSelectedDocs([...selectedDocs, ...files.map(f => ({ file: f, category: "Diğer" }))]);
                      }}
                    />
                    <button type="button" className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline">
                      <Plus size={14} /> Dosya Ekle
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedDocs.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 group">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">{doc.file.name}</p>
                        <p className="text-[10px] text-slate-400">{(doc.file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <select 
                        className="bg-white border border-slate-200 rounded-lg text-[10px] font-bold px-2 py-1 outline-none"
                        value={doc.category}
                        onChange={(e) => {
                          const newDocs = [...selectedDocs];
                          newDocs[idx].category = e.target.value;
                          setSelectedDocs(newDocs);
                        }}
                      >
                        <option value="Kimlik">Kimlik</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Sertifika">Sertifika</option>
                        <option value="Sözleşme">Sözleşme</option>
                        <option value="Sağlık">Sağlık</option>
                        <option value="Diğer">Diğer</option>
                      </select>
                      <button 
                        type="button"
                        onClick={() => setSelectedDocs(selectedDocs.filter((_, i) => i !== idx))}
                        className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {selectedDocs.length === 0 && (
                    <p className="text-[11px] text-slate-400 italic text-center py-4 border-2 border-dashed border-slate-50 rounded-2xl">
                      Henüz dosya seçilmedi.
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600 flex items-center gap-2">
                  <AlertCircle size={16} /> {error}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 sticky bottom-0">
              <button 
                type="button" 
                disabled={isSubmitting}
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Vazgeç
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-8 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-all disabled:bg-blue-400 flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
                {isSubmitting ? "Kaydediliyor..." : "Personeli Kaydet"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
