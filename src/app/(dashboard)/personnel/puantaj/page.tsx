"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Download, 
  User, 
  Clock, 
  Plus, 
  Check, 
  X, 
  AlertCircle, 
  Info,
  MoreHorizontal,
  PlusCircle,
  Clock3,
  Coffee,
  Sun,
  Palmtree,
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { getEmployees } from "@/lib/actions/employees";
import { getPuantajRecords, savePuantajRecord, getPuantajSummary, deletePuantajRecord } from "@/lib/actions/puantaj";
import { Employee, PuantajRecord, PuantajStatus } from "@/lib/types";

const STATUS_CONFIG: Record<PuantajStatus, { label: string, color: string, icon: any }> = {
  'M': { label: 'Mesai', color: 'bg-emerald-500', icon: Check },
  'G': { label: 'Geç', color: 'bg-amber-500', icon: Clock3 },
  'Yİ': { label: 'Yıllık İzin', color: 'bg-blue-500', icon: Palmtree },
  'Hİ': { label: 'Haftalık İzin', color: 'bg-slate-400', icon: Moon },
  'RT': { label: 'Resmi Tatil', color: 'bg-purple-500', icon: Sun },
  'BT': { label: 'Bayram Tatili', color: 'bg-indigo-500', icon: Coffee },
  'YG': { label: 'Yarım Gün', color: 'bg-cyan-500', icon: AlertCircle },
  'Öİ': { label: 'Özel İzin', color: 'bg-pink-500', icon: PlusCircle },
  'R': { label: 'Raporlu', color: 'bg-red-500', icon: Info },
};

