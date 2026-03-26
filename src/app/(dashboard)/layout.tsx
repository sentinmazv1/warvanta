import Shell from "@/components/layout/Shell";
import { checkOnboardingStatus } from "@/lib/actions/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, role, firstName, permissions } = await checkOnboardingStatus();

  return (
    <Shell 
      isAuthenticated={isAuthenticated} 
      role={role} 
      firstName={firstName}
      permissions={permissions}
    >
      {children}
    </Shell>
  );
}
