import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Shell from "@/components/layout/Shell";
import { checkOnboardingStatus } from "@/lib/actions/auth";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Warvanta | Profesyonel İK ve Personel Yönetimi",
  description: "KOBİ'ler için çok şirketli personel yönetim sistemi",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, role, firstName, permissions } = await checkOnboardingStatus();

  return (
    <html lang="tr">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <Shell 
          isAuthenticated={isAuthenticated} 
          role={role} 
          firstName={firstName}
          permissions={permissions}
        >
          {children}
        </Shell>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
