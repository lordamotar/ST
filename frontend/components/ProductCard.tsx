import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product }: { product: any }) {
  // Плейсхолдер для изображения товара
  const imageSrc = `/assets/${product.category_id === 1 ? 'chair' : product.category_id === 2 ? 'sofa' : 'table'}_category.png`;

  return (
    <Link href={`/product/${product.slug}`} className="group relative glass rounded-3xl overflow-hidden cursor-pointer hover-scale flex flex-col h-full">
      <div className="relative h-64 w-full overflow-hidden">
        <Image 
          src={imageSrc} 
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 right-4 bg-[var(--background)] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          {product.material}
        </div>
      </div>
      <div className="p-6 flex flex-col justify-between flex-grow">
        <div>
          <h3 className="text-xl font-outfit font-black uppercase mb-2 truncate">{product.name}</h3>
          <p className="text-sm opacity-60 line-clamp-2 mb-4">Премиальное качество и современный дизайн в каждой линии.</p>
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
