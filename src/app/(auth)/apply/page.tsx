"use client";

import { useState } from "react";
import { Shield, ArrowRight, CheckCircle2, Building2, User, Mail, Phone, Users, Briefcase, MessageSquare, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { submitApplication } from "@/lib/actions/auth";
import { sendPublicContactMessage } from "@/lib/actions/support";
import { toast } from "react-hot-toast";

export default function ApplyPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Contact form state (for unauthenticated visitors)
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const [formData, setFormData] = useState({
    company_name: "",
    contact_person_name: "",
    contact_email: "",
    contact_phone: "",
    employee_count_range: "",
    sector: "",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await submitApplication(formData);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Başvuru sırasında bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center border border-slate-100"
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Başvurunuz Alındı!</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Harika! Bilgileriniz sistemimize kaydedildi. Ekibimiz sizinle en kısa sürede iletişime geçerek hesabınızı aktif hale getirecektir.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline">
            Ana Sayfaya Dön <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 py-12">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Left Side: Info */}
        <div className="bg-slate-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-2 mb-12">
              <Shield size={28} className="text-blue-500" />
              <span className="text-xl font-black tracking-tighter">WARVANTA</span>
            </Link>
            <h1 className="text-4xl font-bold mb-6 leading-tight">Şirketinizi Dijitalleştirin.</h1>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Warvanta ile profesyonel İK yönetimine ilk adımı atın. Formu doldun, tüm özelliklere sınırsız erişim sağlayın.
            </p>
            
            <div className="space-y-4">
              <FeatureItem label="Hızlı Kurulum & Kolay Kullanım" />
              <FeatureItem label="Sınırsız Personel Kaydı" />
              <FeatureItem label="Dijital Evrak Arşivi" />
              <FeatureItem label="Bulut Tabanlı Veri Güvenliği" />
            </div>
          </div>
          
          <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/10 relative z-10">
             <h3 className="text-xs text-white uppercase font-black tracking-widest mb-4">Bir sorunuz mu var?</h3>
             {contactStatus === "sent" ? (
                <div className="text-emerald-400 text-sm font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} /> Mesajınız iletildi.
                </div>
             ) : (
                <div className="space-y-3">
                    <input 
                        type="email" 
                        placeholder="E-posta adresiniz"
                        className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-blue-500 transition-all font-medium"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                    />
                    <textarea 
                        placeholder="Mesajınız..."
                        className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-blue-500 transition-all font-medium min-h-[60px]"
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                    />
                    <button 
                        type="button"
                        onClick={async () => {
                            if (!contactEmail || !contactMessage) {
                                toast.error("E-posta ve mesaj gereklidir.");
                                return;
                            }
                            setContactStatus("sending");
                            try {
                                await sendPublicContactMessage(contactEmail, contactMessage);
                                setContactStatus("sent");
                                toast.success("Mesajınız gönderildi.");
                            } catch (err) {
                                setContactStatus("error");
                                toast.error("Gönderilemedi.");
                            }
                        }}
                        disabled={contactStatus === "sending"}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                        {contactStatus === "sending" ? <Loader2 size={14} className="animate-spin" /> : "İLETİŞİME GEÇ"}
                    </button>
                </div>
             )}
          </div>

          {/* Decorative */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        </div>

        {/* Right Side: Form */}
        <div className="p-12 overflow-y-auto max-h-[90vh]">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Başvuru Formu</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <InputGroup label="İletişim Kişisi" icon={<User size={16} />} placeholder="Ad Soyad" 
              value={formData.contact_person_name} 
              onChange={(v) => setFormData({...formData, contact_person_name: v})}
              required
            />
            
            <InputGroup label="Şirket Adı" icon={<Building2 size={16} />} placeholder="Şirket Tam Ünvanı"
              value={formData.company_name} 
              onChange={(v) => setFormData({...formData, company_name: v})}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputGroup label="E-posta" icon={<Mail size={16} />} placeholder="is@sirket.com" 
                type="email"
                value={formData.contact_email} 
                onChange={(v) => setFormData({...formData, contact_email: v})}
                required
              />
              <InputGroup label="Telefon" icon={<Phone size={16} />} placeholder="05xx ..." 
                value={formData.contact_phone} 
                onChange={(v) => setFormData({...formData, contact_phone: v})}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectGroup label="Personel Sayısı" icon={<Users size={16} />} 
                options={["1-10", "11-50", "51-200", "201+"]}
                value={formData.employee_count_range} 
                onChange={(v) => setFormData({...formData, employee_count_range: v})}
              />
              <InputGroup label="Sektör" icon={<Briefcase size={16} />} placeholder="Bilişim, Lojistik vb." 
                value={formData.sector} 
                onChange={(v) => setFormData({...formData, sector: v})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Ek Notlar</label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 text-slate-400" size={16} />
                <textarea 
                  className="w-full pl-10 pr-4 py-3 min-h-[100px] rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="İhtiyaçlarınızdan bahsedin..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>

            {error && <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl">{error}</p>}

            <button 
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-xl shadow-blue-900/20 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group disabled:bg-blue-400 mt-4"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Başvuruyu Tamamla"}
              {!isSubmitting && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <CheckCircle2 size={18} className="text-blue-500 shrink-0" />
      <span className="text-sm font-medium text-slate-300">{label}</span>
    </div>
  );
}

function InputGroup({ label, icon, placeholder, value, onChange, type = "text", required = false }: {
  label: string, icon: React.ReactNode, placeholder: string, value: string, onChange: (v: string) => void, type?: string, required?: boolean
}) {
  return (
    <div className="space-y-1.5 flex-1">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
        <input 
          required={required}
          type={type} 
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

function SelectGroup({ label, icon, options, value, onChange }: {
  label: string, icon: React.ReactNode, options: string[], value: string, onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1.5 flex-1">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
        <select 
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm appearance-none bg-white"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Seçiniz</option>
          {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
    </div>
  );
}
