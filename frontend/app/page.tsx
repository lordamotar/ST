import Image from "next/image";
import Link from "next/link";
import { getCategories, getProducts } from "@/lib/api";
import SearchInput from "@/components/SearchInput";
import ProductCard from "@/components/ProductCard";

export default async function Home() {
  const dbCategories = await getCategories();
  const allProducts = await getProducts();
  const featuredProducts = allProducts.slice(0, 4);

  const categories = dbCategories.map((cat: any) => {
    const assets: { [key: string]: string } = {
      chairs: "/assets/chair_category.png",
      sofas: "/assets/sofa_category.png",
      tables: "/assets/table_category.png",
      cupboards: "/assets/cupboard_category.png",
    };
    return { 
        ...cat, 
        img: assets[cat.slug] || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop"
    };
  });

  return (
    <div className="flex flex-col items-center">
      {/* ─── HERO SECTION ─── */}
      <section className="relative w-full h-[95vh] flex flex-col justify-center items-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_-20%,_var(--accent)_0%,_transparent_50%)] opacity-20"></div>
        <div className="absolute inset-0 z-0 pattern-bg opacity-[0.03]"></div>
        
        <div className="z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <span className="text-[var(--accent)] font-black uppercase tracking-[0.3em] text-xs mb-6 block">Premium Furniture 2026</span>
          <h1 className="text-6xl md:text-[9rem] font-outfit uppercase font-black tracking-tighter leading-[0.85] mb-8">
            Эстетика <br />
            <span className="text-gradient underline decoration-white/10 underline-offset-[15px]">Вашего дома</span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-50 mb-12 font-medium leading-relaxed">
            Мы объединили вековые традиции мебельного мастерства <br className="hidden md:block"/> 
            с технологиями будущего для создания вашего идеального пространства.
          </p>
        </div>
        
        <div className="z-10 w-full max-w-xl animate-in fade-in duration-1000 delay-500">
          <SearchInput />
        </div>

        <div className="flex flex-col md:flex-row gap-6 mt-16 z-10 animate-in fade-in duration-1000 delay-700">
          <Link href="/catalog" className="bg-[var(--foreground)] text-[var(--background)] px-12 py-5 rounded-full text-sm font-black uppercase tracking-widest hover:bg-[var(--accent)] transition-all hover-scale">
            Весь каталог
          </Link>
          <Link href="/custom" className="glass px-12 py-5 rounded-full text-sm font-black uppercase tracking-widest hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all">
            Индивидуальные решения
          </Link>
        </div>
      </section>

      {/* ─── TRUST INDICATORS ─── */}
      <section className="w-full border-y border-white/5 bg-white/[0.02] py-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 flex flex-wrap justify-between items-center gap-8">
          {[
            { n: "15+", t: "Лет на рынке" },
            { n: "5000+", t: "Довольных клиентов" },
            { n: "100%", t: "Натуральные материалы" },
            { n: "24", t: "Месяца гарантии" }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center md:items-start">
              <span className="text-3xl font-black font-outfit text-white mb-1">{item.n}</span>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-30">{item.t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CATEGORIES SECTION ─── */}
      <section className="w-full max-w-7xl px-8 py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-outfit font-black uppercase mb-4">Направления</h2>
          <div className="w-20 h-1 bg-[var(--accent)] mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat: any) => (
            <Link href={`/${cat.slug}`} key={cat.slug} className="group relative glass rounded-[2.5rem] overflow-hidden h-[500px] cursor-pointer hover-scale">
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 opacity-70 group-hover:opacity-90 transition-opacity"></div>
              <div className="absolute bottom-12 left-10 z-20 transition-all group-hover:bottom-14">
                <span className="text-[var(--accent)] font-black text-[10px] uppercase tracking-widest mb-2 block opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">Collection</span>
                <h3 className="text-3xl font-outfit font-black text-white uppercase mb-1">{cat.name}</h3>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Перейти к коллекции →</p>
              </div>
              <Image 
                src={cat.img} 
                alt={cat.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover group-hover:scale-110 transition-transform duration-1000"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* ─── BEST SELLERS ─── */}
      <section className="w-full bg-[#0a0a0a] py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div>
              <h2 className="text-4xl md:text-6xl font-outfit font-black uppercase text-white mb-4">Бестселлеры</h2>
              <p className="text-white/40 max-w-md">Модели, которые чаще всего выбирают дизайнеры интерьеров.</p>
            </div>
            <Link href="/catalog" className="text-[var(--accent)] text-xs font-black uppercase tracking-widest hover:underline pb-2">
              Смотреть все новинки
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROMO BLOCK / SHOWROOM ─── */}
      <section className="w-full max-w-7xl px-8 py-32">
        <div className="glass rounded-[4rem] overflow-hidden flex flex-col lg:flex-row h-auto lg:h-[700px]">
          <div className="flex-1 relative h-[400px] lg:h-full">
            <Image 
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop"
              alt="Showroom"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[var(--accent)]/10"></div>
          </div>
          <div className="flex-1 p-12 md:p-24 flex flex-col justify-center">
            <span className="text-[var(--accent)] font-black uppercase tracking-[0.3em] text-xs mb-8 block">Our Factory</span>
            <h2 className="text-4xl md:text-6xl font-outfit font-black uppercase leading-tight mb-8">
              Качество, которое <br/> можно потрогать
            </h2>
            <p className="opacity-50 text-lg mb-10 leading-relaxed">
              Посетите наш шоурум в центре Москвы, чтобы лично убедиться в безупречном качестве материалов и удобстве наших моделей. Мы используем только ценные породы дерева и премиальный текстиль.
            </p>
            <div className="space-y-4 mb-12">
              {["Собственное производство", "Гарантия 24 месяца", "Примерка в интерьере"].map((text, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center">
                    <svg className="text-black" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span className="font-bold text-sm uppercase tracking-wider">{text}</span>
                </div>
              ))}
            </div>
            <Link href="/contacts" className="bg-[var(--foreground)] text-[var(--background)] px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest self-start hover:bg-[var(--accent)] transition-all">
              Записаться на визит
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CALL TO ACTION ─── */}
      <section className="w-full px-8 py-20 mb-20 flex justify-center">
        <div className="w-full max-w-7xl relative rounded-[4rem] overflow-hidden bg-[var(--foreground)] min-h-[500px] flex flex-col justify-center items-center text-center text-[var(--background)] p-8">
          <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent)] blur-[150px] opacity-20 -translate-y-1/2 translate-x-1/2 rounded-full"></div>
          
          <h2 className="text-4xl md:text-7xl font-outfit font-black uppercase mb-8 z-10 leading-tight tracking-tighter">
            Создайте проект <br /> своего пространства
          </h2>
          <p className="max-w-xl opacity-50 text-lg mb-12 z-10">
            Оставьте заявку на бесплатную консультацию нашего дизайнера <br className="hidden md:block"/> или подпишитесь на закрытые предложения.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl z-10 glass p-2 rounded-full border-white/10">
            <input 
              type="email" 
              placeholder="Ваш email" 
              className="flex-1 bg-transparent px-8 py-4 outline-none text-white font-medium"
            />
            <button className="bg-[var(--accent)] text-black px-12 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:scale-95 transition-all">Подписаться</button>
          </div>
        </div>
      </section>
    </div>
  );
}
