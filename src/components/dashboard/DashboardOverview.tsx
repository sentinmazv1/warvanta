"use client";

import { Users, Clock, Calendar, AlertCircle, ArrowUpRight, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardOverview({ user }: { user: any }) {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Hoş Geldiniz, {user.email?.split('@')[0]}</h1>
          <p className="text-slate-500 mt-1">Bugün Warvanta panelinde neler oluyor? İşte hızlı bir özet.</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Bugünün Tarihi</p>
          <p className="text-lg font-bold text-slate-700">{new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Users className="text-blue-600" />} 
          label="Toplam Personel" 
          value="0" 
          trend="Yeni Başladık"
          color="bg-blue-50"
        />
        <StatCard 
          icon={<Clock className="text-emerald-600" />} 
          label="Bugün İzinde" 
          value="0" 
          trend="Huzurlu Gün"
          color="bg-emerald-50"
        />
        <StatCard 
          icon={<AlertCircle className="text-amber-600" />} 
          label="Eksik Belge" 
          value="0" 
          trend="Sorunsuz"
          color="bg-amber-50"
        />
        <StatCard 
          icon={<TrendingUp className="text-indigo-600" />} 
          label="Aylık Verim" 
          value="-" 
          trend="Veri Bekleniyor"
          color="bg-indigo-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800">Personel Hareketleri</h3>
              <button className="text-xs text-blue-600 font-bold flex items-center gap-1">Tümünü Gör <ArrowUpRight size={14} /></button>
            </div>
            
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
                <Users size={20} />
              </div>
              <p className="text-xs font-medium uppercase tracking-widest">Henüz bir hareket bulunmuyor</p>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* Birthdays */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center py-12 text-slate-400">
             <Calendar size={24} className="mx-auto mb-3 opacity-20" />
             <p className="text-xs font-bold uppercase tracking-widest">Yaklaşan Etkinlik Yok</p>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl text-white shadow-xl shadow-blue-900/20">
            <h3 className="font-bold mb-4">Hızlı İşlemler</h3>
            <div className="grid grid-cols-2 gap-3">
              <QuickActionButton label="Yeni Personel" />
              <QuickActionButton label="İzin Girişi" />
              <QuickActionButton label="Puantaj Düzenle" />
              <QuickActionButton label="Rapor Al" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, color }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{trend}</span>
      </div>
    </motion.div>
  );
}

function QuickActionButton({ label }: { label: string }) {
  return (
    <button className="bg-white/10 hover:bg-white/20 transition-colors p-3 rounded-xl text-xs font-bold text-left backdrop-blur-sm">
      {label}
    </button>
  );
}
