import { getProducts, getCategoryBySlug } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import AnimatedSection from "@/components/AnimatedSection";
import { translateSlug } from "@/lib/translations";
import Link from "next/link";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const { categorySlug, colorSlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  const colorName = translateSlug(colorSlug);
  const categoryName = category?.name || translateSlug(categorySlug);
  
  return {
    title: `Заказать ${colorName.toLowerCase()} ${categoryName.toLowerCase()} в Семее и Астане | Stoly-Sklad`,
    description: `Дизайнерские ${categoryName.toLowerCase()} в цвете ${colorName.toLowerCase()} в Семее и Астане. Премиальная эстетика для вашего интерьера с доставкой по Казахстану.`,
  };
}

export default async function ColorPage({ params }: { params: any }) {
  const { categorySlug, colorSlug } = await params;
  
  const category = await getCategoryBySlug(categorySlug);
  const products = await getProducts({ category_slug: categorySlug, color: colorSlug });
  
  const colorName = translateSlug(colorSlug);
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
          
          <h1 className="text-4xl md:text-7xl font-outfit font-black uppercase mb-6 tracking-tighter text-[var(--accent)]">
            {colorName} <span className="text-white">{categoryName.toLowerCase()}</span>
          </h1>
          <p className="opacity-40 max-w-2xl text-lg font-medium leading-relaxed">
            Потрясающие {categoryName.toLowerCase()} в {colorName.toLowerCase()} цвете. 
            Создайте атмосферу изысканности и стиля в вашем доме с нашей подборкой дизайнерской мебели.
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
          <p className="text-xl opacity-30 font-black uppercase tracking-widest">В данной категории товаров в таком цвете пока нет.</p>
          <Link href="/catalog" className="mt-10 inline-block bg-[var(--accent)] text-black px-12 py-5 rounded-full font-black uppercase tracking-widest text-xs hover:scale-95 transition-all">
            Вернуться в каталог
          </Link>
        </div>
      )}

      {/* SEO Content Block */}
      <AnimatedSection delay={0.5}>
        <div className="mt-40 glass rounded-[2rem] p-12 md:p-24 bg-gradient-to-br from-white/[0.02] to-transparent">
          <h2 className="text-2xl md:text-4xl font-outfit font-black uppercase mb-8">Интерьерные решения в {colorName.toLowerCase()} стиле</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 opacity-50 leading-relaxed italic">
            <p>
              Цвет — это мощный инструмент в дизайне интерьера. {colorName} цвет мебели Stoly-Sklad помогает расставить 
              нужные акценты и создать гармоничное пространство. Мы используем только высококачественные покрытия, 
              которые сохраняют свой первозданный оттенок на протяжении всего срока службы.
            </p>
            <p>
              Комбинируйте {categoryName.toLowerCase()} с другими элементами декора, чтобы подчеркнуть вашу индивидуальность. 
              Наши дизайнеры всегда готовы помочь вам с выбором идеального сочетания цветов для вашего дома или офиса.
            </p>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
