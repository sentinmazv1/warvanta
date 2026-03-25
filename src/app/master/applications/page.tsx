"use client";

import { useState, useEffect } from "react";
import { getApplications, approveApplication, rejectApplication, deleteApplication } from "@/lib/actions/master";
import { CheckCircle2, XCircle, Clock, Building2, User, Mail, ShieldCheck, Loader2, Phone, Briefcase, Users, MessageSquare, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadApps();
  }, []);

  async function loadApps() {
    setIsLoading(true);
    const data = await getApplications();
    console.log("Fetched apps:", data);
    setApps(data);
    setIsLoading(false);
  }

  const [selectedPeriods, setSelectedPeriods] = useState<Record<string, string>>({});

  async function handleApprove(id: string) {
    const period = selectedPeriods[id] || '1_YEAR';
    setProcessingId(id);
    try {
      await approveApplication(id, period);
      await loadApps();
      alert("Şirket başarıyla oluşturuldu! Abonelik süresi: " + period.replace('_', ' ') + " olarak ayarlandı.");
    } catch (err: any) {
      alert("Hata: " + (err.message || "Bilinmeyen bir hata oluştu."));
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(id: string) {
    const reason = prompt("Reddetme nedeni belirtin:");
    if (!reason) return;
    setProcessingId(id);
    try {
      await rejectApplication(id, reason);
      await loadApps();
    } catch (err: any) {
      alert("Hata: " + err.message);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu başvuruyu kalıcı olarak silmek istediğinize emin misiniz?")) return;
    setProcessingId(id);
    try {
      await deleteApplication(id);
      await loadApps();
    } catch (err: any) {
      alert("Hata: " + err.message);
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
             <ShieldCheck size={28} className="text-blue-600" /> Başvuru Yönetim Paneli
          </h1>
          <p className="text-slate-500 text-sm mt-1">Sisteme kayıt olmak isteyen yeni şirketlerin başvurularını inceleyin ve onaylayın.</p>
        </div>
      </div>

      <div className="grid gap-6">
        <AnimatePresence>
          {apps.map((app) => (
            <motion.div 
              key={app.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                  <Building2 size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-slate-900">{app.company_name}</h3>
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 mt-5">
                    <Info icon={<User size={14}/>} label={app.contact_person_name} sub="İletişim Kişisi" />
                    <Info icon={<Mail size={14}/>} label={app.contact_email} sub="E-posta" />
                    <Info icon={<Phone size={14}/>} label={app.contact_phone} sub="Telefon" />
                    <Info icon={<Clock size={14}/>} label={new Date(app.created_at).toLocaleDateString('tr-TR')} sub="Başvuru Tarihi" />
                    <Info icon={<Briefcase size={14}/>} label={app.sector || 'Belirtilmemiş'} sub="Sektör" />
                    <Info icon={<Users size={14}/>} label={app.employee_count_range || 'Belirtilmemiş'} sub="Personel Sayısı" />
                  </div>
                  
                  {app.notes && (
                    <div className="mt-5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <MessageSquare size={12} /> Ek Notlar
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed italic">"{app.notes}"</p>
                    </div>
                  )}

                  {app.rejection_reason && (
                    <div className="mt-5 p-4 bg-red-50 rounded-2xl border border-red-100">
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1.5">Red Nedeni</p>
                      <p className="text-xs text-red-600 font-medium italic">"{app.rejection_reason}"</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4 md:border-l md:pl-8 border-slate-100 min-w-[200px]">
                {app.status === 'PENDING' ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Abonelik Süresi</label>
                      <select 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={selectedPeriods[app.id] || '1_YEAR'}
                        onChange={(e) => setSelectedPeriods({...selectedPeriods, [app.id]: e.target.value})}
                      >
                        <option value="6_MONTHS">6 Ay</option>
                        <option value="1_YEAR">1 Yıl</option>
                        <option value="2_YEARS">2 Yıl</option>
                        <option value="3_YEARS">3 Yıl</option>
                      </select>
                    </div>

                    <button 
                      onClick={() => handleApprove(app.id)}
                      disabled={!!processingId}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-xl shadow-blue-900/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:bg-blue-400"
                    >
                      {processingId === app.id ? <Loader2 className="animate-spin" size={16}/> : <CheckCircle2 size={16}/>}
                      Onayla
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleReject(app.id)}
                        disabled={!!processingId}
                        className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl font-bold text-xs hover:bg-red-50 hover:text-red-600 transition-all"
                      >
                        Reddet
                      </button>
                      <button 
                        onClick={() => handleDelete(app.id)}
                        disabled={!!processingId}
                        className="p-2.5 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className={`text-xs font-black px-4 py-2 rounded-xl flex items-center gap-2 ${app.status === 'APPROVED' ? 'text-emerald-500 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
                      {app.status === 'APPROVED' ? <CheckCircle2 size={16} /> : <XCircle size={16} />} 
                      {app.status === 'APPROVED' ? 'ONAYLANDI' : 'REDDEDİLDİ'}
                    </div>
                    <button 
                      onClick={() => handleDelete(app.id)}
                      className="text-[10px] text-slate-400 hover:text-red-500 font-bold underline decoration-dotted"
                    >
                      Kayıt Defterinden Sil
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {apps.length === 0 && !isLoading && (
          <div className="py-24 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
             Henüz değerlendirilmemiş bir başvuru bulunmuyor.
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'PENDING') return <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">BEKLEMEDE</span>;
  if (status === 'APPROVED') return <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">ONAYLANDI</span>;
  if (status === 'REJECTED') return <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">REDDEDİLDİ</span>;
  return null;
}

function Info({ icon, label, sub }: { icon: any, label: string, sub: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-0.5">{sub}</div>
        <div className="text-sm font-bold text-slate-700 truncate max-w-[180px]">{label}</div>
      </div>
    </div>
  );
}
