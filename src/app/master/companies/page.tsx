"use client";

import { useState, useEffect } from "react";
import { getActiveCompanies, deleteCompany } from "@/lib/actions/master";
import {
  Building2,
  Search,
  MoreVertical,
  ExternalLink,
  Filter,
  Trash2,
  Settings2,
} from "lucide-react";

export default function ActiveCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    setIsLoading(true);
    try {
      const { data, error } = await getActiveCompanies();
      if (error) throw new Error(error);
      setCompanies(data || []);
    } catch (err: any) {
      console.error(err);
      alert("Şirket verileri yüklenirken hata: " + (err.message || "Bilinmeyen hata"));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteCompany(id: string, name: string) {
    if (!window.confirm(`"${name}" şirketini ve tüm verilerini kalıcı olarak silmek istediğinize emin misiniz?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const result = await deleteCompany(id);
      if (result.success) {
        await loadCompanies();
      } else {
        alert("Silme işlemi başarısız: " + result.error);
      }
    } catch (err: any) {
      console.error(err);
      alert("Bir hata oluştu.");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredCompanies = (companies || []).filter((c) =>
    (c.name || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Building2 size={28} className="text-blue-600" /> Aktif Şirketler
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Platformu kullanan tüm onaylı şirketleri ve abonelik durumlarını
            görüntüleyin.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Şirket Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <button className="bg-white border border-slate-200 text-slate-600 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 uppercase text-[10px] font-black tracking-widest text-slate-400">
                <th className="p-6 font-semibold">Şirket Adı</th>
                <th className="p-6 font-semibold">Kayıt Tarihi</th>
                <th className="p-6 font-semibold">Abonelik Süresi</th>
                <th className="p-6 font-semibold">Durum</th>
                <th className="p-6 font-semibold text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">Yükleniyor...</td>
                </tr>
              ) : filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">Bulunamadı.</td>
                </tr>
              ) : (
                filteredCompanies.map((company) => (
                  <tr key={company.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center font-bold text-blue-600 uppercase text-lg shrink-0">
                          {company.name.charAt(0)}
                        </div>
                        <span className="font-bold text-sm text-slate-900">{company.name}</span>
                      </div>
                    </td>
                    <td className="p-6 text-sm text-slate-500 font-medium">
                      {new Date(company.subscription_start_at || company.created_at).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="p-6 text-sm text-slate-600 font-bold">
                      {company.subscription_period === "2_YEARS" ? "2 Yıl" : company.subscription_period === "3_YEARS" ? "3 Yıl" : company.subscription_period === "6_MONTHS" ? "6 Ay" : "1 Yıl"}
                    </td>
                    <td className="p-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Aktif
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-slate-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50 opacity-0 group-hover:opacity-100" title="Yönet">
                          <Settings2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCompany(company.id, company.name)}
                          disabled={deletingId === company.id}
                          className={`text-slate-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 ${deletingId === company.id ? 'animate-pulse' : ''}`}
                          title="Sil"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List (Cards) */}
        <div className="md:hidden divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">Yükleniyor...</div>
          ) : filteredCompanies.length === 0 ? (
            <div className="p-12 text-center text-slate-400">Bulunamadı.</div>
          ) : (
            filteredCompanies.map((company) => (
              <div key={company.id} className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center font-black text-blue-600 text-xl shrink-0">
                      {company.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 leading-tight">{company.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                        {new Date(company.subscription_start_at || company.created_at).toLocaleDateString("tr-TR")} • Kayıtlı
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleDeleteCompany(company.id, company.name)}
                      disabled={deletingId === company.id}
                      className="p-3 text-red-500 bg-red-50 rounded-2xl active:bg-red-100 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Abonelik</p>
                      <p className="text-xs font-bold text-slate-900">
                        {company.subscription_period === "2_YEARS" ? "2 Yıl" : company.subscription_period === "3_YEARS" ? "3 Yıl" : company.subscription_period === "6_MONTHS" ? "6 Ay" : "1 Yıl"}
                      </p>
                   </div>
                   <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100/50 shadow-sm">
                      Aktif
                   </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
