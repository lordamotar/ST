export const translations: { [key: string]: string } = {
  // Материалы
  oak: "Дуб",
  pine: "Сосна",
  metal: "Металл",
  glass: "Стекло",
  velvet: "Велюр",
  leather: "Кожа",
  mdf: "МДФ",
  plastic: "Пластик",
  ash: "Ясень",
  
  // Цвета
  natural: "Натуральный",
  white: "Белый",
  black: "Черный",
  grey: "Серый",
  beige: "Бежевый",
  brown: "Коричневый",
  green: "Зеленый",
  blue: "Синий",
  gold: "Золото",
  
  // Категории
  tables: "Столы",
  chairs: "Стулья",
  sofas: "Диваны",
  cupboards: "Шкафы",
};

export function translateSlug(slug: string): string {
  if (!slug) return "";
  return translations[slug.toLowerCase()] || slug.charAt(0).toUpperCase() + slug.slice(1);
}
