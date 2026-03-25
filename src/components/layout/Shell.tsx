"use client";

import { LayoutDashboard, StickyNote, Users, Clock, Calendar, Shield, CreditCard, Box, Settings, CheckCircle2, ShieldCheck, Star, LogOut } from "lucide-react";
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
    <div className="flex h-screen overflow-hidden text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <Link href="/" className="block">
            <h1 className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              WARVANTA
            </h1>
          </Link>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">SaaS İK & Puantaj</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredMenu.map((item, idx) => (
            <SidebarItem key={idx} icon={item.icon} label={item.label} href={item.href} />
          ))}

          {isMaster && (
             <div className="pt-6 border-t border-slate-800 mt-6">
                <div className="text-[11px] font-semibold text-slate-500 uppercase px-2 mb-2">Sistem</div>
                <SidebarItem icon={<ShieldCheck size={18} />} label="Sistem Sahibi" href="/master/applications" />
             </div>
          )}
        </nav>

        <div className="p-4 bg-slate-800 m-4 rounded-xl group relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs text-white">
              {firstName.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{firstName}</p>
              <p className="text-[10px] text-slate-400 truncate">{role.replace('_', ' ')}</p>
            </div>
            <button 
                onClick={async () => {
                    const supabase = createClient();
                    await supabase.auth.signOut();
                    window.location.href = '/';
                }}
                className="p-1.5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                title="Güvenli Çıkış"
            >
                <LogOut size={16} />
            </button>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-2xl -mr-8 -mt-8"></div>
        </div>

        <div className="px-6 py-4 border-t border-slate-800/50">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest text-center">
                Kodlanan By <span className="text-slate-400">İbrahim Şentinmaz</span>
            </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50 text-slate-900">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-slate-500">Giriş / <span className="text-slate-900 capitalize px-1">{usePathname()?.replace('/', '') || 'Dashboard'}</span></h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors font-medium">Hızlı Giriş</button>
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden"></div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, href = "#" }: { icon: React.ReactNode, label: string, href?: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  
  return (
    <Link href={href} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
      active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
    }`}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}
