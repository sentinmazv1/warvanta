import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Warvanta | Profesyonel İK ve Personel Yönetimi",
  description: "KOBİ'ler için çok şirketli personel yönetim sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
