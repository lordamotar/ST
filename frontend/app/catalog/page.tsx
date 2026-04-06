import { getCategories, getProducts } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export default async function CatalogPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ sort?: string }> 
}) {
  const { sort } = await searchParams;
  const categories = await getCategories();
  const allProducts = await getProducts({ sort });

  return (
    <div className="max-w-7xl mx-auto px-8 py-20 min-h-screen">
      <div className="flex flex-col mb-16">
        <h1 className="text-6xl md:text-[5rem] font-outfit font-black uppercase mb-4 text-white leading-none">
          Весь каталог
        </h1>
        <p className="opacity-40 text-lg max-w-2xl">
          Широкий ассортимент обеденных групп, столов-трансформеров и дизайнерских стульев напрямую от производителей.
        </p>
      </div>

      {/* ─── Categories Quick Links ─── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div className="flex flex-wrap gap-4">
          <Link href="/catalog" className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${!sort || sort === 'newest' ? 'bg-[var(--accent)] text-black' : 'glass opacity-30 hover:opacity-100'}`}>Все</Link>
          {categories.map((cat: any) => (
            <Link 
              key={cat.id} 
              href={`/catalog/${cat.slug}`} 
              className="glass px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[var(--accent)] hover:text-black transition-all"
            >
              {cat.name}
            </Link>
          ))}
        </div>
        
        <div className="flex gap-4 border-l border-white/5 pl-8">
          <Link 
            href="/catalog?sort=price_asc"
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              sort === 'price_asc' ? 'bg-[var(--accent)] text-black' : 'glass opacity-30 hover:opacity-100'
            }`}
          >
            Дешевле
          </Link>
          <Link 
            href="/catalog?sort=price_desc"
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              sort === 'price_desc' ? 'bg-[var(--accent)] text-black' : 'glass opacity-30 hover:opacity-100'
            }`}
          >
            Дороже
          </Link>
        </div>
      </div>

      {/* ─── All Products Grid ─── */}
      {allProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {allProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 glass rounded-[3rem] text-center">
            <p className="opacity-30 font-black uppercase text-2xl tracking-widest">Каталог пуст</p>
        </div>
      )}
    </div>
  );
}
