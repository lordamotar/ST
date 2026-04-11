import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Stoly-Sklad | Современная мебель от производителя",
  description: "Дизайнерские столы и стулья премиального качества. Собственное производство, экологичные материалы и доставка по всей России.",
  keywords: ["мебель", "столы", "стулья", "лофт мебель", "купить мебель Москва"],
};

import { getCategories, getAllSettings } from "@/lib/api";
import UserNav from "@/components/UserNav";
import MobileMenu from "@/components/MobileMenu";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();
  const settings = await getAllSettings();
  const getS = (key: string, fallback: string) => {
    const s = settings.find((item: any) => item.key === key);
    return s && s.value ? s.value : fallback;
  };
  
  const socialLinks = [
    { name: "Instagram", url: getS("social_instagram", "#"), icon: "I" },
    { name: "WhatsApp", url: `https://wa.me/${getS("whatsapp_number", "77753424424")}`, icon: "W" },
    { name: "Telegram", url: getS("social_telegram", "#"), icon: "T" }
  ];

  return (
    <html lang="ru" className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased min-h-screen flex flex-col">
        <header className="fixed top-0 w-full z-50 nav-blur border-b border-white/10 h-20 flex items-center px-8 justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-[var(--accent)] rounded-xl flex items-center justify-center font-black text-[var(--background)] group-hover:rotate-12 transition-transform shadow-lg shadow-[var(--accent)]/20">S</div>
            <div className="text-2xl font-bold tracking-tighter font-outfit uppercase">
              Stoly<span className="text-[var(--accent)]">-Sklad</span>
            </div>
          </a>
          
          <nav className="hidden md:flex gap-12 font-black uppercase text-[10px] tracking-[0.2em] opacity-40">
            <a href="/" className="hover:text-[var(--accent)] hover:opacity-100 transition-all">Главная</a>
            <Link href="/catalog" className="hover:text-[var(--accent)] hover:opacity-100 transition-all">Каталог</Link>
            {categories.map((cat: any) => (
              <Link key={cat.id} href={`/catalog/${cat.slug}`} className="hover:text-[var(--accent)] hover:opacity-100 transition-all">
                {cat.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-6 sm:gap-10">
            <div className="hidden sm:block">
              <UserNav />
            </div>
            
            <MobileMenu categories={categories} />
          </div>
        </header>

        <main className="flex-grow pt-20">
          {children}
        </main>

        <footer className="bg-[#0a0a0a] text-white border-t border-white/5 pt-20 pb-10 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
              <div className="col-span-1 md:col-span-1">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center font-black text-black text-xs">S</div>
                  <span className="text-xl font-bold font-outfit uppercase">Stoly-Sklad</span>
                </div>
                <p className="text-white/40 text-sm leading-relaxed mb-6">
                  Мы создаем не просто мебель, а среду для жизни. Каждое изделие — это баланс эстетики и функциональности.
                </p>
                <div className="flex gap-4">
                  {socialLinks.map(link => (
                    <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-[var(--accent)] hover:text-[var(--accent)] cursor-pointer transition-all font-bold text-xs">
                      {link.icon}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black uppercase tracking-widest mb-8 text-[var(--accent)]">Каталог</h4>
                <ul className="space-y-4 text-sm text-white/50">
                  <li><Link href="/catalog" className="hover:text-white transition-colors">Весь ассортимент</Link></li>
                  {categories.map((cat: any) => (
                    <li key={cat.id}>
                      <Link href={`/catalog/${cat.slug}`} className="hover:text-white transition-colors">
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-black uppercase tracking-widest mb-8 text-[var(--accent)]">Магазин</h4>
                <ul className="space-y-4 text-sm text-white/50">
                  <li className="hover:text-white cursor-pointer transition-colors">Доставка и сборка</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Гарантия качества</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Возврат и обмен</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Публичная оферта</li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-black uppercase tracking-widest mb-8 text-[var(--accent)]">Шоурум</h4>
                <div className="text-white/50 text-sm space-y-4">
                  <p>г. Семей<br/>Пн-Вс: 10:00 — 21:00</p>
                  <p className="text-white font-bold text-lg">+{getS("whatsapp_number", "77753424424")}</p>
                  <p className="text-[var(--accent)] underline cursor-pointer">Заказать звонок</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-4">
              <p className="text-[10px] text-white/20 uppercase tracking-widest">© 2026 Stoly-Sklad. All rights reserved.</p>
              <div className="flex gap-8 text-[10px] text-white/20 uppercase tracking-widest font-bold">
                <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
                <span className="hover:text-white cursor-pointer transition-colors">Cookies</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
