import Link from 'next/link';
import { getPage } from "@/lib/api";

export default async function NotFound() {
  const page = await getPage("404");
  const title = page?.title || "Страница не найдена";
  const content = page?.content || "Похоже, эта страница была перемещена или её никогда не существовало. Попробуйте начать с главной.";

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Эффекты фона */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--accent)]/10 rounded-full blur-[120px]"></div>
      
      <div className="text-center relative z-10">
        <h1 className="text-[180px] md:text-[240px] font-black leading-none tracking-tighter opacity-10 select-none">404</h1>
        
        <div className="-mt-16 md:-mt-24">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">{title}</h2>
          <p className="text-white/40 text-sm md:text-base max-w-md mx-auto mb-10 font-medium">
            {content}
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link 
              href="/"
              className="bg-white text-black px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--accent)] transition-all shadow-xl shadow-black/20"
            >
              На главную страница
            </Link>
            <Link 
              href="/catalog"
              className="glass px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:border-white/20 transition-all"
            >
              В каталог товаров
            </Link>
          </div>
        </div>
      </div>

      {/* Декоративные элементы */}
      <div className="absolute bottom-10 left-10 text-[8px] font-black uppercase tracking-[0.5em] opacity-10 vertical-text">Stoly-Sklad Archive</div>
    </main>
  );
}
