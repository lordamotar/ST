import { getProducts, getCategories } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ categorySlug: string; material: string }>;
};

const materialNames: { [key: string]: string } = {
  oak: "Дубовые",
  pine: "Сосновые",
  marble: "Мраморные",
  velvet: "Бархатные",
  leather: "Кожаные",
  walnut: "Ореховые",
  fabric: "Тканевые",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug, material } = await params;
  const categories = await getCategories();
  const category = categories.find((c: any) => c.slug === categorySlug);
  
  if (!category) return { title: "Страница не найдена | LuxeFurniture" };

  const materialName = materialNames[material] || material;

  return {
    title: `${materialName} ${category.name.toLowerCase()} купить | LuxeFurniture`,
    description: `Эксклюзивная подборка: ${materialName.toLowerCase()} ${category.name.toLowerCase()} премиального качества. Гарантия и доставка.`,
    alternates: {
        canonical: `/${category.slug}/${material}`
    }
  };
}

export default async function FilteredPage({ params }: Props) {
  const { categorySlug, material } = await params;
  
  const products = await getProducts({ category_slug: categorySlug, material: material });
  const categories = await getCategories();
  const category = categories.find((c: any) => c.slug === categorySlug);

  const materialName = materialNames[material] || material;

  if (!category) return <h1>Ничего не найдено</h1>;

  return (
    <div className="max-w-7xl mx-auto px-8 py-20 text-center">
      <div className="mb-16">
        <h1 className="text-4xl md:text-6xl font-outfit font-black uppercase mb-4">
          {materialName} <span className="text-gradient">{category.name.toLowerCase()}</span>
        </h1>
        <div className="mt-4 w-24 h-1 bg-[var(--accent)] mx-auto opacity-40"></div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="h-[30vh] glass rounded-3xl flex items-center justify-center">
           <p className="opacity-40 font-bold uppercase">В данной категории нет товаров из этого материала</p>
        </div>
      )}
    </div>
  );
}
