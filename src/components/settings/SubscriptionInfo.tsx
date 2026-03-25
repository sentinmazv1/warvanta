
"use client";

import { useEffect, useState } from "react";
import { getSubscriptionInfo } from "@/lib/actions/auth";
import { Calendar, Database, Sparkles, CreditCard, ArrowUpRight, History } from "lucide-react";

export default function SubscriptionInfo() {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubscriptionInfo().then(data => {
      setCompany(data);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center text-slate-400">
      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
      <p className="text-sm font-bold animate-pulse uppercase tracking-widest">Abonelik Bilgileri Yükleniyor...</p>
    </div>
  );

  if (!company) return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-12 text-center text-slate-400">
      Şirket bilgisi bulunamadı.
    </div>
  );

  const usageGB = (company.data_usage_bytes / (1024 * 1024 * 1024)).toFixed(2);
  const endDate = company.subscription_end_at ? new Date(company.subscription_end_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Süresiz';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Stats Card */}
      <div className="bg-[#0f172a] rounded-[2.5rem] p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Sparkles size={200} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="bg-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-600/30">
                {company.subscription_period?.replace('_', ' ') || 'STANDART'} PLANI
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em]">
                {company.status === 'ACTIVE' ? 'AKTİF' : 'DONDURULMUŞ'}
              </span>
            </div>
            <h2 className="text-4xl font-black tracking-tight leading-tight">
              Aboneliğiniz Güvence Altında. ✨
            </h2>
            <p className="text-slate-400 text-sm max-w-md font-medium leading-relaxed">
              Warvanta dünyasının tüm ayrıcalıklarından faydalanıyorsunuz. Bitiş tarihiniz aşağıda belirtilmiştir.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 min-w-[240px]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Calendar className="text-white" size={20} />
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bitiş Tarihi</div>
            </div>
            <div className="text-2xl font-black tabular-nums tracking-tight">{endDate}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Usage Card */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <Database size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 leading-none">Veri Kullanımı</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Güncel Toplam Boyut</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-slate-900 tracking-tight">{usageGB} GB</div>
              <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">SINIRSIZ DEPOLAMA</div>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full w-[15%]" />
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                <CreditCard size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 leading-none">Abonelik İşlemleri</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Süreyi Uzat veya Plan Değiştir</p>
              </div>
            </div>
            
            <button 
              onClick={() => alert("Abonelik uzatma talebiniz admin panelimize iletilmiştir. Temsilcimiz sizinle iletişime geçecektir.")}
              className="w-full py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all transform active:scale-[0.98]"
            >
              Süreyi Uzat <ArrowUpRight size={18} />
            </button>
        </div>
      </div>

      {/* History Log Table Integration placeholder */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <History className="text-slate-400" size={24} />
          <h3 className="text-lg font-black text-slate-900">İşlem Geçmişi</h3>
        </div>
        <div className="text-center py-12 border-2 border-dashed border-slate-50 rounded-3xl">
          <p className="text-slate-300 text-sm font-bold uppercase tracking-widest">Henüz bir fatura veya işlem kaydı bulunmuyor.</p>
        </div>
      </div>
    </div>
  );
}
