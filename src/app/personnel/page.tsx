import { getEmployees } from "@/lib/actions/employees";
import { checkOnboardingStatus } from "@/lib/actions/auth";
import EmployeeList from "@/components/personnel/EmployeeList";
import Onboarding from "@/components/auth/Onboarding";
import Link from "next/link";

export default async function PersonnelPage() {
  const { hasCompany, isAuthenticated } = await checkOnboardingStatus();
  
  if (!isAuthenticated || !hasCompany) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Erişim Engellendi</h2>
        <p className="text-slate-500 mb-8">Lütfen önce giriş yapın ve şirket kurulumunu tamamlayın.</p>
        <Link href="/login" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">Giriş Yap</Link>
      </div>
    );
  }

  const employees = await getEmployees();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Personel Yönetimi</h1>
          <p className="text-slate-500 text-sm mt-1">Şirketinizdeki tüm çalışanları buradan yönetebilirsiniz.</p>
        </div>
      </div>

      <EmployeeList initialEmployees={employees} />
    </div>
  );
}
