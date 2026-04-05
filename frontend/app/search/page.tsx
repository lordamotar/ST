import { getProducts } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";

  // Получаем товары по поисковому запросу
  const products = query ? await getProducts({ q: query }) : [];
  
  // Лог для отладки в терминале npm
  console.log(`[SEARCH] Query: "${query}", Count: ${products.length}`);

  return (
    <div className="w-full max-w-7xl mx-auto px-8 py-24 min-h-[70vh]">
      <div className="flex flex-col mb-16">
        <Link href="/" className="text-[var(--accent)] font-bold mb-4 hover:underline">
          ← Вернуться на главную
        </Link>
        <h1 className="text-5xl md:text-7xl font-outfit font-black uppercase tracking-tight">
          Результаты поиска
        </h1>
        <p className="text-xl opacity-60 mt-4 font-medium">
          {query ? `По запросу «${query}» найдено ${products.length} товаров` : "Введите запрос для поиска"}
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 glass rounded-[3rem] text-center">
          <div className="text-6xl mb-6">🏜️</div>
          <h2 className="text-3xl font-bold mb-4 uppercase">Ничего не найдено</h2>
          <p className="max-w-md opacity-60">
            Попробуйте изменить запрос или поискать в категориях.
          </p>
          <Link href="/" className="mt-10 bg-[var(--foreground)] text-[var(--background)] px-8 py-4 rounded-full font-bold hover:bg-[var(--accent)] transition-all">
            Посмотреть все товары
          </Link>
        </div>
      )}
    </div>
  );
}
