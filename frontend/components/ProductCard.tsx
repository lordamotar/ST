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
    <Link href={`/product/${product.slug}`} className="group relative glass rounded-[2rem] overflow-hidden cursor-pointer hover-scale flex flex-col h-full bg-white/[0.02] border-white/5">
      <div className="relative h-72 w-full overflow-hidden bg-white/[0.03]">
        {hasUploadedImage ? (
          <img 
            src={imageSrc} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 ease-out"
          />
        ) : (
          <Image 
            src={imageSrc} 
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-110 transition-all duration-1000 ease-out"
          />
        )}
        
        {/* Badges */}
        <div className="absolute top-5 left-5 flex flex-col gap-2 z-10">
          {product.max_load && parseInt(String(product.max_load)) > 200 && (
            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-white">Heavy Duty</div>
          )}
          {product.warranty && product.warranty.includes("24") && (
            <div className="bg-[var(--accent)]/80 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-black">2Y Warranty</div>
          )}
        </div>

        {product.material && (
          <div className="absolute bottom-5 right-5 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white/60">
            {product.material}
          </div>
        )}
      </div>

      <div className="p-8 flex flex-col justify-between flex-grow">
        <div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">Series: {product.series || "Essential"}</span>
          </div>
          <h3 className="text-xl font-outfit font-black uppercase mb-6 group-hover:text-[var(--accent)] transition-colors leading-tight">{product.name}</h3>
          
          <div className="grid grid-cols-1 gap-2 mb-8">
            {[
              { key: "dimensions", label: "Размеры" },
              { key: "tabletop_material", label: "Материал" },
            ].map(({ key, label }) => {
              const val = (product as any)[key];
              if (!val) return null;
              return (
                <div key={key} className="flex justify-between items-center text-[11px] font-medium border-b border-white/5 pb-2">
                  <span className="opacity-20 uppercase tracking-widest font-black shrink-0">{label}</span>
                  <span className="text-white/60 text-right truncate pl-4" title={val}>{val}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between items-center mt-auto pt-6 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest opacity-20 mb-1">Price</span>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-black text-[var(--accent)]">{product.new_price?.toLocaleString()} ₸</span>
              {product.old_price && (
                <span className="text-sm font-bold opacity-30 line-through decoration-white/50">{product.old_price?.toLocaleString()} ₸</span>
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)] group-hover:text-black transition-all duration-500 hover-glow">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
