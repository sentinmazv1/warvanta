"use client";

import { useState } from "react";
import DepartmentsManager from "@/components/settings/DepartmentsManager";
import CompanySettings from "@/components/settings/CompanySettings";
import PositionSettings from "@/components/settings/PositionSettings";
import SubscriptionInfo from "@/components/settings/SubscriptionInfo";
import FeedbackForm from "@/components/settings/FeedbackForm";
import { Settings, Bell, Building2, CreditCard, LayoutDashboard, Briefcase, LifeBuoy } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("subscription");

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Sistem Ayarları</h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium leading-relaxed">
            Warvanta deneyiminizi kişiselleştirin ve abonelik durumunuzu yönetin.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <aside className="lg:col-span-1 space-y-2">
          <SettingsTab 
            icon={<LayoutDashboard size={18}/>} 
            label="Departman Yönetimi" 
            active={activeTab === "departments"} 
            onClick={() => setActiveTab("departments")}
          />
          <SettingsTab 
            icon={<Briefcase size={18}/>} 
            label="Pozisyon Yönetimi" 
            active={activeTab === "positions"} 
            onClick={() => setActiveTab("positions")}
          />
          <SettingsTab 
            icon={<Building2 size={18}/>} 
            label="Şirket Bilgileri" 
            active={activeTab === "company"} 
            onClick={() => setActiveTab("company")}
          />
          <SettingsTab 
            icon={<CreditCard size={18}/>} 
            label="Abonelik Bilgileri" 
            active={activeTab === "subscription"} 
            onClick={() => setActiveTab("subscription")}
          />
          <SettingsTab 
            icon={<LifeBuoy size={18}/>} 
            label="Geri Bildirim & Talep" 
            active={activeTab === "feedback"} 
            onClick={() => setActiveTab("feedback")}
          />
          <SettingsTab icon={<Bell size={18}/>} label="Bildirimler" />
        </aside>

        <div className="lg:col-span-3">
          {activeTab === "departments" && <DepartmentsManager />}
          {activeTab === "positions" && <PositionSettings />}
          {activeTab === "company" && <CompanySettings />}
          {activeTab === "subscription" && <SubscriptionInfo />}
          {activeTab === "feedback" && <FeedbackForm />}
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ icon, label, active = false, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all transform active:scale-[0.98] ${
        active 
          ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/10 scale-[1.02]' 
          : 'bg-white text-slate-500 border border-slate-100/50 hover:border-slate-200 hover:text-slate-900'
      }`}
    >
      <div className={`${active ? 'text-white' : 'text-slate-400'}`}>
        {icon}
      </div>
      {label}
    </button>
  );
}
