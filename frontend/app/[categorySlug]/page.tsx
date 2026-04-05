import { getProducts, getCategories } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ categorySlug: string }>;
};

// Динамические метаданные для SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;
  const categories = await getCategories();
  const category = categories.find((c: any) => c.slug === categorySlug);
  
  if (!category) return { title: "Категория не найдена | LuxeFurniture" };

  return {
    title: `Купить премиальные ${category.name.toLowerCase()} | LuxeFurniture`,
    description: category.description || `Коллекция дизайнерских ${category.name.toLowerCase()} по выгодным ценам. Доставка по всей России.`,
    alternates: {
        canonical: `/${category.slug}`
    }
  };
}

export default async function CategoryPage({ params }: Props) {
  const { categorySlug } = await params;
  
  // Получаем товары по slug категории
  const products = await getProducts({ category_slug: categorySlug });
  const categories = await getCategories();
  const category = categories.find((c: any) => c.slug === categorySlug);

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h1 className="text-4xl font-bold font-outfit uppercase">Категория не найдена</h1>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-20">
      <div className="mb-16">
        <h1 className="text-5xl md:text-7xl font-outfit font-black uppercase mb-4 text-gradient">
          {category.name}
        </h1>
        <p className="max-w-2xl opacity-60 text-lg">
          {category.description || `Эксклюзивная коллекция для ценителей качества и стиля.`}
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[30vh] glass rounded-3xl p-12">
          <p className="text-2xl opacity-40 font-bold uppercase">В этой категории пока нет товаров</p>
        </div>
      )}
    </div>
  );
}
