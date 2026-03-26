import {
  ShieldCheck,
  Building2,
  Users,
  Receipt,
  Clock,
  ArrowRight,
} from "lucide-react";
import { getPlatformStats } from "@/lib/actions/master";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MasterDashboardPage() {
  let stats;
  try {
    stats = await getPlatformStats();
  } catch (error) {
    // Let the layout handle the unauthorized state
    return null;
  }

  const statCards = [
    {
      title: "Kayıtlı Şirketler",
      value: stats.totalCompanies,
      icon: <Building2 size={24} />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Toplam Personel",
      value: stats.totalUsers,
      icon: <Users size={24} />,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Bekleyen Başvurular",
      value: stats.pendingApps,
      icon: <Clock size={24} />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Aktif Abonelikler",
      value: stats.activeSubs,
      icon: <Receipt size={24} />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
          Merhaba İbrahim <span className="text-2xl">👋</span>
        </h1>
        <p className="text-slate-500 mt-2">
          Warvanta platformunun genel durumunu bu ekrandan takip edebilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-start justify-between"
          >
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
                {card.title}
              </p>
              <h3 className="text-3xl font-black text-slate-900">
                {card.value}
              </h3>
            </div>
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.bg} ${card.color}`}
            >
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-900">
              En Son Katılan Şirketler
            </h2>
            <Link
              href="/master/companies"
              className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              Tümünü Gör <ArrowRight size={16} />
            </Link>
          </div>

          <div className="space-y-4">
            {stats.recentCompanies.length > 0 ? (
              stats.recentCompanies.map((company: any, idx: number) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100/50 flex items-center justify-center text-blue-600 font-bold text-lg">
                      {company.company_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">
                        {company.company_name}
                      </h4>
                      <p className="text-xs font-medium text-slate-500">
                        {company.contact_person_name}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 text-left sm:text-right">
                    <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full inline-block">
                      Aktif / Yayında
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium block">
                      {new Date(company.created_at).toLocaleDateString("tr-TR")}{" "}
                      tarihinde katıldı
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 italic text-sm">
                Henüz onaylanmış bir şirket bulunmuyor.
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-8 rounded-[2rem] shadow-lg shadow-blue-900/20 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Hızlı İşlemler</h2>
            <p className="text-blue-100 text-sm mb-8 leading-relaxed">
              Bekleyen başvuruları inceleyin, abonelikleri yönetin veya platform
              genelindeki duyuruları ayarlayın.
            </p>
          </div>

          <div className="space-y-3 relative z-10">
            <Link
              href="/master/applications"
              className="w-full bg-white text-blue-600 px-6 py-4 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
            >
              <span>Başvuruları İncele</span>
              {stats.pendingApps > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {stats.pendingApps} yeni
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
