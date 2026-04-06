"use client";

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/api";

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
  const [token, setToken] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const PAGE_SIZES = [10, 25, 50, 100];
  
  // Modal states
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("admin_token");
    if (savedToken) {
      setToken(savedToken);
      fetch(`${API_URL}/orders/`, { headers: { "admin-token": savedToken } })
        .then(res => {
          if (res.ok) {
            setIsLogged(true);
            fetchCategories();
          } else {
            localStorage.removeItem("admin_token");
          }
        });
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/orders/`, { headers: { "admin-token": token } });
    if (!res.ok) { setLoginError("Неверный Admin Token."); return; }
    localStorage.setItem("admin_token", token);
    setIsLogged(true);
    setLoginError("");
    fetchCategories();
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/catalog/categories`, { cache: "no-store" });
      if (res.ok) {
        setCategories(await res.json());
      }
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
      
      const payload = { ...form };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "admin-token": token },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert("Ошибка: " + JSON.stringify(err));
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
        headers: { "admin-token": token }
      });
      if (!res.ok) {
        const err = await res.json();
        alert("Ошибка или в категории есть товары: " + JSON.stringify(err.detail || err));
        return;
      }
      fetchCategories();
    } catch (e) {
      console.error(e);
      alert("Ошибка удаления");
    }
  };

  if (!isLogged) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="glass p-12 rounded-[3rem] w-full max-w-md text-center">
          <h1 className="text-3xl font-outfit font-black uppercase mb-8 text-gradient">Вход</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="password"
              placeholder="Admin Token"
              value={token}
              onChange={e => setToken(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[var(--accent)] transition-all text-center placeholder:opacity-30"
              required
            />
            <button className="w-full bg-[var(--foreground)] text-[var(--background)] py-4 rounded-2xl font-black uppercase tracking-wider hover:bg-[var(--accent)] transition-all">
              Войти
            </button>
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-20 animate-in fade-in duration-500">
      <div className="flex flex-wrap justify-between items-center mb-12 gap-4">
        <div>
          <h1 className="text-5xl font-outfit font-black uppercase text-gradient">Категории</h1>
          <p className="opacity-40 font-medium mt-1">{categories.length} категорий</p>
        </div>
        <button
          onClick={() => { setForm(EMPTY_FORM); setModal("add"); }}
          className="bg-[var(--accent)] text-black px-8 py-4 rounded-full font-black uppercase tracking-wider text-sm hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,204,0,0.3)]"
        >
          + Создать
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 opacity-50 font-outfit uppercase tracking-widest animate-pulse">Загрузка...</div>
      ) : categories.length === 0 ? (
        <div className="glass p-16 rounded-[3rem] text-center opacity-50">
          <p className="text-2xl font-outfit">Категорий пока нет</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.slice((page - 1) * pageSize, page * pageSize).map((c) => (
            <div key={c.id} className="glass p-6 rounded-[2rem] flex flex-col group hover:border-white/20 transition-all duration-500 relative overflow-hidden">
              <div className="mb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-outfit font-black mb-1">{c.name}</h3>
                  <div className={`px-3 py-1 text-[10px] uppercase font-black tracking-widest rounded-full ${c.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-white/10 text-white/40"}`}>
                    {c.is_active ? "Активна" : "Скрыта"}
                  </div>
                </div>
                <p className="text-sm font-mono opacity-40">/{c.slug}</p>
                {c.description && <p className="text-sm opacity-60 mt-2 line-clamp-2">{c.description}</p>}
              </div>

              <div className="mt-auto flex gap-2">
                <button
                 onClick={() => {
                    setForm({ name: c.name, slug: c.slug, description: c.description || "", is_active: c.is_active });
                    setEditId(c.id);
                    setModal("edit");
                  }}
                  className="flex-1 bg-white/5 hover:bg-[var(--accent)] hover:text-black text-center py-3 rounded-xl text-xs font-bold uppercase transition-all"
                >
                  Ред.
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-xs font-bold uppercase transition-all"
                >
                  Удал.
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* пагинация */}
      {!loading && categories.length > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold opacity-40 uppercase tracking-wider">Показывать по:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-[var(--accent)] text-xs font-black transition-all"
            >
              {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl font-bold uppercase text-xs disabled:opacity-20 transition-all"
            >
              Назад
            </button>
            <span className="text-sm font-black font-mono">
              {page} / {Math.ceil(categories.length / pageSize)}
            </span>
            <button
              onClick={() => setPage(p => Math.min(Math.ceil(categories.length / pageSize), p + 1))}
              disabled={page === Math.ceil(categories.length / pageSize)}
              className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl font-bold uppercase text-xs disabled:opacity-20 transition-all"
            >
              Вперёд
            </button>
          </div>
        </div>
      )}

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="glass rounded-[2rem] p-10 w-full max-w-lg shadow-[0_0_100px_rgba(0,0,0,1)]" onClick={e => e.stopPropagation()}>
            <h2 className="text-3xl font-outfit font-black uppercase mb-8 text-gradient">
              {modal === "add" ? "Новая категория" : "Редактирование"}
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase opacity-40 mb-2">Название</label>
                <input
                  value={form.name}
                  onChange={e => {
                    const newName = e.target.value;
                    setForm(prev => {
                      const isSlugPristine = prev.slug === "" || prev.slug === slugify(prev.name);
                      return { ...prev, name: newName, slug: isSlugPristine ? slugify(newName) : prev.slug };
                    });
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all text-sm"
                  placeholder="Мягкая мебель"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase opacity-40 mb-2">Slug (URL)</label>
                <input
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: slugify(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all font-mono text-sm"
                  placeholder="myagkaya-mebel"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase opacity-40 mb-2">Описание</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] resize-none transition-all text-sm"
                  placeholder="Необязательно..."
                />
              </div>

              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col justify-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-5 h-5 accent-[var(--accent)]"
                  />
                  <span className="font-bold text-sm">Категория активна (видна на сайте)</span>
                </label>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleSave}
                  disabled={saving || !form.name || !form.slug}
                  className="flex-1 bg-[var(--foreground)] text-[var(--background)] py-4 rounded-2xl font-black uppercase tracking-wider hover:bg-[var(--accent)] transition-all disabled:opacity-40"
                >
                  {saving ? "Сохраняем..." : modal === "add" ? "Создать" : "Сохранить"}
                </button>
                <button
                  onClick={() => setModal(null)}
                  className="px-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold uppercase tracking-wider transition-all"
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
