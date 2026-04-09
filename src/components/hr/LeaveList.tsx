"use client";

import { useState, useEffect } from "react";
import { 
  approveLeave, 
  rejectLeave, 
  getLeaveDashboardData,
  LeaveBalance 
} from "@/lib/actions/leaves";
import { 
  CheckCircle2, XCircle, Clock, Calendar, 
  User, MessageSquare, ChevronRight, Loader2,
  Filter, Plus, Plane, Heart, Star, Home,
  TrendingUp, Search, Info
} from "lucide-react";
import { checkOnboardingStatus } from "@/lib/actions/auth";
import LeaveRequestModal from "./LeaveRequestModal";
import { motion, AnimatePresence } from "framer-motion";

export default function LeaveList() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [summary, setSummary] = useState({ pending: 0, approved_month: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("PENDING");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<any>(null);
  const [view, setView] = useState<'requests' | 'balances'>('requests');
  const [searchTerm, setSearchTerm] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const status = await checkOnboardingStatus();
      setUserStatus(status);

      const isManager = ['COMPANY_ADMIN', 'HR_MANAGER'].includes(status.role);
      const canViewAll = status.permissions?.can_view_company_leaves;
      const canViewDept = status.permissions?.can_view_dept_leaves;
      const canCreateSelf = status.permissions?.can_create_self_leave;

      let params = {};
      if (isManager || canViewAll) {
          params = {};
      } else if (canViewDept) {
          params = { departmentId: status.departmentId };
      } else if (canCreateSelf) {
          params = { onlySelf: true };
      }

      const { leaves: leaveData, balances: balanceData, summary: summaryData } = await getLeaveDashboardData(params);

      setLeaves(leaveData);
      setBalances(balanceData);
      setSummary(summaryData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApprove(id: string) {
    if (!confirm("Bu izin talebini onaylamak üzeresiniz. Onaylıyor musunuz?")) return;
    
    // OPTIMISTIC UPDATE
    const approvedLeave = leaves.find(l => l.id === id);
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'APPROVED' } : l));
    setSummary(prev => ({
      ...prev,
      pending: Math.max(0, prev.pending - 1),
      approved_month: prev.approved_month + (approvedLeave?.day_count || 0)
    }));

    setIsProcessing(id);
    try {
      await approveLeave(id);
    } catch (err) {
      console.error(err);
      loadData(); // Revert on failure
    } finally {
      setIsProcessing(null);
    }
  }

  async function handleReject(id: string) {
    const reason = prompt("Lütfen red gerekçesini yazınız:");
    if (reason === null) return;
    
    // OPTIMISTIC UPDATE
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'REJECTED', rejection_reason: reason } : l));
    setSummary(prev => ({
      ...prev,
      pending: Math.max(0, prev.pending - 1)
    }));

    setIsProcessing(id);
    try {
      await rejectLeave(id, reason);
    } catch (err) {
      console.error(err);
      loadData();
    } finally {
      setIsProcessing(null);
    }
  }

  const filteredRequests = leaves.filter(l => 
    l.status === activeFilter && 
    (`${l.employee?.first_name} ${l.employee?.last_name}`).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBalances = balances.filter(b => 
    (`${b.first_name} ${b.last_name}`).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock size={28} />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{isMounted ? summary.pending : '...'}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Bekleyen Talepler</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Calendar size={28} />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{isMounted ? `${summary.approved_month} GÜN` : '...'}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Bu Ayki Kullanım</div>
          </div>
        </div>

        <div className="bg-blue-600 p-6 rounded-[2rem] shadow-xl shadow-blue-200 flex items-center gap-6 text-white">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <TrendingUp size={28} />
          </div>
          <div>
            <div className="text-2xl font-black">{isMounted ? balances.length : '...'}</div>
            <div className="text-xs font-bold text-blue-100 uppercase tracking-widest mt-1">Aktif Personeller</div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/60 backdrop-blur-xl p-4 rounded-[2rem] border border-white shadow-sm">
          <div className="flex gap-2 p-1 bg-slate-100/50 rounded-2xl w-fit">
            <button 
              onClick={() => setView('requests')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${view === 'requests' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              İzin Talepleri
            </button>
            <button 
              onClick={() => setView('balances')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${view === 'balances' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Bakiye Takibi
            </button>
          </div>

          <div className="flex items-center gap-4 flex-1 max-w-xl">
             <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Personel ara..."
                  className="w-full pl-12 pr-6 py-3 rounded-2xl bg-white border border-slate-100 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             {(userStatus?.role === 'COMPANY_ADMIN' || userStatus?.role === 'HR_MANAGER' || userStatus?.permissions?.can_create_self_leave) && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-blue-900/10 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={18} /> Yeni İzin Talebi
              </button>
            )}
          </div>
        </div>

        {view === 'requests' ? (
          <div className="space-y-4">
            <div className="overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex gap-2 p-1 bg-white/40 rounded-2xl w-fit border border-white min-w-max">
                <FilterTab active={activeFilter === "PENDING"} onClick={() => setActiveFilter("PENDING")} label="Bekleyenler" count={leaves.filter(l => l.status === 'PENDING').length} color="blue" />
                <FilterTab active={activeFilter === "APPROVED"} onClick={() => setActiveFilter("APPROVED")} label="Onaylananlar" count={leaves.filter(l => l.status === 'APPROVED').length} color="emerald" />
                <FilterTab active={activeFilter === "REJECTED"} onClick={() => setActiveFilter("REJECTED")} label="Reddedilenler" count={leaves.filter(l => l.status === 'REJECTED').length} color="red" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {isLoading ? (
                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
              ) : filteredRequests.length > 0 ? (
                filteredRequests.map((leave, idx) => (
                  <motion.div 
                    key={leave.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center gap-6 group hover:shadow-xl hover:shadow-slate-200/40 transition-all"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${getLeaveColor(leave.leave_type)} transition-transform group-hover:scale-110`}>
                        {getLeaveIcon(leave.leave_type)}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-lg">
                          {leave.employee?.first_name} {leave.employee?.last_name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{getLeaveLabel(leave.leave_type)}</p>
                          <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                              {leave.day_count} GÜN
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-1 px-8 md:border-x border-slate-100 min-w-[240px]">
                      <div className="flex items-center gap-2 text-slate-600">
                          <Calendar size={14} className="text-slate-400" />
                          <span className="text-xs font-bold">
                              {new Date(leave.start_date).toLocaleDateString('tr-TR')} - {new Date(leave.end_date).toLocaleDateString('tr-TR')}
                          </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold italic uppercase tracking-tighter">"{leave.reason || 'Neden belirtilmemiş'}"</p>
                    </div>

                    <div className="shrink-0 flex items-center gap-3 min-w-[120px] justify-end">
                      {leave.status === 'PENDING' ? (
                        <>
                          {(userStatus?.role === 'COMPANY_ADMIN' || userStatus?.role === 'HR_MANAGER' || userStatus?.permissions?.can_approve_leaves) && (
                            <>
                              <button 
                                disabled={isProcessing === leave.id}
                                onClick={() => handleReject(leave.id)}
                                className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                              >
                                {isProcessing === leave.id ? <Loader2 className="animate-spin" size={18} /> : <XCircle size={20} />}
                              </button>
                              <button 
                                disabled={isProcessing === leave.id}
                                onClick={() => handleApprove(leave.id)}
                                className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-all flex items-center gap-2"
                              >
                                {isProcessing === leave.id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={18} />}
                                ONAYLA
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-end">
                           <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-sm tracking-widest ${
                              leave.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                           }`}>
                              {leave.status === 'APPROVED' ? 'ONAYLANDI' : 'REDDEDİLDİ'}
                           </span>
                           {leave.status === 'REJECTED' && leave.rejection_reason && (
                              <p className="text-[9px] text-red-400 mt-1 max-w-[150px] truncate text-right font-bold italic tracking-tighter">"{leave.rejection_reason}"</p>
                           )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-[3rem]">
                   Bu kategoride izin talebi bulunmuyor.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredBalances.map((balance, idx) => (
                <motion.div
                  key={balance.employee_id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all flex flex-col gap-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xl shadow-sm">
                      {balance.first_name[0]}{balance.last_name[0]}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">{balance.first_name} {balance.last_name}</h3>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">İşe Giriş: {new Date(balance.hire_date).toLocaleDateString('tr-TR')}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100/50">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Toplam Hakediş</span>
                      <span className="text-xl font-black text-slate-900">{balance.total_earned} GÜN</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100/50">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Kullanılan</span>
                      <span className="text-xl font-black text-red-500">{balance.total_used} GÜN</span>
                    </div>
                  </div>

                  <div className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-xl shadow-blue-200/40 relative overflow-hidden group">
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase tracking-widest text-blue-100">Kalan Bakiye</span>
                        <Info size={16} className="text-blue-200" />
                      </div>
                      <div className="text-4xl font-black">{balance.remaining} GÜN</div>
                      <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (balance.remaining / (balance.total_earned || 1)) * 100)}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-white rounded-full" 
                        />
                      </div>
                      <div className="mt-4 flex justify-between text-[10px] font-black uppercase tracking-widest text-blue-100">
                        <span>{balance.seniority_years} Yıl Kıdem</span>
                        <span>{balance.seniority_years <= 5 ? '14' : balance.seniority_years <= 15 ? '20' : '26'} G / YIL</span>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <LeaveRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={loadData} />
    </div>
  );
}

function FilterTab({ active, onClick, label, count, color }: any) {
    const colors: any = {
        blue: active ? "bg-blue-600 text-white shadow-xl shadow-blue-900/20" : "text-slate-500 hover:text-slate-700",
        emerald: active ? "bg-emerald-600 text-white shadow-xl shadow-emerald-900/20" : "text-slate-500 hover:text-slate-700",
        red: active ? "bg-red-600 text-white shadow-xl shadow-red-900/20" : "text-slate-500 hover:text-slate-700",
    }
    return (
        <button onClick={onClick} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 ${colors[color]}`}>
            {label} 
            <span className={`px-2 py-0.5 rounded-lg text-[9px] ${active ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>
                {count}
            </span>
        </button>
    )
}

function getLeaveIcon(type: string) {
    switch (type) {
        case 'ANNUAL': return <Plane size={24} />;
        case 'SICK': return <Heart size={24} />;
        case 'PATERNITY': return <Star size={24} />;
        default: return <Home size={24} />;
    }
}

function getLeaveColor(type: string) {
    switch (type) {
        case 'ANNUAL': return 'bg-blue-50 text-blue-500 border-blue-100';
        case 'SICK': return 'bg-red-50 text-red-500 border-red-100';
        case 'PATERNITY': return 'bg-purple-50 text-purple-500 border-purple-100';
        default: return 'bg-orange-50 text-orange-500 border-orange-100';
    }
}

function getLeaveLabel(type: string) {
    switch (type) {
        case 'ANNUAL': return 'Yıllık İzin';
        case 'SICK': return 'Hastalık İzni';
        case 'PATERNITY': return 'Özel İzin';
        default: return 'Mazeret İzni';
    }
}