export default function PuantajPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<PuantajRecord[]>([]);
  const [summary, setSummary] = useState<Record<string, Record<string, number>>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const [activePopover, setActivePopover] = useState<{ empId: string, day: number } | null>(null);

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    setIsMounted(true);
    loadData();
  }, [currentDate]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [empData, recData, sumData] = await Promise.all([
        getEmployees(),
        getPuantajRecords(month, year),
        getPuantajSummary(month, year)
      ]);
      setEmployees(empData);
      setRecords(recData);
      setSummary(sumData);
    } catch (err) {
      console.error("Error loading puantaj data:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredEmployees = employees.filter(emp => 
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recordsMap = useMemo(() => {
    const map: Record<string, PuantajRecord> = {};
    records.forEach(rec => {
      map[`${rec.employee_id}_${rec.attendance_date}`] = rec;
    });
    return map;
  }, [records]);

  const handleStatusSave = async (employeeId: string, day: number, status: PuantajStatus) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    try {
      await savePuantajRecord({
        employee_id: employeeId,
        attendance_date: dateStr,
        status: status
      });
      setActivePopover(null);
      loadData(); // Refresh
    } catch (err) {
      console.error("Failed to save record:", err);
    }
  };

  const handleStatusDelete = async (employeeId: string, day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    try {
      await deletePuantajRecord(employeeId, dateStr);
      setActivePopover(null);
      loadData();
    } catch (err) {
      console.error("Failed to delete record:", err);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 flex items-center gap-3">
            <CalendarIcon className="text-blue-600" size={32} /> Puantaj Cetveli
          </h1>
          <p className="text-slate-500 font-medium mt-1">Personel çalışma ve izin durumlarını profesyonelce yönetin.</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
           <button 
             onClick={() => setCurrentDate(new Date(year, month - 2, 1))}
             className="p-2 hover:bg-slate-50 rounded-xl transition-all"
           >
             <ChevronLeft size={20} />
           </button>
           <span className="font-black text-sm uppercase tracking-widest min-w-[140px] text-center">
             {new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(currentDate)}
           </span>
           <button 
             onClick={() => setCurrentDate(new Date(year, month, 1))}
             className="p-2 hover:bg-slate-50 rounded-xl transition-all"
           >
             <ChevronRight size={20} />
           </button>
        </div>
      </div>

      {/* Toolbar & Legend */}
      <div className="bg-white/60 backdrop-blur-xl border border-white p-6 rounded-[2.5rem] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8">
         <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Personel ara..."
              className="w-full pl-12 pr-6 py-3 rounded-2xl bg-white border border-slate-100 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>

         <div className="flex flex-wrap gap-3">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                <div className={`w-2 h-2 rounded-full ${config.color}`}></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{config.label}</span>
              </div>
            ))}
         </div>
      </div>

      {/* Main Grid */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="sticky left-0 z-20 bg-slate-50/90 backdrop-blur-md p-6 border-r border-slate-100 text-left min-w-[280px]">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personel Bilgileri</span>
                </th>
                {daysArray.map(day => {
                  const date = new Date(year, month - 1, day);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  return (
                    <th key={day} className={`p-4 border-r border-slate-100 min-w-[50px] text-center ${isWeekend ? 'bg-slate-100/30' : ''}`}>
                      <div className="text-[10px] font-black text-slate-400 uppercase">{day}</div>
                      <div className={`text-[10px] font-bold mt-1 ${isWeekend ? 'text-red-400' : 'text-slate-500'}`}>
                        {new Intl.DateTimeFormat('tr-TR', { weekday: 'short' }).format(date)}
                      </div>
                    </th>
                  );
                })}
                <th className="p-6 bg-blue-50/30 text-center min-w-[120px]">
                   <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Aylık Özet</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="border-t border-slate-50 group hover:bg-slate-50/50 transition-colors">
                  <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/90 backdrop-blur-md p-4 border-r border-slate-100">
                    <div className="flex items-center gap-4">
                      {emp.photo_url ? (
                        <img src={emp.photo_url} className="w-10 h-10 rounded-2xl object-cover shadow-sm" alt="" />
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          {emp.first_name[0]}{emp.last_name[0]}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-sm text-slate-900 whitespace-nowrap">{emp.first_name} {emp.last_name}</div>
                        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{emp.position_name || 'Pozisyon Belirtilmemiş'}</div>
                      </div>
                    </div>
                  </td>
                  
                  {daysArray.map(day => {
                    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const key = `${emp.id}_${dateStr}`;
                    const rec = recordsMap[key];
                    const config = rec ? STATUS_CONFIG[rec.status] : null;

                    return (
                      <td 
                        key={day} 
                        className="p-1 border-r border-slate-50 text-center cursor-pointer select-none relative"
                      >
                        <div 
                          onClick={() => setActivePopover({ empId: emp.id, day })}
                          className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all transform active:scale-90 ${config ? config.color + ' text-white shadow-lg' : 'bg-slate-50 hover:bg-slate-100'}`}
                        >
                          {config ? (
                            <config.icon size={16} />
                          ) : (
                            <Plus size={12} className="text-slate-300 opacity-0 group-hover:opacity-100" />
                          )}
                        </div>

                        {/* Popover Selection - Using Portal */}
                        {isMounted && activePopover?.empId === emp.id && activePopover?.day === day && createPortal(
                          <AnimatePresence>
                              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                <motion.div 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
                                  onClick={() => setActivePopover(null)} 
                                />
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                  className="relative z-[110] bg-white border border-slate-200 p-3 rounded-[2rem] shadow-2xl w-full max-w-[280px]"
                                >
                                  <div className="flex items-center justify-between mb-4 px-2">
                                     <div className="flex flex-col">
                                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{day} {new Intl.DateTimeFormat('tr-TR', { month: 'long' }).format(currentDate)}</span>
                                       <span className="text-sm font-bold text-slate-900">{emp.first_name} {emp.last_name}</span>
                                     </div>
                                     <button onClick={() => setActivePopover(null)} className="p-2 hover:bg-slate-100 rounded-xl">
                                       <X size={20} className="text-slate-400" />
                                     </button>
                                  </div>

                                  <div className="grid grid-cols-1 gap-1.5">
                                    {/* Delete Option if exists */}
                                    {rec && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStatusDelete(emp.id, day);
                                        }}
                                        className="flex items-center gap-3 w-full p-3 rounded-2xl hover:bg-red-50 text-red-500 transition-all group border border-red-50 mb-1"
                                      >
                                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shadow-sm">
                                          <X size={18} />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-tighter">Statusü Kaldır (Sil)</span>
                                      </button>
                                    )}

                                    <div className="grid grid-cols-2 gap-2">
                                      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                        <button
                                          key={key}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleStatusSave(emp.id, day, key as PuantajStatus);
                                          }}
                                          className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl hover:bg-slate-50 border border-slate-50 transition-all group"
                                        >
                                          <div className={`w-10 h-10 rounded-xl ${config.color} text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                                            <config.icon size={18} />
                                          </div>
                                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter text-center">{config.label}</span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              </div>
                          </AnimatePresence>,
                          document.body
                        )}
                      </td>
                    );
                  })}

                  {/* Summary Cell */}
                  <td className="p-4 bg-blue-50/20 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-black text-blue-700">{summary[emp.id]?.['M'] || 0} GÜN</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{summary[emp.id]?.['Yİ'] || 0} İZİN • {summary[emp.id]?.['G'] || 0} GEÇ</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-3xl shadow-2xl flex items-center gap-4">
            <motion.div 
               animate={{ rotate: 360 }} 
               transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
               className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"
            />
            <span className="font-bold text-slate-600 italic">Puantaj yükleniyor...</span>
          </div>
        </div>
      )}
    </div>
  );
}
