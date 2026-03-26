"use client";

import { useState, useEffect } from "react";
import { getActiveCompanies } from "@/lib/actions/master";
import {
  Building2,
  Search,
  MoreVertical,
  ExternalLink,
  Filter,
} from "lucide-react";

export default function ActiveCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    setIsLoading(true);
    try {
      const data = await getActiveCompanies();
      setCompanies(data);
    } catch (err: any) {
      console.error(err);
      alert("Şirket verileri yüklenirken hata: " + (err.message || "Bilinmeyen hata"));
    } finally {
      setIsLoading(false);
    }
  }

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
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

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 uppercase text-[10px] font-black tracking-widest text-slate-400">
                <th className="p-4 md:p-6 font-semibold">Şirket Adı</th>
                <th className="p-4 md:p-6 font-semibold">Kayıt Tarihi</th>
                <th className="p-4 md:p-6 font-semibold">Abonelik Süresi</th>
                <th className="p-4 md:p-6 font-semibold">Durum</th>
                <th className="p-4 md:p-6 font-semibold text-right">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    Yükleniyor...
                  </td>
                </tr>
              ) : filteredCompanies.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-12 text-center text-slate-400 border-2 border-dashed border-slate-100 m-8 rounded-3xl"
                  >
                    Bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company) => (
                  <tr
                    key={company.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="p-4 md:p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center font-bold text-blue-600 uppercase text-lg shrink-0">
                          {company.name.charAt(0)}
                        </div>
                        <span className="font-bold text-sm text-slate-900">
                          {company.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 md:p-6 text-sm text-slate-500 font-medium">
                      {new Date(
                        company.subscription_start_at || company.created_at,
                      ).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="p-4 md:p-6 text-sm text-slate-600 font-bold">
                      {company.subscription_period === "2_YEARS"
                        ? "2 Yıl"
                        : company.subscription_period === "3_YEARS"
                          ? "3 Yıl"
                          : company.subscription_period === "6_MONTHS"
                            ? "6 Ay"
                            : "1 Yıl"}
                    </td>
                    <td className="p-4 md:p-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>{" "}
                        Aktif
                      </span>
                    </td>
                    <td className="p-4 md:p-6 text-right">
                      <button className="text-slate-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50 opacity-0 group-hover:opacity-100">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
