import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
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
  title: "LuxeFurniture | Эксклюзивная мебель для вашего дома",
  description: "Откройте для себя коллекцию премиальной мебели: от дизайнерских стульев до роскошных диванов. Качество, стиль и уют в каждой детали.",
  keywords: ["мебель", "дизайнерская мебель", "купить диван", "стулья из дуба", "интерьер"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased">
        <header className="fixed top-0 w-full z-50 glass h-20 flex items-center px-8 justify-between">
          <div className="text-2xl font-bold tracking-tighter font-outfit uppercase">
            Luxe<span className="text-[var(--accent)]">Furniture</span>
          </div>
          <nav className="hidden md:flex gap-8 font-medium">
            <a href="#" className="hover:text-[var(--accent)] transition-colors">Каталог</a>
            <a href="#" className="hover:text-[var(--accent)] transition-colors">Материалы</a>
            <a href="#" className="hover:text-[var(--accent)] transition-colors">О нас</a>
          </nav>
          <button className="bg-[var(--foreground)] text-[var(--background)] px-6 py-2 rounded-full font-semibold hover-scale">
            Связаться
          </button>
        </header>
        <main className="pt-20">
          {children}
        </main>
        <footer className="bg-[var(--foreground)] text-[var(--background)] py-12 px-8 mt-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="text-xl font-bold font-outfit mb-4 uppercase">LuxeFurniture</div>
              <p className="opacity-70">Создаем уют и эстетику в вашем пространстве с 2026 года.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Навигация</h4>
              <ul className="space-y-2 opacity-70">
                <li>Каталог</li>
                <li>Доставка</li>
                <li>Контакты</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Контакты</h4>
              <p className="opacity-70">Москва, ул. Дизайнеров, 15</p>
              <p className="opacity-70">info@luxefurniture.ru</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
