import { getProducts, getCategories } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ sort?: string }>;
};

// Динамические метаданные для SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;
  const categories = await getCategories();
  const category = categories.find((c: any) => c.slug === categorySlug);
  
  if (!category) return { title: "Категория не найдена | Stoly-Sklad" };

  return {
    title: `Купить премиальные ${category.name.toLowerCase()} | Stoly-Sklad`,
    description: category.description || `Коллекция дизайнерских ${category.name.toLowerCase()} по выгодным ценам. Доставка по всей России.`,
    alternates: {
        canonical: `/catalog/${category.slug}`
    }
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { categorySlug } = await params;
  const { sort } = await searchParams;
  
  // Получаем товары по slug категории с учетом сортировки
  const products = await getProducts({ category_slug: categorySlug, sort });
  const categories = await getCategories();
  const category = categories.find((c: any) => c.slug === categorySlug);

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h1 className="text-4xl font-bold font-outfit uppercase">Категория не найдена</h1>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-20 min-h-screen">
      {/* ─── Breadcrumbs ─── */}
      <div className="flex gap-2 text-[10px] font-black uppercase tracking-widest opacity-20 mb-8 items-center">
        <Link href="/" className="hover:text-white transition-colors">Главная</Link>
        <span>/</span>
        <Link href="/catalog" className="hover:text-white transition-colors">Каталог</Link>
        <span>/</span>
        <span className="text-[var(--accent)]">{category.name}</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
        <div className="max-w-2xl">
          <h1 className="text-6xl md:text-[5rem] font-outfit font-black uppercase mb-4 text-white leading-none">
            {category.name}
          </h1>
          <p className="opacity-40 text-lg leading-relaxed">
            {category.description || `Эксклюзивная коллекция для ценителей качества и стиля. Каждый предмет мебели в категории «${category.name.toLowerCase()}» проходит строгий контроль качества.`}
          </p>
        </div>
        
        {/* Statistics Band */}
        <div className="flex gap-10 bg-white/5 border border-white/5 p-8 rounded-[2rem]">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white">{products.length}</span>
            <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Моделей</span>
          </div>
          <div className="w-px h-full bg-white/10"></div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white">2Y</span>
            <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Гарантия</span>
          </div>
        </div>
      </div>

      {/* ─── Filter/Sort Bar ─── */}
      <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
        <div className="flex gap-4">
          <Link 
            href={`/catalog/${categorySlug}?sort=newest`}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              !sort || sort === 'newest' ? 'bg-[var(--accent)] text-black' : 'glass opacity-30 hover:opacity-100'
            }`}
          >
            По умолчанию
          </Link>
          <Link 
            href={`/catalog/${categorySlug}?sort=price_asc`}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              sort === 'price_asc' ? 'bg-[var(--accent)] text-black' : 'glass opacity-30 hover:opacity-100'
            }`}
          >
            Сначала дешевле
          </Link>
          <Link 
            href={`/catalog/${categorySlug}?sort=price_desc`}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              sort === 'price_desc' ? 'bg-[var(--accent)] text-black' : 'glass opacity-30 hover:opacity-100'
            }`}
          >
            Сначала дороже
          </Link>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest opacity-20 hidden md:block">Сортировка</span>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[30vh] glass rounded-3xl p-12">
          <p className="text-2xl opacity-40 font-bold uppercase">В этой категории пока нет товаров</p>
        </div>
      )}

      {/* ─── Programmatic SEO Internal Linking ─── */}
      <div className="mt-40 pt-20 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--accent)] mb-10">Коллекции по материалам</h3>
            <div className="flex flex-wrap gap-3">
              {["oak", "pine", "metal", "glass", "velvet", "leather", "mdf", "ash"].map(m => (
                <Link 
                  key={m} 
                  href={`/catalog/${categorySlug}/material/${m}`}
                  className="glass px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--accent)] hover:text-black transition-all"
                >
                  {category.name} из {m.toLowerCase() === "velvet" ? "велюра" : m.toLowerCase() === "leather" ? "кожи" : m.toLowerCase() === "oak" ? "дуба" : m}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--accent)] mb-10">Популярные оттенки</h3>
            <div className="flex flex-wrap gap-3">
              {["natural", "white", "black", "grey", "beige", "brown", "gold"].map(c => (
                <Link 
                  key={c} 
                  href={`/catalog/${categorySlug}/color/${c}`}
                  className="glass px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--accent)] hover:text-black transition-all"
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)} {category.name.toLowerCase()}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
