"use client";

import { useState, useEffect } from "react";
import { Building2, Save, Loader2, Camera, MapPin, Hash, Globe, Clock, Info } from "lucide-react";
import { getCompany, updateCompany } from "@/lib/actions/organization";
import { Company } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

export default function CompanySettings() {
  const [company, setCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    tax_no: "",
    address: "",
    domain: "",
    logo_url: "",
    latitude: 0,
    longitude: 0,
    radius_meters: 200,
    settings: {} as any
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    loadCompany();
  }, []);

  async function loadCompany() {
    try {
      const data = await getCompany();
      if (data) {
        setCompany(data);
        setFormData({
          name: data.name || "",
          tax_no: data.tax_no || "",
          address: data.address || "",
          domain: data.domain || "",
          logo_url: data.logo_url || "",
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
          radius_meters: data.radius_meters || 200,
          settings: data.settings || {}
        });
        setLogoPreview(data.logo_url || "");
      }
    } catch (err) {
      console.error("Error loading company:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (file: File): Promise<string> => {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${company?.id || 'new'}_logo_${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('company-logos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('company-logos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      let finalLogoUrl = formData.logo_url;
      if (logoFile) {
        finalLogoUrl = await uploadLogo(logoFile);
      }

      await updateCompany({
        ...formData,
        logo_url: finalLogoUrl
      });

      setMessage({ type: "success", text: "Şirket bilgileri başarıyla güncellendi." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Güncelleme sırasında bir hata oluştu." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-12">
      <div className="p-8 border-b border-slate-50">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="text-blue-600" size={24} /> Şirket Profil Ayarları
        </h3>
        <p className="text-slate-500 text-sm mt-1 font-medium">Kurumsal kimlik ve iletişim bilgilerinizi güncelleyin.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Logo Section */}
        <div className="flex flex-col md:flex-row items-center gap-8 py-4 border-b border-slate-50">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-300">
              {logoPreview ? (
                <img src={logoPreview} alt="Company Logo" className="w-full h-full object-contain p-4" />
              ) : (
                <Camera size={40} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
              )}
            </div>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleLogoChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="font-bold text-slate-800 text-lg">Şirket Logosu</h4>
            <p className="text-slate-500 text-sm mt-1 max-w-sm font-medium">
              Sistem üzerindeki tüm raporlarda ve e-postalarda görünecek logonuzu yükleyin. (En fazla 2MB)
            </p>
            <button type="button" className="mt-4 text-xs font-bold text-blue-600 uppercase tracking-widest hover:underline">
              Logoyu Değiştir
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Şirket Resmi Adı</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                type="text" 
                className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-sm"
                placeholder="Şirket adı"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Vergi Numarası / Mersis</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-sm"
                placeholder="Vergi No"
                value={formData.tax_no}
                onChange={(e) => setFormData({...formData, tax_no: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Work settings removed (Manual Puantaj active) */}

        {message.text && (
          <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${
            message.type === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
          }`}>
            {message.text}
          </div>
        )}

        <div className="pt-8 border-t border-slate-50 flex justify-end">
          <button 
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-[1.5rem] font-bold shadow-xl shadow-blue-900/10 hover:bg-blue-700 hover:-translate-y-1 transition-all disabled:bg-slate-200"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Ayarları Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
