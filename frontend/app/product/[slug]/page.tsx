import Image from "next/image";
import { getProductBySlug } from "@/lib/api";
import OrderForm from "@/components/OrderForm";
import AnimatedSection from "@/components/AnimatedSection";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) return { title: "Товар не найден | Stoly-Sklad" };

  return {
    title: `${product.name} — Купить за ${product.new_price.toLocaleString()} ₸ | Stoly-Sklad`,
    description: `Закажите ${product.name.toLowerCase()} из материала ${product.material}. Премиальное качество, индивидуальный подход.`,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h1 className="text-4xl font-bold font-outfit uppercase tracking-tighter">Товар не найден</h1>
      </div>
    );
  }

  const BACKEND_URL = "http://127.0.0.1:8000";
  const hasUploadedImage = !!product.image_url;
  const imageSrc = hasUploadedImage
    ? (product.image_url.startsWith("http") ? product.image_url : `${BACKEND_URL}${product.image_url}`)
    : `/assets/${product.category_id === 1 ? 'chair' : product.category_id === 2 ? 'sofa' : 'table'}_category.png`;

  return (
    <div className="max-w-7xl mx-auto px-8 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        {/* Левая колонка: Изображение + Спецификации */}
        <div className="flex flex-col gap-10">
          <AnimatedSection direction="left">
            <div className="relative h-[700px] w-full glass rounded-[4rem] overflow-hidden group">
              {hasUploadedImage ? (
                <img 
                  src={imageSrc} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s] ease-out"
                />
              ) : (
                <Image 
                  src={imageSrc} 
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-[2s] ease-out"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            </div>
          </AnimatedSection>

          {/* Характеристики (Спецификации) */}
          {((product.characteristics && Object.keys(product.characteristics).length > 0) || product.material || product.color) && (
            <AnimatedSection delay={0.3}>
              <div className="glass rounded-[3rem] p-12 bg-white/[0.01]">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent)] mb-10 flex items-center gap-6">
                  Спецификации
                  <div className="h-px bg-white/5 flex-1"></div>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  {[
                    { key: "material", label: "Материал" },
                    { key: "color", label: "Цвет" },
                    { key: "dimensions", label: "Размеры" },
                    { key: "legs_material", label: "Материал ножек" },
                    { key: "tabletop_material", label: "Столешница" },
                    { key: "warranty", label: "Гарантия" },
                    { key: "country", label: "Страна" },
                    { key: "series", label: "Серия" },
                  ].map(({ key, label }) => {
                    const val = (product as any)[key];
                    if (!val) return null;
                    return (
                      <div key={key} className="flex justify-between items-end border-b border-white/[0.03] pb-3">
                        <span className="opacity-30 text-[10px] uppercase font-black tracking-widest shrink-0">{label}</span>
                        <span className="font-bold text-sm text-right break-words max-w-[60%]">{val}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </AnimatedSection>
          )}
        </div>

        {/* Инфо и Форма */}
        <div className="flex flex-col justify-center">
          <AnimatedSection direction="right">
            <div className="mb-16">
              <span className="text-[var(--accent)] font-black uppercase tracking-[0.5em] text-[10px] mb-8 block">Exclusive Design</span>
              <h1 className="text-6xl md:text-8xl font-outfit font-black uppercase mb-10 leading-[0.9] tracking-tighter text-gradient">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-10 mb-12 flex-wrap">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-20 mb-2">Price</span>
                  <div className="flex items-baseline gap-6">
                    <span className="text-5xl md:text-7xl font-black text-[var(--accent)] tracking-tighter">{product.new_price.toLocaleString()} ₸</span>
                    {product.old_price && (
                      <span className="text-2xl font-bold opacity-20 line-through decoration-[var(--accent)]/30">{product.old_price.toLocaleString()} ₸</span>
                    )}
                  </div>
                </div>
                
                <div className="h-16 w-px bg-white/5"></div>
                
                <div className="flex gap-3">
                  {(!product.availability_status || product.availability_status === 'in_stock') && (
                    <span className="bg-emerald-500/10 text-emerald-500 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border border-emerald-500/20">В наличии</span>
                  )}
                  {product.availability_status === 'on_order' && (
                    <span className="bg-amber-500/10 text-amber-500 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border border-amber-500/20">Под заказ</span>
                  )}
                </div>
              </div>
              
              <div className="p-8 glass rounded-[2.5rem] bg-white/[0.01] border-white/5 mb-16">
                <p className="text-lg opacity-50 leading-relaxed font-medium">
                  {product.description || "Описание временно отсутствует. Свяжитесь с нами для уточнения деталей и получения полной консультации."}
                </p>
              </div>

              <div className="flex gap-16 mb-16">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-20">Сборка</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-white/80">Бесплатно</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-20">Доставка</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-white/80">От 2 дней</span>
                </div>
              </div>

              <OrderForm productId={product.id} productName={product.name} />
            </div>
          </AnimatedSection>
        </div>
      </div>
      {/* Product Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": product.image_url ? [`http://localhost:8000${product.image_url}`] : [],
            "description": product.description,
            "sku": `SS-${product.id}`,
            "brand": {
              "@type": "Brand",
              "name": "Stoly-Sklad"
            },
            "offers": {
              "@type": "Offer",
              "url": `http://localhost:3000/product/${product.slug}`,
              "priceCurrency": "KZT",
              "price": product.new_price,
              "availability": "https://schema.org/InStock"
            }
          })
        }}
      />
    </div>
  );
}
