"use client";

import { useState, useEffect } from "react";
import { 
  Cake, Star, Gift, PartyPopper, Calendar, 
  ChevronRight, ArrowLeft, Loader2, Search, Filter,
  Users, Award, Heart, MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { getCelebrations } from "@/lib/actions/employees";

const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

export default function CelebrationsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const data = await getCelebrations();
      setEvents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredEvents = events.filter(ev => {
    const matchesSearch = ev.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = ev.month === activeMonth;
    return matchesSearch && matchesMonth;
  });

  const nextCelebrations = events.filter(ev => {
    const today = new Date();
    const currM = today.getMonth() + 1;
    const currD = today.getDate();
    return (ev.month > currM) || (ev.month === currM && ev.day >= currD);
  }).slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-slate-500 font-medium">Kutlamalar yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
            <PartyPopper size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Personel Aidiyeti</h1>
            <p className="text-sm text-slate-500 font-medium">Doğum günlerini ve iş yıl dönümlerini buradan takip edin.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder="Personel ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-6 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-200 rounded-2xl text-sm font-medium transition-all w-64"
                />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Upcoming Quick View */}
        <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Yaklaşanlar</h3>
            <div className="space-y-4">
                {nextCelebrations.map((ev, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={ev.id} 
                        className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-all"
                    >
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-white shadow-sm">
                                {ev.photo_url ? (
                                    <img src={ev.photo_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <Users size={18} className="text-slate-300" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-slate-900 truncate">{ev.name}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                                    {ev.day} {MONTHS[ev.month-1]}
                                </p>
                            </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 w-fit ${
                            ev.type === 'BIRTHDAY' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                            {ev.type === 'BIRTHDAY' ? <Cake size={12} /> : <Star size={12} />}
                            {ev.type === 'BIRTHDAY' ? 'DOĞUM GÜNÜ' : `${ev.years_completed}. YIL DÖNÜMÜ`}
                        </div>
                    </motion.div>
                ))}
                {nextCelebrations.length === 0 && (
                    <div className="bg-slate-50 rounded-3xl p-8 border border-dashed border-slate-200 text-center text-slate-400 text-xs font-medium">
                        Yakın zamanda kutlama bulunmuyor.
                    </div>
                )}
            </div>
            
            <div className="bg-blue-600 p-8 rounded-[2rem] text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
                <div className="relative z-10">
                    <Heart className="mb-4 text-blue-200" size={32} fill="currentColor" />
                    <h4 className="font-bold leading-tight">Aidiyet Kültürü</h4>
                    <p className="text-xs text-blue-100/70 mt-2 leading-relaxed">Personellerimizin özel günlerini kutlamak, şirket içindeki bağı ve aidiyeti güçlendirir.</p>
                </div>
                <PartyPopper className="absolute -bottom-6 -right-6 text-white/10 w-32 h-32 rotate-12" />
            </div>
        </div>

        {/* Calendar / Events Grid */}
        <div className="lg:col-span-3 space-y-8">
            {/* Month Picker */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide px-2">
                {MONTHS.map((month, idx) => (
                    <button
                        key={month}
                        onClick={() => setActiveMonth(idx + 1)}
                        className={`px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${
                            activeMonth === idx + 1 
                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105' 
                            : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
                        }`}
                    >
                        {month}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div 
                    key={activeMonth}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                    {filteredEvents.map((ev) => (
                        <div 
                            key={ev.id} 
                            className="bg-white p-8 rounded-[2rem] border border-slate-50 shadow-sm group hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-100 transition-all cursor-default relative"
                        >
                            <div className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100 shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                                <span className="text-xs font-black leading-none">{ev.day}</span>
                                <span className="text-[8px] font-black uppercase mt-1">{MONTHS[ev.month-1].substring(0,3)}</span>
                            </div>

                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl group-hover:scale-110 transition-transform">
                                    {ev.photo_url ? (
                                        <img src={ev.photo_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Users size={32} className="text-slate-300" />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{ev.name}</h4>
                                    <div className={`flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest ${
                                        ev.type === 'BIRTHDAY' ? 'text-rose-500' : 'text-blue-500'
                                    }`}>
                                        {ev.type === 'BIRTHDAY' ? <Gift size={12} /> : <Award size={12} />}
                                        {ev.type === 'BIRTHDAY' ? 'Doğum Günü' : `${ev.years_completed}. Yıl Dönümü`}
                                    </div>
                                </div>
                                
                                <button className="w-full mt-2 py-3 bg-slate-50 text-slate-900 group-hover:bg-blue-600 group-hover:text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm">
                                    <MessageSquare size={14} /> Kutla
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredEvents.length === 0 && (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-4 bg-white rounded-[3rem] border border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                <Calendar size={40} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">{MONTHS[activeMonth-1]} Ayında Kutlama Yok</h4>
                                <p className="text-sm text-slate-500 font-medium">Bu aya ait planlanmış bir doğum günü veya yıl dönümü bulunamadı.</p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
