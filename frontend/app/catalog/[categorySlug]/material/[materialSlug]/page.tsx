import { getProducts, getCategoryBySlug } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import AnimatedSection from "@/components/AnimatedSection";
import { translateSlug } from "@/lib/translations";
import Link from "next/link";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const { categorySlug, materialSlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  const materialName = translateSlug(materialSlug);
  const categoryName = category?.name || translateSlug(categorySlug);
  
  return {
    title: `Купить ${categoryName.toLowerCase()} из материала: ${materialName} | Stoly-Sklad`,
    description: `Большой выбор дизайнерских ${categoryName.toLowerCase()} из материала ${materialName.toLowerCase()}. Премиальное качество, доставка по всей России.`,
  };
}

export default async function MaterialPage({ params }: { params: any }) {
  const { categorySlug, materialSlug } = await params;
  
  const category = await getCategoryBySlug(categorySlug);
  const products = await getProducts({ category_slug: categorySlug, material: materialSlug });
  
  const materialName = translateSlug(materialSlug);
  const categoryName = category?.name || translateSlug(categorySlug);

  return (
    <div className="max-w-7xl mx-auto px-8 py-20">
      <AnimatedSection>
        <div className="mb-16">
          <nav className="flex gap-2 text-[10px] font-black uppercase tracking-widest opacity-20 mb-8 items-center">
            <Link href="/" className="hover:text-[var(--accent)] hover:opacity-100 transition-all">Главная</Link>
            <span>/</span>
            <Link href="/catalog" className="hover:text-[var(--accent)] hover:opacity-100 transition-all">Каталог</Link>
            <span>/</span>
            <Link href={`/${categorySlug}`} className="hover:text-[var(--accent)] hover:opacity-100 transition-all">{categoryName}</Link>
          </nav>
          
          <h1 className="text-4xl md:text-7xl font-outfit font-black uppercase mb-6 tracking-tighter">
            {categoryName} <span className="text-[var(--accent)]">из материала: {materialName}</span>
          </h1>
          <p className="opacity-40 max-w-2xl text-lg font-medium leading-relaxed">
            Эксклюзивная подборка {categoryName.toLowerCase()}, изготовленных из {materialName.toLowerCase()}. 
            Мы гарантируем долговечность и премиальный внешний вид каждого изделия.
          </p>
        </div>
      </AnimatedSection>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {products.map((p: any, i: number) => (
            <AnimatedSection key={p.id} delay={i * 0.05}>
              <ProductCard product={p} />
            </AnimatedSection>
          ))}
        </div>
      ) : (
        <div className="glass rounded-[3rem] p-20 text-center">
          <p className="text-xl opacity-30 font-black uppercase tracking-widest">В данной категории товаров из этого материала пока нет.</p>
          <Link href="/catalog" className="mt-10 inline-block bg-[var(--accent)] text-black px-12 py-5 rounded-full font-black uppercase tracking-widest text-xs hover:scale-95 transition-all">
            Вернуться в каталог
          </Link>
        </div>
      )}

      {/* SEO Content Block */}
      <AnimatedSection delay={0.5}>
        <div className="mt-40 glass rounded-[4rem] p-12 md:p-24">
          <h2 className="text-2xl md:text-4xl font-outfit font-black uppercase mb-8">Почему выбирают {categoryName.toLowerCase()} из {materialName.toLowerCase()}?</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 opacity-50 leading-relaxed">
            <p>
              {materialName} — это материал, который ценится за свою надежность и эстетику. В сочетании с мастерством наших мебельщиков, 
              {categoryName.toLowerCase()} становятся настоящим украшением любого интерьера. Мы уделяем внимание каждой детали, 
              чтобы вы могли наслаждаться качеством долгие годы.
            </p>
            <p>
              Выбирая {categoryName.toLowerCase()} в Stoly-Sklad, вы получаете не просто мебель, а продуманное решение для вашего комфорта. 
              Все изделия проходят строгий контроль качества и соответствуют международным стандартам экологичности и безопасности.
            </p>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
