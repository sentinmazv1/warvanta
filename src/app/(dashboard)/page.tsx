"use client";

import { useState, useEffect } from "react";
import { 
  Users, Clock, Calendar, Shield, CreditCard, 
  Box, CheckCircle2, ArrowRight, Star, 
  BarChart3, Cloud, Send, Loader2, X, ChevronRight, Circle, LogOut, Package, StickyNote, Menu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { checkOnboardingStatus } from "@/lib/actions/auth";

export default function RootPage() {
  const [auth, setAuth] = useState<any>(null);
  
  useEffect(() => {
    checkOnboardingStatus().then(setAuth);
  }, []);

  if (!auth) return <div className="min-h-screen animate-pulse bg-white"></div>;

  if (!auth.isAuthenticated) {
    return <LandingPage />;
  }

  if (auth.role === 'EMPLOYEE') {
    return <StaffDashboard firstName={auth.firstName} />;
  }

  return <Dashboard role={auth.role} firstName={auth.firstName} />;
}

// --- DASHBOARD (ADMIN / HR) ---
function Dashboard({ role, firstName }: { role: string, firstName: string }) {

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
         <div className="relative z-10">
            <h1 className="text-3xl font-bold tracking-tight">Hoş Geldiniz, {firstName}! 👋</h1>
            <p className="text-slate-400 mt-2 max-w-md text-sm">Şirket genelindeki süreçleri buradan takip edebilirsiniz.</p>
            
            <div className="flex flex-wrap gap-4 mt-8">
              <Link href="/personnel" className="bg-blue-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2">
                <Users size={18} /> Personel Yönetimi
              </Link>
              <Link href="/personnel/puantaj" className="bg-slate-800 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-700 transition-all border border-slate-700">
                Puantaj Cetveli
              </Link>
            </div>
         </div>
         <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-600/20 to-transparent -z-0"></div>
         <Shield className="absolute -bottom-10 -right-10 text-white/5 w-64 h-64 border-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="flex justify-between items-center">
             <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
               <BarChart3 className="text-blue-600" size={20} /> Genel Bakış
             </h3>
           </div>
           <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                <Users size={32} />
              </div>
              <h4 className="font-bold text-slate-900">Profesyonel Yönetim Paneli</h4>
              <p className="text-sm text-slate-500 max-w-sm mt-2 font-medium">
                Personel bilgilerini, puantaj cetvellerini ve izin taleplerini yan menüden yönetebilirsiniz.
              </p>
           </div>
        </div>

        <div className="space-y-6">
           <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
             <Star className="text-amber-500" size={20} /> Hızlı Erişim
           </h3>
           <div className="grid grid-cols-2 gap-4">
              <QuickAction icon={<Users size={20}/>} label="Personel" href="/personnel" color="bg-blue-50 text-blue-600" />
              <QuickAction icon={<Calendar size={20}/>} label="Puantaj Cetveli" href="/personnel/puantaj" color="bg-emerald-50 text-emerald-600" />
              <QuickAction icon={<Calendar size={20}/>} label="Tüm İzinler" href="/leaves" color="bg-purple-50 text-purple-600" />
              <QuickAction icon={<Package size={20}/>} label="Tüm Zimmetler" href="/assets" color="bg-orange-50 text-orange-600" />
           </div>
        </div>
      </div>
    </div>
  );
}

