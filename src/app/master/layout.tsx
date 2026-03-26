import { redirect } from "next/navigation";
import { checkSuperadmin } from "@/lib/actions/master";
import { MasterSidebar } from "@/components/master/MasterSidebar";
import { createClient as createServerClient } from "@/lib/supabase/server";

export default async function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Strict check: Only Superadmins can access this layout
  const isSuperadmin = await checkSuperadmin();

  if (!isSuperadmin) {
    // For debugging: Let's see what email is being used
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    return (
      <div className="p-20 text-center max-w-xl mx-auto">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-slate-900">Erişim Engellendi (v2.0)</h1>
        <p className="mt-4 text-slate-500 leading-relaxed">
          Bu alan sadece platform yöneticilerine özeldir. Eğer yöneticiyseniz, doğru e-posta adresi ile giriş yaptığınızdan emin olun.
        </p>
        <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 text-left">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Giriş Yapılan E-posta</p>
          <p className="text-sm font-bold text-slate-700">{user?.email || "Oturum açılmamış veya e-posta bulunamadı"}</p>
        </div>
        <div className="mt-10 flex items-center justify-center gap-4">
          <a href="/" className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all">Ana Sayfa</a>
          <a href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">Farklı Hesapla Giriş Yap</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <MasterSidebar />
      <main className="flex-1 overflow-y-auto w-full md:pl-64">
        <div className="p-4 md:p-8 pt-20 md:pt-8 w-full">{children}</div>
      </main>
    </div>
  );
}
