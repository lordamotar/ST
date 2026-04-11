"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const BACKEND_URL = "http://127.0.0.1:8000";

export default function ProductCard({ product, hideDetails = false }: { product: any, hideDetails?: boolean }) {
  // Если есть загруженное фото — используем его, иначе fallback по категории
  const hasUploadedImage = !!product.image_url;
  const imageSrc = hasUploadedImage
    ? (product.image_url.startsWith("http") ? product.image_url : `${BACKEND_URL}${product.image_url}`)
    : `/assets/${product.category_id === 1 ? 'chair' : product.category_id === 2 ? 'sofa' : 'table'}_category.png`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Link 
        href={`/product/${product.slug}`} 
        className={`group relative glass rounded-[2.5rem] overflow-hidden cursor-pointer hover-scale flex flex-col h-full bg-white/[0.01] border-white/5 ${hideDetails ? 'min-h-[400px] md:min-h-[480px]' : 'min-h-[520px] md:min-h-[580px]'}`}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-white/[0.02]">
          {hasUploadedImage ? (
            <img 
              src={imageSrc} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-all duration-[1.5s] ease-out"
            />
          ) : (
            <Image 
              src={imageSrc} 
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-110 transition-all duration-[1.5s] ease-out"
            />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          {/* Badges */}
          <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
            {product.max_load && parseInt(String(product.max_load)) > 200 && (
              <div className="bg-white/10 backdrop-blur-xl border border-white/10 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] text-white">Heavy Duty</div>
            )}
            {product.warranty && product.warranty.includes("24") && (
              <div className="bg-[var(--accent)] px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] text-black shadow-lg shadow-[var(--accent)]/20">2Y Warranty</div>
            )}
          </div>

          {product.availability_status === 'on_order' && (
            <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] text-white/80 border border-white/5">
              Под заказ
            </div>
          )}
        </div>

        <div className="p-8 flex flex-col justify-between flex-grow">
          <div className="flex flex-col h-full">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-20 block mb-3">Series: {product.series || "Essential"}</span>
            <div className="min-h-[64px] mb-6 flex items-start">
              <h3 className="text-xl font-outfit font-black uppercase group-hover:text-[var(--accent)] transition-colors leading-tight tracking-tight line-clamp-2">
                {product.name}
              </h3>
            </div>
            
            {!hideDetails && (
              <div className="space-y-3 mb-10 flex-grow">
                {[
                  { key: "dimensions", label: "Размеры" },
                  { key: "material", label: "Материал" },
                ].map(({ key, label }) => {
                  const val = (product as any)[key];
                  if (!val) return null;
                  return (
                    <div key={key} className="flex justify-between items-center text-[10px] font-medium border-b border-white/[0.03] pb-3">
                      <span className="opacity-20 uppercase tracking-[0.2em] font-black text-[8px]">{label}</span>
                      <span className="text-white/50 text-right truncate pl-4 font-bold" title={val}>{val}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-white/[0.03]">
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-20 mb-1">Price</span>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-[var(--accent)] tracking-tighter whitespace-nowrap">{product.new_price?.toLocaleString()} ₸</span>
                {product.old_price && (
                  <span className="text-[10px] font-bold opacity-20 line-through decoration-[var(--accent)]/30">{product.old_price?.toLocaleString()} ₸</span>
                )}
              </div>
            </div>
            
            <div className="group/btn relative">
              <div className="absolute inset-0 bg-[var(--accent)] blur-xl opacity-0 group-hover/btn:opacity-20 transition-opacity"></div>
              <div className="relative w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)] group-hover:text-black transition-all duration-700 shadow-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