// --- STAFF DASHBOARD (EMPLOYEE) ---
function StaffDashboard({ firstName }: { firstName: string }) {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
         <div className="relative z-10">
            <h1 className="text-3xl font-bold tracking-tight">Selam, {firstName}! 👋</h1>
            <p className="text-blue-100/60 mt-2 max-w-md text-sm">Kişisel yönetim panelinize hoş geldiniz.</p>
            
            <div className="flex flex-wrap gap-4 mt-8">
              <Link href="/personnel/puantaj" className="bg-white text-blue-700 px-8 py-3 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all flex items-center gap-3 shadow-xl shadow-blue-900/40">
                <Calendar size={20} /> PUANTAJ GÖRÜNTÜLE
              </Link>
            </div>
         </div>
         <Calendar className="absolute top-1/2 -right-10 -translate-y-1/2 text-white/5 w-64 h-64 -rotate-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PersonalActionCard 
          icon={<Calendar className="text-purple-600" />} 
          label="İzin Talebi Oluştur" 
          description="Yıllık izninizi veya mazeret izninizi buradan talep edin." 
          href="/leaves"
          color="bg-purple-50"
        />
        <PersonalActionCard 
          icon={<StickyNote className="text-emerald-600" />} 
          label="Kişisel Defterim" 
          description="Özel notlarınızı ve hatırlatıcılarınızı yönetin." 
          href="/notes"
          color="bg-emerald-50"
        />
        <PersonalActionCard 
          icon={<Package className="text-orange-600" />} 
          label="Üzerimdeki Zimmetler" 
          description="Size teslim edilen ekipmanları kontrol edin." 
          href="/assets"
          color="bg-orange-50"
        />
        <PersonalActionCard 
          icon={<Package className="text-blue-600" />} 
          label="Sarf Malzeme Talebi" 
          description="İHTİYAÇ duyduğunuz ofis malzemelerini buradan talep edin." 
          href="/assets"
          color="bg-blue-50"
        />
      </div>

      {/* Support Section */}
      <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-6 text-center md:text-left">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
               <Shield size={32} />
            </div>
            <div>
               <h4 className="font-bold text-slate-900">Yardıma mı ihtiyacınız var?</h4>
               <p className="text-sm text-slate-500 font-medium">İnsan kaynakları ekibine veya sistem yöneticisine buradan mesaj gönderin.</p>
            </div>
         </div>
         <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all">
            Destek Ekibine Yaz
         </button>
      </div>
    </div>
  );
}

function PersonalActionCard({ icon, label, description, href, color }: any) {
  return (
    <Link href={href} className={`${color} p-8 rounded-[2rem] border border-transparent hover:border-slate-200 hover:shadow-xl transition-all group flex flex-col gap-4 text-left`}>
       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
          {icon}
       </div>
       <div>
          <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{label}</h4>
          <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">{description}</p>
       </div>
    </Link>
  );
}

function QuickAction({ icon, label, href, color }: any) {
  return (
    <Link href={href} className={`${color} p-6 rounded-3xl flex flex-col items-center justify-center gap-3 font-bold text-xs hover:-translate-y-1 transition-all shadow-sm`}>
      {icon}
      {label}
    </Link>
  );
}


