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
  
  if (!product) return { title: "Товар не найден | Stoly-Sklad" };

  return {
    title: `${product.name} — Купить за ${product.price.toLocaleString()} ₽ | Stoly-Sklad`,
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
          <div className="relative h-[600px] w-full glass rounded-[3rem] overflow-hidden animate-in fade-in slide-in-from-left-10 duration-1000">
            {hasUploadedImage ? (
              <img 
                src={imageSrc} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Image 
                src={imageSrc} 
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                className="object-cover"
              />
            )}
          </div>

          {/* Характеристики (Спецификации) перенесены под фото */}
          {((product.characteristics && Object.keys(product.characteristics).length > 0) || product.material || product.color) && (
            <div className="glass rounded-[3rem] p-10 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
              <h3 className="text-sm font-bold uppercase tracking-widest opacity-40 mb-6 flex items-center gap-4">
                Спецификации
                <div className="h-px bg-white/10 flex-1"></div>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {[
                  { key: "material", label: "Материал" },
                  { key: "color", label: "Цвет" },
                  { key: "dimensions", label: "Размеры" },
                  { key: "legs_material", label: "Материал ножек (опор)" },
                  { key: "tabletop_material", label: "Материал столешницы" },
                  { key: "tabletop_thickness", label: "Толщина столешницы" },
                  { key: "floor_clearance", label: "Просвет от пола" },
                  { key: "max_load", label: "Максимальная нагрузка" },
                  { key: "legs_adjustment", label: "Регулировка опор" },
                  { key: "tabletop_color", label: "Цвет столешницы" },
                  { key: "footings", label: "Подпятники" },
                  { key: "warranty", label: "Гарантия" },
                  { key: "delivery_format", label: "Вариант доставки" },
                  { key: "supports", label: "Опоры" },
                  { key: "country", label: "Страна" },
                  { key: "series", label: "Серия" },
                ].map(({ key, label }) => {
                  const val = (product as any)[key];
                  if (!val) return null;
                  return (
                    <div key={key} className="flex justify-between items-end border-b border-white/5 pb-2">
                      <span className="opacity-50 text-sm shrink-0">{label}</span>
                      <span className="font-bold text-sm text-right break-words max-w-[60%]">{val}</span>
                    </div>
                  );
                })}
                {Object.entries(product.characteristics || {}).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-end border-b border-white/5 pb-2 gap-4">
                    <span className="opacity-50 text-sm shrink-0">{key}</span>
                    <span className="font-bold text-sm text-right break-words max-w-[60%]">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Инфо и Форма */}
        <div className="flex flex-col justify-center animate-in fade-in slide-in-from-right-10 duration-1000">
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl font-outfit font-black uppercase mb-6 leading-none text-gradient">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 mb-8">
              <span className="text-4xl font-black">{product.price.toLocaleString()} ₽</span>
              {(!product.availability_status || product.availability_status === 'in_stock') && (
                <span className="bg-emerald-500/15 text-emerald-500 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider border border-emerald-500/20">В наличии</span>
              )}
              {product.availability_status === 'on_order' && (
                <span className="bg-amber-500/15 text-amber-500 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider border border-amber-500/20">Под заказ</span>
              )}
              {product.availability_status === 'out_of_stock' && (
                <span className="bg-red-500/15 text-red-500 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider border border-red-500/20">Нет в наличии</span>
              )}
            </div>
            
            <p className="text-xl opacity-80 leading-relaxed mb-10 text-pretty">
              {product.description || "Описание временно отсутствует. Свяжитесь с нами для уточнения деталей."}
            </p>


          </div>

          <OrderForm productId={product.id} productName={product.name} />
        </div>
      </div>
    </div>
  );
}
