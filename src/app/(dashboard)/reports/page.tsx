"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, Users, CheckCircle2, Box, Calendar, 
  ArrowUpRight, ArrowDownRight, Loader2, Download,
  Mail, PieChart, TrendingUp
} from "lucide-react";
import { getReportStats } from "@/lib/actions/reports";
import { motion } from "framer-motion";

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await getReportStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  if (!stats) return <div className="p-20 text-center text-slate-400">Veri bulunamadı.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
             <BarChart3 className="text-blue-600" size={32} /> Dinamik Raporlama
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Şirketinizin genel performans ve İK metriklerini gerçek zamanlı takip edin.</p>
        </div>
        <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl font-bold text-xs text-slate-600 shadow-sm hover:bg-slate-50 transition-all">
                <Mail size={16} /> Otomatik Mail Kur
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all">
                <Download size={16} /> PDF Raporu İndir
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            icon={<Users className="text-blue-500" />} 
            label="Toplam Personel" 
            value={stats.employees.total} 
            trend="+2" 
            trendUp={true} 
            color="blue"
        />
        <StatCard 
            icon={<CheckCircle2 className="text-emerald-500" />} 
            label="Bitmiş Görevler" 
            value={`${stats.tasks.done}/${stats.tasks.total}`} 
            trend={`${Math.round((stats.tasks.done / (stats.tasks.total || 1)) * 100)}%`}
            trendUp={true} 
            color="emerald"
        />
        <StatCard 
            icon={<Box className="text-orange-500" />} 
            label="Zimmetli Varlıklar" 
            value={stats.assets.assigned} 
            trend={`Boşta: ${stats.assets.available}`}
            trendUp={false} 
            color="orange"
        />
        <StatCard 
            icon={<Calendar className="text-purple-500" />} 
            label="Son 30 Gün İzin" 
            value={`${stats.leaves.totalDays} Gün`} 
            trend="-5%" 
            trendUp={false} 
            color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                 <PieChart className="text-blue-600" size={20} /> Departman Dağılımı
               </h3>
               <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Detayları Gör</button>
            </div>
            
            <div className="space-y-6">
                {Object.entries(stats.employees.depts).map(([name, count]: any) => (
                    <div key={name} className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-600 font-bold">{name}</span>
                            <span className="text-slate-900">{count} Personel</span>
                        </div>
                        <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(count / stats.employees.total) * 100}%` }}
                                className="h-full bg-blue-500 rounded-full shadow-sm"
                            />
                        </div>
                    </div>
                ))}
            </div>
         </div>

         <div className="lg:col-span-1 bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden text-white flex flex-col justify-between">
            <div className="relative z-10">
                <div className="flex items-center gap-2 text-blue-400 mb-6 font-black text-[10px] uppercase tracking-widest">
                    <TrendingUp size={16} /> Verimlilik Analizi
                </div>
                <h4 className="text-2xl font-black leading-tight mb-4">Görev Tamamlama Hızınız %12 Arttı.</h4>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">Geçen aya oranla departman bazlı iş bitirme süreleri ortalama 2.4 gün kısaldı.</p>
            </div>
            
            <div className="relative z-10 pt-8 border-t border-slate-800 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Önerisi</p>
                    <p className="text-xs font-bold text-blue-400 mt-1">Stokları %5 artırın.</p>
                </div>
                <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10">
                    <ArrowUpRight size={20} className="text-blue-400" />
                </button>
            </div>

            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
         </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, trendUp, color }: any) {
    const colorClasses: any = {
        blue: "bg-blue-50/50 border-blue-100 text-blue-600",
        emerald: "bg-emerald-50/50 border-emerald-100 text-emerald-600",
        orange: "bg-orange-50/50 border-orange-100 text-orange-600",
        purple: "bg-purple-50/50 border-purple-100 text-purple-600",
    }

    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4"
        >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${colorClasses[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <div className="flex items-end gap-3">
                    <h3 className="text-2xl font-black text-slate-900">{value}</h3>
                    <div className={`flex items-center text-[10px] font-black py-0.5 px-1.5 rounded-lg mb-1 ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                        {trendUp ? <ArrowUpRight size={10} className="mr-1" /> : <ArrowDownRight size={10} className="mr-1" />}
                        {trend}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