// --- LANDING PAGE (UNAUTHENTICATED) ---
function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white min-h-screen text-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="h-20 md:h-24 border-b border-slate-100 flex items-center justify-between px-6 md:px-20 bg-white/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Shield className="text-white" size={24} />
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tighter text-slate-900">WARVANTA</span>
        </div>
        
        {/* Feature Links in Header - Desktop Only */}
        <div className="hidden lg:flex items-center gap-8 border-x border-slate-100 px-10 mx-10">
            <HeaderFeatureLink label="Otomatik Puantaj" />
            <HeaderFeatureLink label="İzin Hakediş" />
            <HeaderFeatureLink label="Personel Aidiyeti" />
            <HeaderFeatureLink label="Zimmet Takibi" />
        </div>

        <div className="hidden md:flex items-center gap-6">
          <NavItem href="/login" label="Müşteri Girişi" />
          <Link href="/signup" className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors">
            Kayıt Ol
          </Link>
          <Link href="/apply" className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all text-sm">
            Hemen Başla
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link href="/login" className="text-xs font-bold text-slate-600 px-3 py-1.5 hover:text-blue-600 transition-colors">
            Giriş
          </Link>
          <button 
            className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[51]"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed inset-y-0 right-0 w-80 bg-white z-[52] p-8 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-12">
                <span className="text-xl font-black tracking-tighter">MENÜ</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-100 rounded-xl text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-6 flex-1">
                 <MobileNavItem href="#features" label="Özellikler" onClick={() => setIsMobileMenuOpen(false)} />
                 <MobileNavItem href="#how-it-works" label="Nasıl Çalışır?" onClick={() => setIsMobileMenuOpen(false)} />
                 <MobileNavItem href="/login" label="Müşteri Girişi" onClick={() => setIsMobileMenuOpen(false)} />
                 <MobileNavItem href="/signup" label="Kayıt Ol" onClick={() => setIsMobileMenuOpen(false)} />
              </div>

              <Link 
                href="/apply" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="bg-blue-600 text-white w-full py-4 rounded-2xl font-bold text-center shadow-xl shadow-blue-900/20 mt-auto"
              >
                Hemen Başla
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8 border border-blue-100 shadow-sm"
          >
            <Circle size={10} className="fill-blue-600 border-none" /> Excell Devri Kapandı
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-8 bg-gradient-to-b from-slate-900 to-slate-700 bg-clip-text text-transparent max-w-4xl"
          >
            Şirketinizi Excell Tablolarından <span className="text-blue-600 italic">Özgürleştirin</span>, Dijital Yönetimin Gücünü Bugün Keşfedin.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.1 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg md:text-xl text-slate-500 max-w-3xl mb-12 leading-relaxed font-medium"
          >
            Warvanta, tüm iş operasyonlarınızı bulut tabanlı, hızlı ve güvenli bir altyapıya taşır.
            Warvanta ile tüm iş süreçlerinizi tek bir akıllı platformda toplayın, <span className="text-slate-900 font-bold underline decoration-blue-500 underline-offset-4">zamanınızı büyümeye ayırın</span>.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.2 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Link href="/apply" className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-bold text-lg shadow-2xl shadow-blue-900/30 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group">
              Karmaşadan Kurtulun <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[150px] -z-10 -translate-x-1/2"></div>
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-[150px] -z-10 translate-x-1/2"></div>
      </section>

      {/* Value Proposition Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                    <h2 className="text-4xl font-black text-slate-900 leading-tight">Sadece Bir Yazılım Değil,<br/>Şirketinizin Dijital Ortağı.</h2>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        Excell tablolarına hapsolmuş verimliliği özgür bırakın. Warvanta, işletmenizin büyüme hızına ayak uyduran, 
                        esnek ve ölçeklenebilir bir İK ekosistemi sunar.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                                <CheckCircle2 size={20} />
                            </div>
                            <p className="font-bold text-slate-700">Karmaşık formüller yerine tek tıkla işlem.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                                <CheckCircle2 size={20} />
                            </div>
                            <p className="font-bold text-slate-700">Kaybolan veriler yerine güvenli bulut arşivi.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                                <CheckCircle2 size={20} />
                            </div>
                            <p className="font-bold text-slate-700">Manuel hesaplama yerine otomatik süreçler.</p>
                        </div>
                    </div>
                </div>
                <div className="relative">
                    <div className="bg-slate-50 rounded-[3rem] p-8 border border-slate-100 aspect-square flex items-center justify-center">
                         <div className="text-center space-y-4">
                            <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200">
                                <BarChart3 className="text-blue-600 w-16 h-16 mx-auto mb-4" />
                                <h4 className="font-black text-slate-900">Otomatik Raporlama</h4>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Siz İşinize Odaklanın</p>
                            </div>
                            <div className="bg-slate-900 p-6 rounded-3xl shadow-2xl translate-x-12 -mt-4">
                                <Clock className="text-emerald-400 w-8 h-8 mb-2" />
                                <p className="text-white font-bold text-sm">Puantaj Takibi Tamamlandı</p>
                                <p className="text-slate-500 text-[10px]">Tüm veriler dijital ortamda güvende.</p>
                            </div>
                         </div>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                </div>
            </div>
        </div>
      </section>

      {/* Comparison Section (Excell vs Warvanta) */}
      <section className="py-24 bg-slate-900 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-8 relative z-10">
            <div className="text-center mb-20">
                <h2 className="text-4xl font-black text-white mb-4">Dijital Yönetimde Yeni Bir Çağ</h2>
                <p className="text-slate-400 font-medium">Sıradan tablolardan, sonuç odaklı akıllı süreçlere geçiş yapın.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Before: Excell Chaos */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <X className="text-red-500" size={20} />
                        <span className="text-red-400 font-bold uppercase tracking-widest text-[10px]">Eski Dünya: Karmaşa ve Hata</span>
                    </div>
                    <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 opacity-60 grayscale hover:grayscale-0 transition-all cursor-not-allowed">
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(j => (
                                        <div key={j} className="h-4 flex-1 bg-slate-700 rounded-sm"></div>
                                    ))}
                                </div>
                            ))}
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mt-4 text-center">
                                <p className="text-red-400 text-[10px] font-bold tracking-widest uppercase">⚠️ VERİ KAYBI RİSKİ: Personel_Final_V3.xlsx</p>
                            </div>
                        </div>
                    </div>
                    <p className="text-slate-500 text-xs italic">"Statik, güvenilirliği düşük ve yönetilemez Excell dosyaları."</p>
                </div>

                {/* After: Warvanta Premium */}
                <div className="space-y-4 lg:translate-y-12">
                     <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="text-emerald-500" size={20} />
                        <p className="text-slate-500 text-xs mb-6 uppercase tracking-widest font-bold">Yeni Nesil Dijital Yönetim Sistemi</p>
                    </div>
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-blue-500/20 border border-blue-100 relative group overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900">Dijital Ekosistem</h4>
                                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter">İşletme Kontrol Altında</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-32 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-slate-400 text-[10px] font-black tracking-[0.2em] mb-1">STRATEJİK VERİ AKIŞI</p>
                                <div className="flex gap-1 justify-center">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-6 h-2 bg-blue-600 rounded-full"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    </div>
                     <p className="text-blue-400 text-xs font-bold italic">"Dinamik, güvenli ve her an parmaklarınızın ucundaki raporlar."</p>
                </div>
            </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-950 to-transparent -z-0"></div>
      </section>
      <section id="features" className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Eski Alışkanlıkları Değiştiren Özellikler</h2>
            <p className="text-slate-500 max-w-xl mx-auto font-medium">Kağıt, kalem ve karmaşık tabloların yerini modern çözümler alıyor.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Calendar />} 
              title="Kıdem Bazlı İzin Yönetimi" 
              description="İşe başlama tarihine göre hakedişleri otomatik hesaplayan, manuel karmaşayı bitiren akıllı izin sistemi."
            />
            <FeatureCard 
              icon={<Clock />} 
              title="Dijital Puantaj Cetveli" 
              description="Günlük katılımı, izinleri ve mesaileri tek tıkla yönetebileceğiniz modern puantaj tablosu."
            />
            <FeatureCard 
              icon={<Star />} 
              title="Personel Aidiyeti" 
              description="Doğum günlerini ve işe giriş yıldönümlerini takip eden, kurumsal kültürü güçlendiren özel takvim."
            />
            <FeatureCard 
              icon={<Package />} 
              title="Zimmet & Varlık Yönetimi" 
              description="Ekipmanların kimde olduğunu aramakla vakit kaybetmeyin. Tüm zimmet süreci dijital takibinizde."
            />
            <FeatureCard 
              icon={<StickyNote />} 
              title="Kişisel Notlar & Defter" 
              description="Günlük işlerinizi ve hatırlatıcılarınızı bilgisayarınızı yormadan uygulama üzerinde saklayın."
            />
            <FeatureCard 
              icon={<Shield />} 
              title="Dijital Evrak Arşivi" 
              description="Özlük dosyaları ve sözleşmeler bulutta güvende. Dosya klasörleri arasında kaybolmaya son."
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="bg-slate-900 rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div>
                    <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">Dijital Dönüşüm <br/>İçin Sadece 3 Adım.</h2>
                    <p className="text-slate-400 text-lg mb-12 font-medium">PC'nizi yavaşlatan verileri Warvanta'ya taşıyın, şirketinizin verimliliğini artırın.</p>
                    <Link href="/apply" className="inline-flex items-center gap-2 px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all shadow-2xl shadow-white/10">
                        BAŞVURUNU TAMAMLA <ArrowRight size={18} />
                    </Link>
                </div>
                <div className="space-y-12">
                    <div className="flex gap-6">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-xl shrink-0">01</div>
                        <div>
                            <h4 className="text-xl font-bold mb-2">Hızlı Başvuru</h4>
                            <p className="text-slate-500 text-sm font-medium">Şirket bilgilerinizi iletin, sistem kurulumunuzu hemen başlatalım.</p>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-xl shrink-0">02</div>
                        <div>
                            <h4 className="text-xl font-bold mb-2">Veri Aktarımı</h4>
                            <p className="text-slate-500 text-sm font-medium">Eski tablolarınızdaki verileri güvenle sisteme aktaralım ve PC'nizi özgür bırakalım.</p>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-xl shrink-0">03</div>
                        <div>
                            <h4 className="text-xl font-bold mb-2">Zamanınız Size Kalsın</h4>
                            <p className="text-slate-500 text-sm font-medium">Manuel işlerden kurtulun, verimliliği artıran dijital süreçlerin keyfini çıkarın.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>
          </div>
        </div>
      </section>

      {/* Trust Quote */}
      <section className="py-24 px-8 text-center bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <p className="text-3xl font-black text-slate-900 leading-[1.3] mb-8">
            "Excell tabloları arasında kaybolan zamanı <br/>Warvanta ile geri kazandık."
          </p>
          <div className="flex items-center justify-center gap-4">
             <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">A</div>
             <div className="text-left">
                <p className="font-bold text-slate-900 leading-tight">İbrahim Şentinmaz</p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Founder @ Warvanta</p>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Shield size={24} className="text-blue-500" />
              <span className="text-2xl font-black text-white">WARVANTA</span>
            </div>
            <p className="max-w-sm mb-8 leading-relaxed">
              Warvanta, KOBİ'lerin ve büyük ölçekli şirketlerin personel süreçlerini kolaylaştırmak için tasarlanmış, bulut tabanlı bir SaaS İK yönetim çözümüdür.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Hızlı Menü</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/" className="hover:text-blue-400">Ana Sayfa</Link></li>
              <li><Link href="#features" className="hover:text-blue-400">Özellikler</Link></li>
              <li><Link href="/apply" className="hover:text-blue-400">Başvuru Yap</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Yasal</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-blue-400">KVKK Metni</a></li>
              <li><a href="#" className="hover:text-blue-400">Kullanım Koşulları</a></li>
              <li><a href="#" className="hover:text-blue-400">Gizlilik Politikası</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-slate-800 text-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
            Tasarım & Geliştirme: <span className="text-blue-400">İbrahim Şentinmaz</span>
          </p>
          <p className="text-slate-600 text-[9px]">© {new Date().getFullYear()} Warvanta Teknoloji. Tüm Hakları Saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}

// --- HELPER COMPONENTS ---
function HeaderFeatureLink({ label }: { label: string }) {
    return (
        <a href="#features" className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
            {label}
        </a>
    );
}

function StepCard({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center text-center group">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl mb-6 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all ring-8 ring-white">
        {number}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed px-4">{description}</p>
    </div>
  );
}

function NavItem({ href, label }: { href: string, label: string }) {
  return (
    <Link href={href} className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
      {label}
    </Link>
  );
}

function MobileNavItem({ href, label, onClick }: { href: string, label: string, onClick?: () => void }) {
    return (
      <Link 
        href={href} 
        onClick={onClick}
        className="w-full text-lg font-black text-slate-900 border-b border-slate-50 pb-4"
      >
        {label}
      </Link>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-blue-500/20 hover:shadow-xl hover:shadow-blue-900/5 transition-all group">
      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}
