import { getProducts, getCategories } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

type Props = {
  params: Promise<{ citySlug: string }>;
};

const CITIES: { [key: string]: string } = {
  semey: "Семей",
  almaty: "Алматы",
  astana: "Астана",
  "ust-kamenogorsk": "Усть-Каменогорск"
};

export default async function CityLandingPage({ params }: Props) {
  const { citySlug } = await params;
  const cityName = CITIES[citySlug] || citySlug;
  
  const allProducts = await getProducts();
  const categories = await getCategories();

  return (
    <div className="max-w-7xl mx-auto px-8 py-20 min-h-screen">
      {/* ─── Hero for City ─── */}
      <div className="flex flex-col mb-20">
        <span className="text-[var(--accent)] font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Мебель от производителя</span>
        <h1 className="text-6xl md:text-[6rem] font-outfit font-black uppercase mb-8 text-white leading-tight">
          Дизайнерская мебель <br/> 
          <span className="text-gradient">в {cityName === "Семей" ? "Семее" : cityName}</span>
        </h1>
        <p className="opacity-40 text-xl max-w-3xl leading-relaxed">
          Stoly-Sklad {cityName === "Семей" ? "расположен в Семее" : `осуществляет бережную доставку мебели в ${cityName}`}. 
          Покупайте столы-трансформеры, обеденные группы и люксовые стулья по складским ценам. Прямые поставки из Гуанчжоу без посредников.
        </p>
      </div>

      {/* ─── Category Selection ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
        {categories.slice(0, 3).map((cat: any) => (
          <Link key={cat.id} href={`/catalog/${cat.slug}`} className="glass p-10 rounded-[2.5rem] hover-scale group relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all font-outfit font-black text-6xl uppercase tracking-tighter -rotate-12 translate-x-4">
                {cat.name}
             </div>
             <h3 className="text-3xl font-black uppercase mb-4 relative z-10">{cat.name}</h3>
             <p className="text-sm opacity-40 mb-6 relative z-10">Смотреть все модели в {cityName === "Семей" ? "наличии на складе" : "каталоге с доставкой"}</p>
             <span className="text-[var(--accent)] text-xs font-black uppercase tracking-widest relative z-10">Перейти →</span>
          </Link>
        ))}
      </div>

      {/* ─── Localized Products Grid ─── */}
      <div className="flex justify-between items-end mb-16">
        <h2 className="text-4xl font-black uppercase text-white">Популярное в {cityName === "Семей" ? "Семее" : cityName}</h2>
        <Link href="/catalog" className="text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all">Смотреть весь склад</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
        {allProducts.slice(0, 8).map((p: any) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* ─── Trust Block ─── */}
      <div className="glass p-16 rounded-[4rem] flex flex-col items-center text-center">
         <h2 className="text-4xl font-black uppercase mb-8">Почему нас выбирают в {cityName}</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-5xl">
            <div>
               <span className="text-[var(--accent)] text-5xl font-black mb-4 block">01</span>
               <h4 className="font-black uppercase mb-2">Складские цены</h4>
               <p className="text-sm opacity-40 uppercase tracking-widest leading-loose">Работаем напрямую с фабриками Китая без наценок ТЦ.</p>
            </div>
            <div>
               <span className="text-[var(--accent)] text-5xl font-black mb-4 block">02</span>
               <h4 className="font-black uppercase mb-2">Наличие</h4>
               <p className="text-sm opacity-40 uppercase tracking-widest leading-loose">Более 1000 единиц мебели на основном складе в Семее.</p>
            </div>
            <div>
               <span className="text-[var(--accent)] text-5xl font-black mb-4 block">03</span>
               <h4 className="font-black uppercase mb-2">Бережная доставка</h4>
               <p className="text-sm opacity-40 uppercase tracking-widest leading-loose">Собственная логистика по всему Казахстану в сжатые сроки.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
