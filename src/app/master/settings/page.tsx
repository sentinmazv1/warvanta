import { Settings, Shield, Bell, Lock } from "lucide-react";

export default function MasterSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Sistem Ayarları
        </h1>
        <p className="text-slate-500 mt-2">
          Warvanta platform genelindeki global ayarları ve güvenlik yapılandırmalarını buradan yönetin.
        </p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 space-y-8">
          <div className="flex items-start gap-6 pb-8 border-b border-slate-50">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Platform Güvenliği</h3>
              <p className="text-slate-500 text-sm mt-1">İki aşamalı doğrulama ve IP kısıtlamaları gibi global güvenlik politikaları.</p>
              <div className="mt-4 inline-flex items-center px-4 py-2 bg-slate-50 text-slate-400 text-xs font-bold rounded-xl border border-dotted border-slate-200 cursor-not-allowed">
                Yakında Gelecek
              </div>
            </div>
          </div>

          <div className="flex items-start gap-6 pb-8 border-b border-slate-50">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
              <Bell size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Sistem Bildirimleri</h3>
              <p className="text-slate-500 text-sm mt-1">Tüm şirketlere gönderilecek bakım duyuruları veya güncelleme notları.</p>
              <div className="mt-4 inline-flex items-center px-4 py-2 bg-slate-50 text-slate-400 text-xs font-bold rounded-xl border border-dotted border-slate-200 cursor-not-allowed">
                Yakında Gelecek
              </div>
            </div>
          </div>

          <div className="flex items-start gap-6">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
              <Lock size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Superadmin Yönetimi</h3>
              <p className="text-slate-500 text-sm mt-1">Yönetim merkezine erişebilecek diğer e-posta adreslerini tanımlayın.</p>
              <div className="mt-4 inline-flex items-center px-4 py-2 bg-slate-50 text-slate-400 text-xs font-bold rounded-xl border border-dotted border-slate-200 cursor-not-allowed">
                Yakında Gelecek
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
          <Settings size={20} />
        </div>
        <p className="text-sm text-blue-700 font-medium">
          Bu bölümdeki ayarlar tüm platformu etkilediği için dikkatli kullanılması önerilir.
        </p>
      </div>
    </div>
  );
}
