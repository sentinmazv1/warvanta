import { redirect } from "next/navigation";
import { checkSuperadmin } from "@/lib/actions/master";
import { MasterSidebar } from "@/components/master/MasterSidebar";

export default async function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Strict check: Only Superadmins can access this layout
  const isSuperadmin = await checkSuperadmin();

  if (!isSuperadmin) {
    redirect("/"); // Redirect unauthorized users to the main landing page
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
