"use client";

import { LayoutDashboard, StickyNote, Users, Clock, Calendar, Shield, CreditCard, Box, Settings, CheckCircle2, ShieldCheck, Star, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Shell({ 
  children, 
  isAuthenticated = false,
  role = 'EMPLOYEE',
  firstName = 'Kullanıcı',
  permissions = null
}: { 
  children: React.ReactNode, 
  isAuthenticated?: boolean,
  role?: string,
  firstName?: string,
  permissions?: any
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  if (!isAuthenticated) return <div className="min-h-screen bg-white">{children}</div>;

  const isMaster = role === 'SUPERADMIN' || role === 'SYSTEM_ADMIN';
  const isAdmin = role === 'COMPANY_ADMIN';
  const isHR = role === 'HR_MANAGER' || isAdmin;

  const menuItems = [
    { icon: <LayoutDashboard size={18} />, label: "Dashboard", href: "/", roles: ['ANY'] },
    { icon: <StickyNote size={18} />, label: "Notlarım", href: "/notes", roles: ['ANY'] },
    { 
        icon: <Clock size={18} />, label: "Puantaj", href: "/personnel/puantaj", roles: ['COMPANY_ADMIN', 'HR_MANAGER'], 
        perms: ['can_view_dept_attendance', 'can_view_company_attendance'] 
    },
    { 
        icon: <Users size={18} />, label: "Personel", href: "/personnel", roles: ['COMPANY_ADMIN', 'HR_MANAGER'], 
        perms: ['can_view_personnel'] 
    },
    { 
        icon: <Star size={18} />, label: "Personel Aidiyeti", href: "/personnel/celebrations", roles: ['COMPANY_ADMIN', 'HR_MANAGER'], 
        perms: ['can_view_personnel'] 
    },
    { 
        icon: <Calendar size={18} />, label: "İzin Yönetimi", href: "/leaves", roles: ['ANY'], 
        perms: ['can_create_self_leave', 'can_view_dept_leaves', 'can_view_company_leaves'] 
    },
    { 
        icon: <Box size={18} />, label: "Zimmet Takibi", href: "/assets", roles: ['ANY'], 
        perms: ['can_view_own_assets', 'can_view_company_assets'] 
    },
    { icon: <Settings size={18} />, label: "Ayarlar", href: "/settings", roles: ['COMPANY_ADMIN', 'HR_MANAGER'], perms: ['can_manage_settings'] },
  ];

  const filteredMenu = menuItems.filter(item => {
    if (isMaster) return true;

    const hasRole = item.roles.includes('ANY') || item.roles.includes(role);
    
    // Check if any of the required permissions are granted
    if (role === 'EMPLOYEE' && item.perms && !item.roles.includes('ANY')) {
        return item.perms.some(p => !!permissions?.[p]);
    }

    // Special case for staff modules that have a 'Self' permission
    if (role === 'EMPLOYEE' && item.perms && permissions) {
        return item.perms.some(p => !!permissions[p]);
    }

    return hasRole;
  });

  return (
    <div className="flex h-screen overflow-hidden text-slate-900 bg-slate-50/50">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-slate-900 text-white flex flex-col shrink-0 z-50 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-64
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <Link href="/" className="block" onClick={() => setIsSidebarOpen(false)}>
                <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    WARVANTA
                </h1>
            </Link>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">SaaS İK & Puantaj</p>
          </div>
          <button 
            className="lg:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredMenu.map((item, idx) => (
            <SidebarItem 
              key={idx} 
              icon={item.icon} 
              label={item.label} 
              href={item.href} 
              onClick={() => setIsSidebarOpen(false)}
            />
          ))}

          {isMaster && (
             <div className="pt-6 border-t border-slate-800 mt-6">
                <div className="text-[11px] font-semibold text-slate-500 uppercase px-2 mb-2">Sistem</div>
                <SidebarItem 
                  icon={<ShieldCheck size={18} />} 
                  label="Sistem Sahibi" 
                  href="/master/applications" 
                  onClick={() => setIsSidebarOpen(false)}
                />
             </div>
          )}
        </nav>

        <div className="p-4 bg-slate-800 m-4 rounded-3xl group relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-xs text-white shadow-lg">
              {firstName.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black truncate">{firstName}</p>
              <p className="text-[10px] text-slate-400 truncate uppercase tracking-tighter">{role.replace('_', ' ')}</p>
            </div>
            <button 
                onClick={async () => {
                    const supabase = createClient();
                    await supabase.auth.signOut();
                    window.location.href = '/';
                }}
                className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-colors"
                title="Güvenli Çıkış"
            >
                <LogOut size={16} />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-800/50">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest text-center">
                Kodlanan By <span className="text-slate-400">İbrahim Şentinmaz</span>
            </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden text-slate-900">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 relative z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest hidden sm:block">
              {pathname === '/' ? 'DASHBOARD' : pathname?.split('/').pop()?.toUpperCase() || 'MODÜL'}
            </h2>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg text-blue-600 border border-blue-100/50 font-bold text-[10px] uppercase tracking-wider">
               <Shield size={14} /> {role.split('_').pop()} PANEL
            </div>
            <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
               <Users size={20} />
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, href = "#", onClick }: { icon: React.ReactNode, label: string, href?: string, onClick?: () => void }) {
  const pathname = usePathname();
  const active = pathname === href;
  
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
      active ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'
    }`}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}
