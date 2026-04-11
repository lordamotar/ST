"use client";
import { useState, useEffect } from "react";
import { getPages, savePage, deletePage } from "@/lib/api";
import { Plus, Trash2, Edit3, Save, Eye, Layout } from "lucide-react";
import Link from "next/link";

export default function AdminPages() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const data = await getPages();
      setPages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await savePage(editingPage);
      setEditingPage(null);
      setIsCreating(false);
      fetchPages();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Удалить эту страницу?")) return;
    try {
      await deletePage(slug);
      fetchPages();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const startNewPage = () => {
    setIsCreating(true);
    setEditingPage({
      slug: "",
      title: "",
      content: ""
    });
  };

  const presets = [
    { slug: "contacts", title: "Контакты" },
    { slug: "delivery", title: "Доставка и сборка" },
    { slug: "warranty", title: "Гарантия качества" },
    { slug: "returns", title: "Возврат и обмен" },
    { slug: "offer", title: "Публичная оферта" },
  ];

  if (loading) return <div className="p-10 text-center opacity-40">Загрузка страниц...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Управление страницами</h1>
          <p className="text-white/40 text-sm font-medium">Редактирование информационных разделов сайта</p>
        </div>
        <button 
          onClick={startNewPage}
          className="bg-white text-black px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--accent)] transition-all flex items-center gap-2"
        >
          <Plus size={14} /> Новая страница
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Список страниц */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-4">Существующие страницы</h3>
          {pages.length === 0 && (
            <div className="glass rounded-3xl p-6 border border-dashed border-white/10 text-center text-xs opacity-40">
                Нет созданных страниц
            </div>
          )}
          {pages.map((page: any) => (
            <div 
              key={page.slug} 
              className={`glass p-5 rounded-2xl border transition-all cursor-pointer group ${editingPage?.slug === page.slug && !isCreating ? 'border-[var(--accent)]/50 bg-white/[0.02]' : 'border-white/5 hover:border-white/20'}`}
              onClick={() => { setEditingPage(page); setIsCreating(false); }}
            >
              <div className="flex items-center justify-between">
                <div>
                   <h4 className="text-sm font-bold truncate mb-1">{page.title}</h4>
                   <span className="text-[9px] font-black uppercase tracking-widest opacity-30">/{page.slug}</span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/${page.slug}`} target="_blank" className="p-2 rounded-lg bg-white/5 hover:text-[var(--accent)]"><Eye size={14}/></Link>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(page.slug); }} className="p-2 rounded-lg bg-red-500/10 text-red-500/50 hover:text-red-500"><Trash2 size={14}/></button>
                </div>
              </div>
            </div>
          ))}

          {/* Быстрые шаблоны */}
          {presets.filter(p => !pages.find((exist: any) => exist.slug === p.slug)).length > 0 && (
            <div className="mt-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-4">Рекомендуемые (пустые)</h3>
                <div className="space-y-2">
                    {presets.filter(p => !pages.find((exist: any) => exist.slug === p.slug)).map(p => (
                        <button 
                            key={p.slug}
                            onClick={() => { setIsCreating(true); setEditingPage({...p, content: ""}); }}
                            className="w-full text-left p-4 rounded-xl border border-white/5 hover:bg-white/5 text-xs font-bold opacity-60 hover:opacity-100 transition-all flex items-center justify-between"
                        >
                            {p.title}
                            <Plus size={12} className="opacity-40" />
                        </button>
                    ))}
                </div>
            </div>
          )}
        </div>

        {/* Редактор */}
        <div className="lg:col-span-2">
          {editingPage ? (
            <form onSubmit={handleSave} className="glass rounded-[3rem] p-10 border border-white/10 sticky top-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                  <Edit3 size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter">
                    {isCreating ? "Создание страницы" : "Редактирование"}
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-30 text-[var(--accent)]">
                    {editingPage.slug || "новый-адрес"}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Слаг (URL)</label>
                        <input 
                            disabled={!isCreating}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold focus:border-[var(--accent)] outline-none disabled:opacity-50"
                            value={editingPage.slug}
                            onChange={(e) => setEditingPage({...editingPage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})}
                            placeholder="contacts"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Заголовок</label>
                        <input 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold focus:border-[var(--accent)] outline-none"
                            value={editingPage.title}
                            onChange={(e) => setEditingPage({...editingPage, title: e.target.value})}
                            placeholder="Название страницы"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">Контент (Поддерживается HTML)</label>
                    <textarea 
                        className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm font-medium focus:border-[var(--accent)] outline-none min-h-[400px] leading-relaxed"
                        value={editingPage.content}
                        onChange={(e) => setEditingPage({...editingPage, content: e.target.value})}
                        placeholder="Введите текст страницы..."
                    />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => {setEditingPage(null); setIsCreating(false);}}
                    className="px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all"
                  >
                    Отмена
                  </button>
                  <button 
                    type="submit"
                    className="bg-[var(--accent)] text-black px-12 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-3 shadow-lg shadow-[var(--accent)]/20"
                  >
                    <Save size={14} /> Сохранить страницу
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="h-full min-h-[400px] glass rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-10">
                <Layout size={48} className="opacity-10 mb-6" />
                <h3 className="text-lg font-black uppercase tracking-tighter opacity-20">Выберите страницу для редактирования</h3>
                <p className="max-w-xs text-xs opacity-20 mt-2">Или воспользуйтесь шаблонами слева для быстрого создания стандартных разделов.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
