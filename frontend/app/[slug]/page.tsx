import { getPage } from "@/lib/api";
import { notFound } from "next/navigation";
import AnimatedSection from "@/components/AnimatedSection";

export default async function StaticPageView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Исключаем системные маршруты
  const reservedSlugs = ["admin", "catalog", "api", "login", "product", "search"];
  if (reservedSlugs.includes(slug)) {
    notFound();
  }

  const page = await getPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <main className="min-h-screen pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <AnimatedSection>
          <div className="mb-12">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent)] mb-4 block">Информационный раздел</span>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-8">
              {page.title}
            </h1>
            <div className="h-1 w-20 bg-[var(--accent)] rounded-full"></div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="glass rounded-[3rem] p-8 md:p-16 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            
            <div 
              className="prose prose-invert prose-p:text-white/60 prose-p:leading-relaxed prose-headings:text-white prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-strong:text-[var(--accent)] max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.4}>
            <div className="mt-12 flex justify-center">
                <a href="/" className="text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-all flex items-center gap-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Вернуться на главную
                </a>
            </div>
        </AnimatedSection>
      </div>
    </main>
  );
}
