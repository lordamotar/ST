import Image from "next/image";
import Link from "next/link";
import { getCategories, getProducts, getAllSettings, getSlides } from "@/lib/api";
import SearchInput from "@/components/SearchInput";
import ProductCard from "@/components/ProductCard";
import AnimatedSection from "@/components/AnimatedSection";
import { HeroText, FadeIn, Counter } from "@/components/HeroAnimations";
import HeroSlider from "@/components/HeroSlider";

export default async function Home() {
  const dbCategories = await getCategories();
  const bestsellers = await getProducts({ is_bestseller: true });
  const siteSettings = (await getAllSettings()) || [];
  const allSlides = await getSlides();
  
  // Helper to get setting value
  const getS = (key: string, fallback: string) => {
    const s = siteSettings.find((item: any) => item.key === key);
    return s && s.value ? s.value : fallback;
  };

  const now = new Date().getTime();
  const activeSlides = allSlides.filter((s: any) => {
    const start = s.start_date ? new Date(s.start_date).getTime() : 0;
    const end = s.end_date ? new Date(s.end_date).getTime() : Infinity;
    return s.is_active && now >= start && now <= end;
  });

  const categories = dbCategories.map((cat: any) => {
    const assets: { [key: string]: string } = {
      chairs: "/assets/chair_category.png",
      sofas: "/assets/sofa_category.png",
      tables: "/assets/table_category.png",
      cupboards: "/assets/cupboard_category.png",
    };
    return { 
        ...cat, 
        img: assets[cat.slug] || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop"
    };
  });

  return (
    <div className="flex flex-col items-center overflow-x-hidden">
      {/* ─── HERO SECTION (SLIDER) ─── */}
      <HeroSlider 
        slides={activeSlides} 
        defaultSettings={{
          badge: getS("home_hero_badge", "Premium Furniture 2026"),
          title: getS("home_hero_title", "Эстетика <br /> <span class='text-gradient underline decoration-white/5 underline-offset-[15px]'>Вашего дома</span>"),
          subtitle: getS("home_hero_subtitle", "Мы объединили вековые традиции мебельного мастерства <br class='hidden md:block'/> с технологиями будущего для создания вашего идеального пространства.")
        }}
      />

      {/* ─── TRUST INDICATORS (STATIC GRID WITH ANIMATION) ─── */}
      <section className="w-full border-y border-white/5 bg-white/[0.01] py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {[
            { n: getS("trust_1_val", "15+"), t: getS("trust_1_label", "Лет на рынке") },
            { n: getS("trust_2_val", "5000+"), t: getS("trust_2_label", "Довольных клиентов") },
            { n: getS("trust_3_val", "100%"), t: getS("trust_3_label", "Натуральные материалы") },
            { n: getS("trust_4_val", "24"), t: getS("trust_4_label", "Месяца гарантии") }
          ].map((item, i) => (
            <AnimatedSection key={i} delay={i * 0.1} distance={20}>
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <Counter value={item.n} className="text-3xl md:text-5xl font-black font-outfit text-white mb-1" />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 leading-tight">{item.t}</span>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ─── CATEGORIES SECTION ─── */}
      <section className="w-full max-w-7xl px-4 md:px-8 py-24 md:py-40">
        <AnimatedSection>
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-3xl md:text-7xl font-outfit font-black uppercase mb-6 tracking-tighter">Направления</h2>
            <div className="w-20 md:w-24 h-1 bg-[var(--accent)] mx-auto rounded-full"></div>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {categories.map((cat: any, i: number) => (
            <AnimatedSection key={cat.slug} delay={i * 0.05}>
              <Link href={`/${cat.slug}`} className="group relative glass rounded-[2.5rem] md:rounded-[3rem] overflow-hidden h-[400px] md:h-[550px] cursor-pointer hover-scale block">
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent z-10 opacity-70 group-hover:opacity-90 transition-opacity"></div>
                <div className="absolute bottom-10 left-8 md:bottom-12 md:left-10 z-20 transition-all group-hover:bottom-14">
                  <span className="text-[var(--accent)] font-black text-[9px] uppercase tracking-[0.3em] mb-2 block opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">Collection</span>
                  <h3 className="text-2xl md:text-3xl font-outfit font-black text-white uppercase mb-2">{cat.name}</h3>
                  <p className="text-white/40 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                    Перейти к коллекции 
                    <span className="group-hover:translate-x-2 transition-transform">→</span>
                  </p>
                </div>
                <Image 
                  src={cat.img} 
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-[2s] ease-out"
                />
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ─── BEST SELLERS ─── */}
      <section className="w-full bg-[#050505] py-24 md:py-40">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <AnimatedSection direction="left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-20 gap-8">
              <div>
                <h2 className="text-3xl md:text-7xl font-outfit font-black uppercase text-white mb-4 md:mb-6 tracking-tighter">Бестселлеры</h2>
                <p className="text-white/40 max-w-md text-base md:text-lg leading-relaxed">Модели, которые чаще всего выбирают дизайнеры интерьеров.</p>
              </div>
              <Link href="/catalog" className="text-[var(--accent)] text-[10px] md:text-xs font-black uppercase tracking-[0.2em] border-b border-[var(--accent)]/30 pb-2 hover:bg-[var(--accent)]/10 transition-all">
                Смотреть все новинки
              </Link>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {bestsellers.slice(0, 4).map((p: any, i: number) => (
              <AnimatedSection key={p.id} delay={i * 0.1}>
                <ProductCard product={p} hideDetails={true} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROMO BLOCK / SHOWROOM ─── */}
      <section className="w-full max-w-7xl px-4 md:px-8 py-24 md:py-40">
        <AnimatedSection distance={50}>
          <div className="glass rounded-[3rem] md:rounded-[5rem] overflow-hidden flex flex-col lg:flex-row min-h-[600px] lg:min-h-[700px]">
            <div className="flex-[1.2] relative h-[400px] lg:h-auto overflow-hidden group">
              <Image 
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop"
                alt="Showroom"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-[3s]"
              />
              <div className="absolute inset-0 bg-[var(--accent)]/10 mix-blend-overlay"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
            </div>
            <div className="flex-1 p-10 md:p-20 lg:p-24 flex flex-col justify-center bg-white/[0.01]">
              <span className="text-[var(--accent)] font-black uppercase tracking-[0.4em] text-[9px] mb-8 block">
                {getS("home_craft_badge", "Our Craftsmanship")}
              </span>
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-outfit font-black uppercase leading-[1] md:leading-[0.9] mb-8 tracking-tighter"
                  dangerouslySetInnerHTML={{ __html: getS("home_craft_title", "Качество, которое <br/> можно потрогать") }}
              />
              <p className="opacity-40 text-base md:text-lg mb-10 leading-relaxed font-medium"
                 dangerouslySetInnerHTML={{ __html: getS("home_craft_subtitle", "Посетите наш шоурум в центре Семея, чтобы лично убедиться в безупречном качестве материалов и удобстве наших моделей.") }}
              />
              <div className="space-y-4 md:space-y-6 mb-12">
                {["Собственное производство", "Гарантия 24 месяца", "Экологичные материалы"].map((text, i) => (
                  <div key={i} className="flex items-center gap-4 md:gap-5">
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/50 flex items-center justify-center">
                      <svg className="text-[var(--accent)] w-2 h-2 md:w-2.5 md:h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span className="font-black text-[10px] md:text-xs uppercase tracking-[0.1em] opacity-80">{text}</span>
                  </div>
                ))}
              </div>
              <Link href="/contacts" className="bg-[var(--foreground)] text-[var(--background)] px-10 md:px-12 py-5 md:py-6 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest self-start hov-scale hover:bg-[var(--accent)] hover:text-black transition-all">
                Записаться на визит
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ─── CALL TO ACTION ─── */}
      <section className="w-full px-4 md:px-8 py-20 mb-20 flex justify-center">
        <AnimatedSection distance={30}>
          <div className="w-full max-w-7xl relative rounded-[3rem] md:rounded-[5rem] overflow-hidden bg-[var(--foreground)] min-h-[500px] md:min-h-[600px] flex flex-col justify-center items-center text-center text-[var(--background)] p-8 md:p-12">
            <div className="absolute inset-0 opacity-[0.08] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,_var(--accent)_0%,_transparent_60%)] opacity-10"></div>
            
            <h2 className="text-3xl sm:text-5xl md:text-8xl font-outfit font-black uppercase mb-8 z-10 leading-[1] md:leading-[0.85] tracking-tighter text-black"
                dangerouslySetInnerHTML={{ __html: getS("home_cta_title", "Создайте проект <br /> своего пространства") }}
            />
            <p className="max-w-xl opacity-60 text-sm md:text-lg mb-12 z-10 leading-relaxed font-semibold px-4 text-black"
               dangerouslySetInnerHTML={{ __html: getS("home_cta_subtitle", "Оставьте заявку на бесплатную консультацию нашего дизайнера <br class='hidden md:block'/> или подпишитесь на закрытые предложения.") }}
            />
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl z-10 glass p-2 rounded-[2rem] sm:rounded-full border-white/5 bg-white/[0.05]">
              <input 
                type="email" 
                placeholder="Ваш email" 
                className="flex-1 bg-transparent px-8 md:px-10 py-4 md:py-5 outline-none text-white font-medium placeholder:text-white/20 text-sm md:text-base"
              />
              <button className="bg-[var(--accent)] text-black px-10 md:px-12 py-4 md:py-5 rounded-full font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-white hover:scale-[0.98] transition-all">Подписаться</button>
            </div>
          </div>
        </AnimatedSection>
      </section>
    </div>
  );
}
