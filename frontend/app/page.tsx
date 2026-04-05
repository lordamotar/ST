import Image from "next/image";
import Link from "next/link";
import { getCategories } from "@/lib/api";
import SearchInput from "@/components/SearchInput";

export default async function Home() {
  // Получаем реальные категории из бэкенда
  const dbCategories = await getCategories();
  
  // Привязка изображений
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
      {/* HERO SECTION */}
      <section className="relative w-full h-[90vh] flex flex-col justify-center items-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_-20%,_var(--accent)_0%,_transparent_50%)] opacity-20"></div>
        
        <h1 className="text-6xl md:text-8xl font-outfit uppercase font-black tracking-tight leading-none mb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          Мебель, которая <br />
          <span className="text-gradient">создает уют</span>
        </h1>
        <p className="text-lg md:text-2xl max-w-2xl opacity-80 mb-12 font-medium animate-in fade-in duration-1000 delay-300">
          Переосмыслите свое пространство с коллекцией 2026 года. 
          Минимализм, экологичные материалы и вневременной дизайн.
        </p>
        
        <SearchInput />

        <div className="flex flex-col md:flex-row gap-6 mt-12 animate-in fade-in duration-1000 delay-500">
          <Link href="/chairs" className="bg-[var(--foreground)] text-[var(--background)] px-10 py-5 rounded-full text-xl font-bold hover:bg-[var(--accent)] transition-all transform hover:scale-105 flex items-center">
            Смотреть каталог
          </Link>
          <button className="glass px-10 py-5 rounded-full text-xl font-bold hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all">
            О нас
          </button>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="w-full max-w-7xl px-8 py-24">
        <div className="flex justify-between items-end mb-16">
          <h2 className="text-4xl font-outfit font-black uppercase">Категории</h2>
          <span className="text-[var(--accent)] font-bold cursor-pointer hover:underline">Смотреть всё</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {categories.map((cat: any) => (
            <Link href={`/${cat.slug}`} key={cat.slug} className="group relative glass rounded-3xl overflow-hidden h-[450px] cursor-pointer hover-scale">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10"></div>
              <div className="absolute bottom-10 left-8 z-20">
                <h3 className="text-2xl font-outfit font-black text-white uppercase mb-1">{cat.name}</h3>
                <p className="text-white/60 text-sm font-medium">Смотреть товары</p>
              </div>
              <Image 
                src={cat.img} 
                alt={cat.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                priority
                className="object-cover group-hover:scale-110 transition-transform duration-700 pointer-events-none"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="w-full h-[600px] px-8 py-20 flex justify-center">
        <div className="w-full max-w-7xl relative rounded-[3rem] overflow-hidden bg-[var(--foreground)] flex flex-col justify-center items-center text-center text-[var(--background)]">
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
          <h2 className="text-5xl md:text-7xl font-outfit font-black uppercase mb-8 z-10 leading-tight">
            Готовы обновить <br /> интерьер?
          </h2>
          <p className="max-w-xl opacity-60 text-lg mb-12 z-10">
            Подпишитесь и получите скидку 10% на первый заказ.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md z-10">
            <input 
              type="email" 
              placeholder="Ваш email" 
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-4 outline-none focus:border-[var(--accent)] transition-all"
            />
            <button className="bg-[var(--accent)] px-8 py-4 rounded-full font-black uppercase tracking-wider">Подписаться</button>
          </div>
        </div>
      </section>
    </div>
  );
}
