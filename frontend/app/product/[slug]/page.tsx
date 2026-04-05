import Image from "next/image";
import { getProductBySlug } from "@/lib/api";
import OrderForm from "@/components/OrderForm";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) return { title: "Товар не найден | LuxeFurniture" };

  return {
    title: `${product.name} — Купить за ${product.price.toLocaleString()} ₽ | LuxeFurniture`,
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

  const imageSrc = `/assets/${product.category_id === 1 ? 'chair' : product.category_id === 2 ? 'sofa' : 'table'}_category.png`;

  return (
    <div className="max-w-7xl mx-auto px-8 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        {/* Изображение товара */}
        <div className="relative h-[600px] w-full glass rounded-[3rem] overflow-hidden animate-in fade-in slide-in-from-left-10 duration-1000">
          <Image 
            src={imageSrc} 
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="object-cover"
          />
        </div>

        {/* Инфо и Форма */}
        <div className="flex flex-col justify-center animate-in fade-in slide-in-from-right-10 duration-1000">
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl font-outfit font-black uppercase mb-6 leading-none text-gradient">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 mb-8">
              <span className="text-4xl font-black">{product.price.toLocaleString()} ₽</span>
              <span className="bg-green-500/10 text-green-500 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">В наличии</span>
            </div>
            
            <div className="grid grid-cols-2 gap-8 py-8 border-y border-white/5">
              <div>
                <span className="block text-xs font-bold uppercase opacity-40 mb-1">Материал</span>
                <span className="text-lg font-medium">{product.material}</span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase opacity-40 mb-1">Цвет</span>
                <span className="text-lg font-medium">{product.color}</span>
              </div>
            </div>
          </div>

          <OrderForm productId={product.id} productName={product.name} />
        </div>
      </div>
    </div>
  );
}
