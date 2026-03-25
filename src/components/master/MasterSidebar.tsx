"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, Building2, BellDot, Settings, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function MasterSidebar() {
  const pathname = usePathname();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const navItems = [
    { label: "Genel Bakış", icon: <LayoutDashboard size={20} />, href: "/master" },
    { label: "Gelen Başvurular", icon: <BellDot size={20} />, href: "/master/applications" },
    { label: "Aktif Şirketler", icon: <Building2 size={20} />, href: "/master/companies" },
    { label: "Sistem Ayarları", icon: <Settings size={20} />, href: "/master/settings" },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 bg-slate-900 border-r border-slate-800 w-64 flex flex-col z-50 hidden md:flex transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white p-2 rounded-xl shadow-lg shadow-blue-900/50">
            <ShieldCheck size={24} />
          </div>
          <div>
             <h1 className="text-xl font-black tracking-tighter text-white">Yönetim Merkezi</h1>
             <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Süper Admin</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 overflow-y-auto mt-2">
        <nav className="space-y-1.5">
          {navItems.map((item) => {
             const isActive = pathname === item.href;
             return (
               <Link
                 key={item.href}
                 href={item.href}
                 className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group relative ${
                   isActive 
                     ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                     : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                 }`}
               >
                 <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                   {item.icon}
                 </div>
                 <span className="font-bold text-sm">{item.label}</span>
               </Link>
             )
          })}
        </nav>
      </div>

      <div className="p-4 mt-auto border-t border-slate-800">
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all group"
        >
          <div className="flex items-center gap-3">
            <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
            <span>Güvenli Çıkış</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
