"use client";

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/api";
import { useRouter } from "next/navigation";

// Utility for URL slugs
function slugify(text: string) {
  return text.toString().toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
}

const EMPTY_FORM = { name: "", slug: "", description: "", is_active: true };

export default function AdminCategories() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const PAGE_SIZES = [10, 25, 50, 100];

  // Filters
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"" | "active" | "hidden">("")

  // Modal states
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchCategories();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/catalog/categories`, { cache: "no-store" });
      if (res.ok) {
        setCategories(await res.json());
      } else {
        const err = await res.json();
        setError(err.detail || "Ошибка загрузки категорий");
      }
    } catch (e) {
      setError("Не удалось подключиться к серверу");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) {
      alert("Заполните Название и Slug");
      return;
    }
    setSaving(true);
    try {
      const isEdit = modal === "edit" && editId;
      const url = isEdit ? `${API_URL}/catalog/categories/${editId}` : `${API_URL}/catalog/categories`;
      const method = isEdit ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        alert("Ошибка: " + (err.detail || JSON.stringify(err)));
        return;
      }
      setModal(null);
      fetchCategories();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить категорию? Это может вызвать проблемы, если к ней привязаны товары.")) return;
    try {
      const res = await fetch(`${API_URL}/catalog/categories/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const err = await res.json();
        alert("Ошибка: " + (err.detail || "Не удалось удалить категорию"));
        return;
      }
      fetchCategories();
    } catch (e) {
      alert("Ошибка удаления");
    }
  };

  const filtered = categories.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.slug.includes(q);
    const matchActive = activeFilter === "" || (activeFilter === "active" ? c.is_active : !c.is_active);
    return matchSearch && matchActive;
  });

  if (loading && categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] opacity-40 uppercase tracking-[0.3em] text-xs font-black animate-pulse">
        Синхронизация каталога...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-wrap justify-between items-end mb-12 gap-6">
        <div>
          <h1 className="text-6xl font-outfit font-black uppercase tracking-tighter mb-4 text-white">Категории</h1>
          <p className="text-white/40 uppercase tracking-widest text-[10px] font-black">Управление структурой каталога продукции</p>
        </div>
        <button
          onClick={() => { setForm(EMPTY_FORM); setModal("add"); }}
          className="bg-[var(--accent)] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:shadow-[0_0_40px_rgba(var(--accent-rgb),0.3)] transition-all transform hover:-translate-y-1 active:scale-95"
        >
          + Создать категорию
        </button>
      </div>

      {error ? (
          <div className="glass p-20 rounded-[3rem] text-center border-white/5">
              <div className="text-red-500 font-black uppercase tracking-widest text-xs mb-4">Доступ ограничен</div>
              <div className="text-white/40 text-sm">{error}</div>
          </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8 p-4 glass rounded-[2rem] border-white/5 items-center">
            <div className="relative flex-1 min-w-[250px]">
              <input
                type="text"
                placeholder="ПОИСК ПО КАТАЛОГУ..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-wider text-white placeholder:opacity-20 outline-none focus:border-[var(--accent)] transition-all"
              />
            </div>
            <div className="flex gap-2">
              {([["", "Все"], ["active", "Активные"], ["hidden", "Скрытые"]] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => { setActiveFilter(val); setPage(1); }}
                  className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${
                    activeFilter === val 
                        ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]" 
                        : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white"
                  }`}
                >{label}</button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="glass p-20 rounded-[3rem] text-center opacity-40 uppercase tracking-widest text-sm font-black">
              Категории не найдены
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.slice((page - 1) * pageSize, page * pageSize).map((c) => (
                <div key={c.id} className="glass p-10 rounded-[2.5rem] flex flex-col group hover:border-[var(--accent)]/30 transition-all duration-500 relative border-white/5">
                  <div className="mb-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-3xl font-outfit font-black uppercase tracking-tighter leading-none">{c.name}</h3>
                      <div className={`px-4 py-2 text-[8px] font-black uppercase tracking-widest rounded-lg border ${
                        c.is_active 
                            ? "bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)]" 
                            : "bg-white/5 border-white/10 text-white/20"
                      }`}>
                        {c.is_active ? "Активна" : "Скрыта"}
                      </div>
                    </div>
                    <div className="inline-block px-3 py-1 bg-white/5 rounded-lg text-[10px] font-mono opacity-40 mb-4 tracking-tighter">/{c.slug}</div>
                    {c.description && <p className="text-sm opacity-50 font-medium leading-relaxed line-clamp-3">{c.description}</p>}
                  </div>

                  <div className="mt-auto flex gap-4 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <button
                     onClick={() => {
                        setForm({ name: c.name, slug: c.slug, description: c.description || "", is_active: c.is_active });
                        setEditId(c.id);
                        setModal("edit");
                      }}
                      className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-center py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="px-6 py-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* пагинация */}
          {filtered.length > pageSize && (
            <div className="flex items-center justify-center gap-4 mt-12">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-8 py-4 glass rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-10 transition-all hover:bg-white/5"
              >
                Назад
              </button>
              <div className="text-xs font-black font-mono opacity-40">
                {page} / {Math.ceil(filtered.length / pageSize)}
              </div>
              <button
                onClick={() => setPage(p => Math.min(Math.ceil(filtered.length / pageSize), p + 1))}
                disabled={page === Math.ceil(filtered.length / pageSize)}
                className="px-8 py-4 glass rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-10 transition-all hover:bg-white/5"
              >
                Вперёд
              </button>
            </div>
          )}
        </>
      )}

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="glass rounded-[3rem] p-12 w-full max-w-xl relative border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-4xl font-outfit font-black uppercase tracking-tighter mb-10 text-white">
              {modal === "add" ? "Новая категория" : "Настройки категории"}
            </h2>

            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 px-1">Название категории</label>
                <input
                  value={form.name}
                  onChange={e => {
                    const newName = e.target.value;
                    setForm(prev => {
                      const isSlugPristine = prev.slug === "" || prev.slug === slugify(prev.name);
                      return { ...prev, name: newName, slug: isSlugPristine ? slugify(newName) : prev.slug };
                    });
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[var(--accent)] transition-all text-sm font-bold"
                  placeholder="Напр. Дизайнерские стулья"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 px-1">URL адрес (slug)</label>
                <input
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: slugify(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[var(--accent)] transition-all font-mono text-xs opacity-60"
                  placeholder="designer-chairs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 px-1">Краткое описание</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[var(--accent)] resize-none transition-all text-sm font-medium"
                  placeholder="Расскажите о товарах в этой категории..."
                />
              </div>

              <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                <label className="flex items-center gap-4 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-6 h-6 rounded-lg accent-[var(--accent)]"
                  />
                  <div>
                    <span className="font-black uppercase tracking-widest text-[10px] block">Отображать на сайте</span>
                    <span className="text-[10px] opacity-30 block">Категория и товары будут видны всем пользователям</span>
                  </div>
                </label>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleSave}
                  disabled={saving || !form.name || !form.slug}
                  className="flex-1 bg-[var(--accent)] text-white py-6 rounded-3xl font-black uppercase tracking-widest text-xs hover:shadow-[0_0_40px_rgba(var(--accent-rgb),0.3)] transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-20"
                >
                  {saving ? "Синхронизация..." : modal === "add" ? "Создать категорию" : "Обновить данные"}
                </button>
                <button
                  onClick={() => setModal(null)}
                  className="px-10 py-6 bg-white/5 hover:bg-white/10 rounded-3xl font-black uppercase tracking-widest text-xs transition-all border border-white/5"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
