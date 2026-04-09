"use client";

import { useState, useEffect, useMemo, memo } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Check, 
  X, 
  AlertCircle, 
  Info,
  PlusCircle,
  Clock3,
  Coffee,
  Sun,
  Palmtree,
  Moon,
  Plus,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { getPuantajDashboardData, savePuantajRecord, deletePuantajRecord } from "@/lib/actions/puantaj";
import { Employee, PuantajRecord, PuantajStatus } from "@/lib/types";

// --- CONFIG ---

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

// --- COMPONENTS ---

const PuantajCell = memo(({ 
  day, 
  employeeId, 
  record, 
  onClick, 
  onQuickSave 
}: { 
  day: number, 
  employeeId: string, 
  record?: PuantajRecord, 
  onClick: (e: React.MouseEvent) => void,
  onQuickSave: (status: PuantajStatus) => void
}) => {
  const config = record ? STATUS_CONFIG[record.status] : null;

  return (
    <td className="p-1 border-r border-slate-50 text-center cursor-pointer select-none relative group/cell">
      <div 
        onClick={onClick}
        className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all transform active:scale-90 ${config ? config.color + ' text-white shadow-lg' : 'bg-slate-50 hover:bg-slate-100'}`}
      >
        {config ? (
          <config.icon size={16} />
        ) : (
          <Plus size={12} className="text-slate-300 opacity-0 group-hover/cell:opacity-100" />
        )}
      </div>

      <div className="absolute inset-0 flex items-center justify-center gap-0.5 opacity-0 group-hover/cell:opacity-100 pointer-events-none group-hover/cell:pointer-events-auto transition-opacity z-10 bg-white/10 backdrop-blur-[2px] rounded-xl overflow-hidden">
         <button onClick={(e) => { e.stopPropagation(); onQuickSave('M'); }} className="w-6 h-6 bg-emerald-500 text-white rounded-lg flex items-center justify-center hover:scale-110 transition-transform">
            <span className="text-[9px] font-black">M</span>
         </button>
         <button onClick={(e) => { e.stopPropagation(); onQuickSave('G'); }} className="w-6 h-6 bg-amber-500 text-white rounded-lg flex items-center justify-center hover:scale-110 transition-transform">
            <span className="text-[9px] font-black">G</span>
         </button>
         <button onClick={(e) => { e.stopPropagation(); onQuickSave('Yİ'); }} className="w-6 h-6 bg-blue-500 text-white rounded-lg flex items-center justify-center hover:scale-110 transition-transform">
            <span className="text-[9px] font-black">İ</span>
         </button>
      </div>
    </td>
  );
});

PuantajCell.displayName = "PuantajCell";

const PuantajRow = memo(({ 
  employee, 
  daysArray, 
  records, 
  summary, 
  onCellClick, 
  onQuickSave,
  onRowFill 
}: { 
  employee: Employee, 
  daysArray: number[], 
  records: Record<string, PuantajRecord>, 
  summary: Record<string, number>,
  onCellClick: (day: number, employee: Employee) => void,
  onQuickSave: (employeeId: string, day: number, status: PuantajStatus) => void,
  onRowFill: (employeeId: string, status: PuantajStatus) => void
}) => {
  return (
    <tr className="border-t border-slate-50 group hover:bg-slate-50/50 transition-colors">
      <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 transition-colors p-4 border-r border-slate-100 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4">
          {employee.photo_url ? (
            <img src={employee.photo_url} className="w-10 h-10 rounded-2xl object-cover shadow-sm" alt="" />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              {employee.first_name[0]}{employee.last_name[0]}
            </div>
          )}
          <div>
            <div className="font-bold text-sm text-slate-900 whitespace-nowrap">{employee.first_name} {employee.last_name}</div>
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{employee.position_name || 'Pozisyon...'}</div>
          </div>
          
          <button 
             onClick={() => onRowFill(employee.id, 'M')}
             title="Tüm Ayı Mesai Yap"
             className="opacity-0 group-hover:opacity-100 p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all ml-auto"
          >
             <PlusCircle size={14} />
          </button>
        </div>
      </td>
      
      {daysArray.map(day => (
        <PuantajCell 
          key={day}
          day={day}
          employeeId={employee.id}
          record={records[day]}
          onClick={() => onCellClick(day, employee)}
          onQuickSave={(status) => onQuickSave(employee.id, day, status)}
        />
      ))}

      <td className="p-4 bg-blue-50/20 text-center">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-black text-blue-700">{summary?.['M'] || 0} GÜN</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase">{summary?.['Yİ'] || 0} İZİN • {summary?.['G'] || 0} GEÇ</span>
        </div>
      </td>
    </tr>
  );
});

PuantajRow.displayName = "PuantajRow";

// --- MAIN PAGE ---

export default function PuantajPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<PuantajRecord[]>([]);
  const [summary, setSummary] = useState<Record<string, Record<string, number>>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const [activePopover, setActivePopover] = useState<{ employee: Employee, day: number } | null>(null);

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  useEffect(() => {
    setIsMounted(true);
    loadData();
  }, [currentDate]);

  async function loadData() {
    setIsLoading(true);
    try {
      const { employees: empData, records: recData, summary: sumData } = await getPuantajDashboardData(month, year);
      setEmployees(empData);
      setRecords(recData);
      setSummary(sumData);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredEmployees = useMemo(() => employees.filter(emp => 
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  ), [employees, searchTerm]);

  const recordsByEmployee = useMemo(() => {
    const map: Record<string, Record<number, PuantajRecord>> = {};
    records.forEach(rec => {
      const day = parseInt(rec.attendance_date.split('-')[2]);
      if (!map[rec.employee_id]) map[rec.employee_id] = {};
      map[rec.employee_id][day] = rec;
    });
    return map;
  }, [records]);

  const handleStatusSave = async (employeeId: string, day: number, status: PuantajStatus) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const currentRec = recordsByEmployee[employeeId]?.[day];
    const oldStatus = currentRec?.status;

    // Optimistic Update
    setRecords(prev => {
      const filtered = prev.filter(r => !(r.employee_id === employeeId && r.attendance_date === dateStr));
      return [...filtered, { employee_id: employeeId, attendance_date: dateStr, status } as PuantajRecord];
    });

    setSummary(prev => {
      const newSum = { ...prev };
      if (!newSum[employeeId]) newSum[employeeId] = {};
      if (oldStatus) newSum[employeeId][oldStatus] = Math.max(0, (newSum[employeeId][oldStatus] || 0) - 1);
      newSum[employeeId][status] = (newSum[employeeId][status] || 0) + 1;
      return newSum;
    });

    try {
      await savePuantajRecord({ employee_id: employeeId, attendance_date: dateStr, status });
      setActivePopover(null);
    } catch (err) {
      console.error(err);
      loadData();
    }
  };

  const handleStatusDelete = async (employeeId: string, day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const oldStatus = recordsByEmployee[employeeId]?.[day]?.status;

    setRecords(prev => prev.filter(r => !(r.employee_id === employeeId && r.attendance_date === dateStr)));
    if (oldStatus) {
      setSummary(prev => {
        const newSum = { ...prev };
        if (newSum[employeeId]) newSum[employeeId][oldStatus] = Math.max(0, (newSum[employeeId][oldStatus] || 0) - 1);
        return newSum;
      });
    }

    try {
      await deletePuantajRecord(employeeId, dateStr);
      setActivePopover(null);
    } catch (err) {
      console.error(err);
      loadData();
    }
  };

  const handleRowFill = async (employeeId: string, status: PuantajStatus) => {
    if (!confirm(`Tüm ayı '${STATUS_CONFIG[status].label}' olarak doldurmak istediğinize emin misiniz?`)) return;
    
    setIsLoading(true);
    try {
      const promises = daysArray.map(day => {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return savePuantajRecord({ employee_id: employeeId, attendance_date: dateStr, status });
      });
      await Promise.all(promises);
      loadData();
    } catch (err) {
      console.error(err);
      setIsLoading(false);
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
          <p className="text-slate-500 font-medium mt-1">Personel durumlarını profesyonelce yönetin.</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
           <button onClick={() => setCurrentDate(new Date(year, month - 2, 1))} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
             <ChevronLeft size={20} />
           </button>
           <span className="font-black text-sm uppercase tracking-widest min-w-[140px] text-center">
             {new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(currentDate)}
           </span>
           <button onClick={() => setCurrentDate(new Date(year, month, 1))} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
             <ChevronRight size={20} />
           </button>
        </div>
      </div>

      {/* Toolbar */}
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
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="sticky left-0 z-20 bg-white md:bg-slate-50/90 backdrop-blur-md p-6 border-r border-slate-100 text-left min-w-[280px] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
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
                <PuantajRow 
                  key={emp.id}
                  employee={emp}
                  daysArray={daysArray}
                  records={recordsByEmployee[emp.id] || {}}
                  summary={summary[emp.id] || {}}
                  onCellClick={(day, employee) => setActivePopover({ day, employee })}
                  onQuickSave={handleStatusSave}
                  onRowFill={handleRowFill}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Popover Manager */}
      {isMounted && (
        <AnimatePresence>
          {activePopover && createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
                onClick={() => setActivePopover(null)} 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative z-[110] bg-white border border-slate-200 p-6 rounded-[2.5rem] shadow-2xl w-full max-w-[320px]"
              >
                <div className="flex items-center justify-between mb-6">
                   <div>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       {activePopover.day} {new Intl.DateTimeFormat('tr-TR', { month: 'long' }).format(currentDate)}
                     </span>
                     <h3 className="text-lg font-black text-slate-900">{activePopover.employee.first_name} {activePopover.employee.last_name}</h3>
                   </div>
                   <button onClick={() => setActivePopover(null)} className="p-2 hover:bg-slate-100 rounded-xl">
                     <X size={20} className="text-slate-400" />
                   </button>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1 scrollbar-hide">
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => handleStatusSave(activePopover.employee.id, activePopover.day, key as PuantajStatus)}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-3xl hover:bg-slate-50 border border-slate-50 transition-all group"
                    >
                      <div className={`w-12 h-12 rounded-2xl ${config.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <config.icon size={20} />
                      </div>
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter text-center">{config.label}</span>
                    </button>
                  ))}
                  
                  {recordsByEmployee[activePopover.employee.id]?.[activePopover.day] && (
                    <button
                      onClick={() => handleStatusDelete(activePopover.employee.id, activePopover.day)}
                      className="col-span-2 mt-2 flex items-center gap-3 w-full p-4 rounded-3xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest"
                    >
                      <X size={18} /> Kaydı Sil
                    </button>
                  )}
                </div>
              </motion.div>
            </div>,
            document.body
          )}
        </AnimatePresence>
      )}

      {/* Global Loading */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-[3rem] shadow-2xl flex items-center gap-6 border border-slate-100">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="font-black text-slate-600 italic tracking-tight">Puantaj güncelleniyor...</span>
          </div>
        </div>
      )}
    </div>
  );
}
