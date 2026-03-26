"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Plus, ChevronRight, User, MoreHorizontal, Mail, Phone, MapPin, Briefcase } from "lucide-react";
import AddEmployeeModal from "./AddEmployeeModal";
import { getEmployees } from "@/lib/actions/employees";
import { Employee } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function EmployeeList() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Error loading employees:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredEmployees = employees.filter(emp => 
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.tc_no.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="İsim veya TC No ile ara..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Filter size={18} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-blue-900/10 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
          >
            <Plus size={18} /> Yeni Personel Ekle
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Personel Bilgileri</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Departman / Pozisyon</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Giriş Tarihi</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Durum</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm italic">Yükleniyor...</td>
                </tr>
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <tr 
                    key={emp.id} 
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    onClick={() => router.push(`/personnel/${emp.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs overflow-hidden border border-slate-200">
                          {emp.photo_url ? (
                            <img src={emp.photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            `${emp.first_name[0]}${emp.last_name[0]}`
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{emp.first_name} {emp.last_name}</p>
                          <p className="text-[11px] text-slate-500">{emp.tc_no}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-slate-400" />
                        <span className="font-medium">{emp.department_name || 'Merkez'}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Briefcase size={12} className="text-slate-400" />
                        <span className="text-[11px] text-slate-500">{emp.position_name || 'Belirtilmedi'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      <p className="font-medium">{new Date(emp.hire_date).toLocaleDateString('tr-TR')}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                        emp.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {emp.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm italic">Kayıt bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List (Cards) */}
        <div className="md:hidden divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 text-sm italic">Yükleniyor...</div>
          ) : filteredEmployees.length > 0 ? (
            filteredEmployees.map((emp) => (
              <div 
                key={emp.id}
                className="p-6 active:bg-slate-50 transition-colors flex items-center justify-between gap-4"
                onClick={() => router.push(`/personnel/${emp.id}`)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-lg overflow-hidden border border-slate-200 shrink-0">
                    {emp.photo_url ? (
                      <img src={emp.photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      `${emp.first_name[0]}${emp.last_name[0]}`
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-900 truncate">{emp.first_name} {emp.last_name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 truncate">
                      {emp.position_name || 'Belirtilmedi'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                        emp.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {emp.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(emp.hire_date).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-300 shrink-0" />
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-400 text-sm italic">Kayıt bulunamadı.</div>
          )}
        </div>
      </div>

      <AddEmployeeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setIsModalOpen(false);
          loadEmployees();
        }}
      />
    </div>
  );
}
