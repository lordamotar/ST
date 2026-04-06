import Image from "next/image";
import Link from "next/link";

const BACKEND_URL = "http://127.0.0.1:8000";

export default function ProductCard({ product }: { product: any }) {
  // Если есть загруженное фото — используем его, иначе fallback по категории
  const hasUploadedImage = !!product.image_url;
  const imageSrc = hasUploadedImage
    ? (product.image_url.startsWith("http") ? product.image_url : `${BACKEND_URL}${product.image_url}`)
    : `/assets/${product.category_id === 1 ? 'chair' : product.category_id === 2 ? 'sofa' : 'table'}_category.png`;

  return (
    <Link href={`/product/${product.slug}`} className="group relative glass rounded-3xl overflow-hidden cursor-pointer hover-scale flex flex-col h-full">
      <div className="relative h-64 w-full overflow-hidden">
        {hasUploadedImage ? (
          // Внешнее изображение с бэкенда — используем <img> напрямую
          <img 
            src={imageSrc} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          // Локальное изображение — используем Next.js Image
          <Image 
            src={imageSrc} 
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
        )}
        {product.material && (
          <div className="absolute top-4 right-4 bg-[var(--background)] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {product.material}
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col justify-between flex-grow">
        <div>
          <h3 className="text-xl font-outfit font-black uppercase mb-4 truncate">{product.name}</h3>
          <div className="space-y-1.5 mb-4">
            {[
              { key: "dimensions", label: "Размеры" },
              { key: "legs_material", label: "Материал опор" },
              { key: "tabletop_material", label: "Столешница" },
              { key: "tabletop_thickness", label: "Толщ. столешницы" },
              { key: "floor_clearance", label: "От пола" },
              { key: "max_load", label: "Макс. нагрузка" },
              { key: "legs_adjustment", label: "Рег. опор" },
              { key: "tabletop_color", label: "Цвет столешницы" },
              { key: "footings", label: "Подпятники" },
              { key: "warranty", label: "Гарантия" },
              { key: "delivery_format", label: "Доставка" },
              { key: "supports", label: "Опоры" },
              { key: "country", label: "Страна" },
              { key: "series", label: "Серия" },
            ].map(({ key, label }) => {
              const val = (product as any)[key];
              if (!val) return null;
              return (
                <div key={key} className="flex justify-between items-end border-b border-white/5 pb-1 gap-2">
                  <span className="opacity-40 text-[10px] uppercase font-bold shrink-0">{label}</span>
                  <span className="text-xs font-medium text-right truncate" title={val}>{val}</span>
                </div>
              );
            })}
            
            {/* Отрисовка динамических (оставшихся в JSON) характеристик */}
            {product.characteristics && Object.entries(product.characteristics).slice(0, 5).map(([key, val]) => (
              <div key={key} className="flex justify-between items-end border-b border-white/5 pb-1 gap-2">
                <span className="opacity-40 text-[10px] uppercase font-bold shrink-0">{key}</span>
                <span className="text-xs font-medium text-right truncate" title={String(val)}>{String(val)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-2xl font-black text-gradient">{product.price.toLocaleString()} ₽</span>
          <div className="bg-[var(--foreground)] text-[var(--background)] p-3 rounded-full group-hover:bg-[var(--accent)] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
