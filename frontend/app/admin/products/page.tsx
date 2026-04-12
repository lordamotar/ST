"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_URL, uploadProductImage, bulkImportProducts, toggleProductStatus } from "@/lib/api";

interface Category { id: number; name: string; slug: string; }
interface Product {
  id: number; name: string; slug: string; new_price: number; old_price?: number;
  material?: string; color?: string; description?: string;
  image_url?: string; characteristics?: Record<string, string>;
  category_id: number; is_active: boolean; availability_status: string;
  is_bestseller: boolean;
  promo_start?: string; promo_end?: string; show_timer: boolean;
  dimensions?: string; legs_material?: string; tabletop_material?: string; tabletop_thickness?: string;
  floor_clearance?: string; max_load?: string; legs_adjustment?: string; tabletop_color?: string;
  footings?: string; warranty?: string; delivery_format?: string; supports?: string; country?: string; series?: string;
  category?: Category;
}

const EMPTY_FORM = { 
  name: "", slug: "", new_price: 0, old_price: 0, material: "", color: "", description: "", category_id: 1, is_active: true, is_bestseller: false, availability_status: "in_stock", image_url: "", 
  promo_start: "", promo_end: "", show_timer: false,
  characteristics: [] as {k: string; v: string}[],
  dimensions: "", legs_material: "", tabletop_material: "", tabletop_thickness: "",
  floor_clearance: "", max_load: "", legs_adjustment: "", tabletop_color: "",
  footings: "", warranty: "", delivery_format: "", supports: "", country: "", series: ""
};

const BACKEND_URL = "http://127.0.0.1:8000";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Product modal
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Image upload
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bulk import
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const bulkFileRef = useRef<HTMLInputElement>(null);

  // Toggle status
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const PAGE_SIZES = [10, 25, 50, 100];

  // View Mode
  const [viewMode, setViewMode] = useState<"table" | "list">("table");

  // Filters
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState(0);
  const [activeFilter, setActiveFilter] = useState<"" | "active" | "hidden">("")

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.slug.includes(q);
    const matchCat = !catFilter || p.category_id === catFilter;
    const matchActive = activeFilter === "" || (activeFilter === "active" ? p.is_active : !p.is_active);
    return matchSearch && matchCat && matchActive;
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch(`${API_URL}/catalog/products?all_products=true`, { cache: "no-store" }),
        fetch(`${API_URL}/catalog/categories`),
      ]);
      if (pRes.ok) setProducts(await pRes.json());
      if (cRes.ok) setCategories(await cRes.json());
      
      if (!pRes.ok && pRes.status === 401) {
          router.push("/login");
      }
    } catch (err) {
        console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      fetchProducts();
    }
  }, []);

  // ───────────────────────────── IMAGE UPLOAD ─────────────────────────────
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Локальный превью
    setImagePreview(URL.createObjectURL(file));

    // Загрузка на сервер
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      if (url) {
        setForm((prev) => ({ ...prev, image_url: url }));
      } else {
        alert("Ошибка загрузки изображения. Проверьте формат (JPEG, PNG, WebP) и размер (до 5 MB).");
        setImagePreview(null);
      }
    } finally {
      setUploading(false);
    }
  };

  // ───────────────────────────── TOGGLE STATUS ─────────────────────────────
  const handleToggle = async (productId: number) => {
    setTogglingId(productId);
    try {
      const updated = await toggleProductStatus(productId);
      if (updated) {
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      }
    } finally {
      setTogglingId(null);
    }
  };

  // ───────────────────────────── BULK IMPORT ─────────────────────────────
  const handleBulkImport = async () => {
    const file = bulkFileRef.current?.files?.[0];
    if (!file) { alert("Выберите Excel-файл (.xlsx)"); return; }

    setImporting(true);
    setImportResult(null);
    try {
      const result = await bulkImportProducts(file);
      setImportResult(result);
      if (result.ok) {
        fetchProducts(); // Обновляем список
      }
    } finally {
      setImporting(false);
    }
  };

  // ───────────────────────────── PRODUCT CRUD ─────────────────────────────
  const openAdd = () => {
    setForm({ ...EMPTY_FORM, category_id: categories[0]?.id ?? 1 });
    setEditTarget(null);
    setImagePreview(null);
    setModal("add");
  };

  const openEdit = (p: Product) => {
    const charsArray = Object.entries(p.characteristics || {}).map(([k, v]) => ({ k, v }));
    
    // Helper to format date for input[type="datetime-local"]
    const formatDate = (dateStr?: string) => {
      if (!dateStr) return "";
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "";
        return d.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
      } catch { return ""; }
    };

    setForm({
      name: p.name, slug: p.slug, new_price: p.new_price, old_price: p.old_price ?? 0,
      material: p.material ?? "", color: p.color ?? "",
      description: p.description ?? "", category_id: p.category_id,
      is_active: p.is_active, is_bestseller: p.is_bestseller || false, availability_status: p.availability_status || "in_stock", image_url: p.image_url ?? "",
      promo_start: formatDate(p.promo_start),
      promo_end: formatDate(p.promo_end),
      show_timer: p.show_timer || false,
      dimensions: p.dimensions ?? "", legs_material: p.legs_material ?? "", tabletop_material: p.tabletop_material ?? "",
      tabletop_thickness: p.tabletop_thickness ?? "", floor_clearance: p.floor_clearance ?? "", max_load: p.max_load ?? "",
      legs_adjustment: p.legs_adjustment ?? "", tabletop_color: p.tabletop_color ?? "", footings: p.footings ?? "",
      warranty: p.warranty ?? "", delivery_format: p.delivery_format ?? "", supports: p.supports ?? "",
      country: p.country ?? "", series: p.series ?? "",
      characteristics: charsArray,
    });
    setEditTarget(p);
    setImagePreview(p.image_url ? (p.image_url.startsWith("http") ? p.image_url : `${BACKEND_URL}${p.image_url}`) : null);
    setModal("edit");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const charRecord: Record<string, string> = {};
      form.characteristics.forEach(c => {
        if (c.k.trim()) charRecord[c.k.trim()] = c.v.trim();
      });
      const body = { 
        ...form, 
        new_price: Number(form.new_price),
        old_price: form.old_price ? Number(form.old_price) : null,
        category_id: Number(form.category_id),
        characteristics: charRecord,
        promo_start: form.promo_start || null,
        promo_end: form.promo_end || null,
      };
      const url = modal === "edit" && editTarget
        ? `${API_URL}/catalog/products/${editTarget.id}`
        : `${API_URL}/catalog/products`;
      const method = modal === "edit" ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const saved: Product = await res.json();
        if (modal === "edit") {
          setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
        } else {
          setProducts((prev) => [saved, ...prev]);
        }
        setModal(null);
        setImagePreview(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить товар? Это действие необратимо.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_URL}/catalog/products/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.status === 204) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  };

  const slugify = (v: string) => v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  // ═══════════════════════════════ RENDER ══════════════════════════════════


  // MAIN ADMIN PAGE
  return (
    <div className="max-w-7xl mx-auto px-8 py-20 animate-in fade-in duration-500">
      {/* ─── Header ─── */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-5xl font-outfit font-black uppercase text-gradient">Товары</h1>
          <p className="opacity-40 font-medium mt-1">{products.length} позиций в каталоге</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => { setShowImport(true); setImportResult(null); }}
            className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-5 py-3 rounded-2xl font-bold uppercase tracking-wider text-sm hover:bg-emerald-500/25 transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
            Импорт Excel
          </button>
          <button
            onClick={openAdd}
            className="bg-[var(--accent)] text-white px-6 py-3 rounded-2xl font-bold uppercase tracking-wider text-sm hover:opacity-90 transition-all"
          >
            + Добавить товар
          </button>
        </div>
      </div>

      {/* ─── View Mode Toggle ─── */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setViewMode("table")}
          className={`flex items-center gap-2 px-5 py-2 text-xs font-medium uppercase tracking-wider rounded-xl transition-all ${
            viewMode === "table" ? "bg-white/15 text-white" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
          Таблица
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`flex items-center gap-2 px-5 py-2 text-xs font-medium uppercase tracking-wider rounded-xl transition-all ${
            viewMode === "list" ? "bg-white/15 text-white" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          Список
        </button>
      </div>

      {/* ─── Filters ─── */}
      <div className="flex flex-wrap gap-2 mb-6 p-3 bg-white/3 rounded-2xl border border-white/5">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 opacity-25" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-white/5 border border-white/8 rounded-xl pl-8 pr-4 py-2 text-sm text-white/70 placeholder:text-white/25 outline-none focus:border-white/20 transition-all"
          />
          {search && (
            <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-all">×</button>
          )}
        </div>
        <select
          value={catFilter}
          onChange={e => { setCatFilter(Number(e.target.value)); setPage(1); }}
          className="bg-[#111] border border-white/8 rounded-xl px-4 py-2 text-sm text-white/60 outline-none focus:border-white/20 transition-all min-w-[160px] cursor-pointer"
        >
          <option value={0} className="bg-[#111] text-white/60">Все категории</option>
          {categories.map(c => <option key={c.id} value={c.id} className="bg-[#111] text-white/80">{c.name}</option>)}
        </select>
        {([["", "Все"], ["active", "Активные"], ["hidden", "Скрытые"]] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => { setActiveFilter(val); setPage(1); }}
            className={`px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-xl transition-all ${
              activeFilter === val ? "bg-white/15 text-white" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
            }`}
          >{label}</button>
        ))}
        {(search || catFilter !== 0 || activeFilter) && (
          <button
            onClick={() => { setSearch(""); setCatFilter(0); setActiveFilter(""); setPage(1); }}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-white/40 hover:text-white/70 font-medium uppercase transition-all"
          >
            Сброс
          </button>
        )}
        <span className="self-center text-xs text-white/25 font-medium ml-auto">{filtered.length} / {products.length}</span>
      </div>

      {/* ─── Product List / Table ─── */}
      {loading ? (
        <div className="h-40 flex items-center justify-center opacity-30">
          <p className="text-2xl font-bold uppercase">Загрузка...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="h-40 flex items-center justify-center glass rounded-3xl opacity-30">
          <p className="text-2xl font-bold uppercase">Товаров нет</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="h-32 flex items-center justify-center glass rounded-2xl opacity-40">
          <p className="font-bold uppercase">Ничего не найдено</p>
        </div>
      ) : viewMode === "list" ? (
        <div className="grid grid-cols-1 gap-4">
          {filtered.slice((page - 1) * pageSize, page * pageSize).map((p) => (
            <div key={p.id} className="glass p-6 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 hover:border-[var(--accent)]/20 transition-all">
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 shrink-0 flex items-center justify-center">
                {p.image_url ? (
                  <img src={p.image_url.startsWith('http') ? p.image_url : `${BACKEND_URL}${p.image_url}`} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[var(--accent)] font-bold text-sm">#{p.id}</span>
                )}
              </div>
              {/* Name + Slug */}
              <div className="flex-1 min-w-0">
                <p className="font-bold uppercase truncate">{p.name}</p>
                <p className="text-xs opacity-40 font-mono">{p.slug}</p>
              </div>
              {/* Category */}
              <span className="text-sm bg-white/5 px-3 py-1 rounded-full font-medium shrink-0">
                {p.category?.name ?? `Cat #${p.category_id}`}
              </span>
              {p.material && (
                <span className="text-sm bg-white/5 px-3 py-1 rounded-full font-medium shrink-0">{p.material}</span>
              )}
              <div className="flex flex-col items-end shrink-0">
                <span className="font-black text-lg text-[var(--accent)]">{p.new_price.toLocaleString()} ₸</span>
                {p.old_price && <span className="text-[10px] opacity-30 line-through">{p.old_price.toLocaleString()} ₸</span>}
              </div>
              <button
                onClick={() => handleToggle(p.id)}
                disabled={togglingId === p.id}
                title={p.is_active ? "Деактивировать" : "Активировать"}
                className={`relative w-12 h-7 rounded-full transition-all duration-300 shrink-0 disabled:opacity-40 ${
                  p.is_active ? "bg-green-500/30 border border-green-500/40" : "bg-red-500/20 border border-red-500/30"
                }`}
              >
                <span className={`absolute top-0.5 w-6 h-6 rounded-full transition-all duration-300 ${
                  p.is_active ? "left-[calc(100%-1.625rem)] bg-green-400" : "left-0.5 bg-red-400"
                }`} />
              </button>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(p)} className="px-4 py-2 bg-white/5 hover:bg-[var(--accent)]/20 rounded-xl text-sm font-bold transition-all">✏️</button>
                <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-bold transition-all disabled:opacity-40">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ─── TABLE VIEW ─── */
        <div className="glass rounded-[2rem] overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ minWidth: '2200px' }}>
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                {[
                  "№", "Действия", "Фото", "Название", "Категория", "Описание", "Новая цена", "Старая цена",
                  "Размеры", "Мат. ножек", "Мат. столешн.", "Толщ. столешн.",
                  "Просвет", "Макс. нагр.", "Регул. опор", "Цв. столешн.",
                  "Подпятники", "Гарантия", "Доставка", "Цвет", "Опоры", "Страна", "Серия"
                ].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest opacity-50 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice((page - 1) * pageSize, page * pageSize).map((p) => {
                const specs = p.characteristics ?? {};
                const g = (key: string) => specs[key] || p[key as keyof Product] as string || "—";
                return (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-all text-sm">
                    {/* № */}
                    <td className="px-4 py-3 font-bold text-[var(--accent)] whitespace-nowrap">#{p.id}</td>
                    {/* Действия */}
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 items-center">
                        <button
                          onClick={() => handleToggle(p.id)}
                          disabled={togglingId === p.id}
                          title={p.is_active ? "Деактивировать" : "Активировать"}
                          className={`relative w-10 h-6 rounded-full transition-all duration-300 shrink-0 disabled:opacity-40 ${
                            p.is_active ? "bg-green-500/30 border border-green-500/40" : "bg-red-500/20 border border-red-500/30"
                          }`}
                        >
                          <span className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 ${
                            p.is_active ? "left-[calc(100%-1.375rem)] bg-green-400" : "left-0.5 bg-red-400"
                          }`} />
                        </button>
                        <button onClick={() => openEdit(p)} className="px-2.5 py-1.5 bg-white/5 hover:bg-[var(--accent)]/20 rounded-lg text-xs font-bold transition-all">✏️</button>
                        <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-all disabled:opacity-40">🗑️</button>
                      </div>
                    </td>
                    {/* Фото */}
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
                        {p.image_url ? (
                          <img src={p.image_url.startsWith('http') ? p.image_url : `${BACKEND_URL}${p.image_url}`} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] opacity-30">нет</span>
                        )}
                      </div>
                    </td>
                    {/* Название */}
                    <td className="px-4 py-3 min-w-[160px] max-w-[200px]">
                      <p className="font-bold text-xs leading-tight truncate" title={p.name}>{p.name}</p>
                      <p className="text-[10px] opacity-30 font-mono truncate">{p.slug}</p>
                      <div className="flex gap-1.5 mt-1">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                          p.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                        }`}>{p.is_active ? "Активен" : "Скрыт"}</span>
                        {p.is_bestseller && (
                          <span className="bg-[var(--accent)]/10 text-[var(--accent)] text-[9px] font-black px-1.5 py-0.5 rounded-full">★ Best</span>
                        )}
                      </div>
                    </td>
                    {/* Категория */}
                    <td className="px-4 py-3 whitespace-nowrap text-xs opacity-80">{p.category?.name ?? `#${p.category_id}`}</td>
                    {/* Описание */}
                    <td className="px-4 py-3 min-w-[150px] max-w-[200px]">
                      <p className="text-xs opacity-60 line-clamp-2" title={p.description ?? ""}>{p.description || "—"}</p>
                    </td>
                    {/* Цена */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-black text-[var(--accent)]">{p.new_price.toLocaleString()} ₸</span>
                        {p.old_price && <span className="text-[10px] opacity-20 line-through">{p.old_price.toLocaleString()} ₸</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 opacity-20 whitespace-nowrap">{p.old_price ? `${p.old_price.toLocaleString()} ₸` : "—"}</td>
                    {/* Размеры */}
                    <td className="px-4 py-3 text-xs whitespace-nowrap opacity-80">{g("dimensions")}</td>
                    {/* Материал ножек */}
                    <td className="px-4 py-3 text-xs whitespace-nowrap opacity-80">{g("legs_material")}</td>
                    {/* Материал столешницы */}
                    <td className="px-4 py-3 text-xs whitespace-nowrap opacity-80">{g("tabletop_material")}</td>
                    {/* Толщина столешницы */}
                    <td className="px-4 py-3 text-xs whitespace-nowrap opacity-80">{g("tabletop_thickness")}</td>
                    {/* Просвет от пола */}
                    <td className="px-4 py-3 text-xs whitespace-nowrap opacity-80">{g("floor_clearance")}</td>
                    {/* Максимальная нагрузка */}
                    <td className="px-4 py-3 text-xs whitespace-nowrap opacity-80">{g("max_load")}</td>
                    {/* Регулировка опор */}
                    <td className="px-4 py-3 text-xs whitespace-nowrap opacity-80">{g("legs_adjustment")}</td>
                    {/* Цвет столешницы */}
                    <td className="px-4 py-3 text-xs whitespace-nowrap opacity-80">{g("tabletop_color")}</td>
                    {/* Подпятники */}
                    <td className="px-4 py-3 text-xs whitespace-nowrap opacity-80">{g("footings")}</td>
                    {/* Гарантия */}
                    <td className="px-4 py-3 text-xs whitespace-nowrap opacity-80">{g("warranty")}</td>
                    {/* Вариант доставки */}
                    <td className="px-4 py-3 text-xs whitespace-nowrap opacity-80">{g("delivery_format")}</td>
                    {/* Цвет */}
                    <td className="px-4 py-3 text-xs whitespace-nowrap opacity-80">{g("color")}</td>
                    {/* Опоры */}
                    <td className="px-4 py-3 text-xs whitespace-nowrap opacity-80">{g("supports")}</td>
                    {/* Страна */}
                    <td className="px-4 py-3 text-xs whitespace-nowrap opacity-80">{g("country")}</td>
                    {/* Серия */}
                    <td className="px-4 py-3 text-xs whitespace-nowrap opacity-80">{g("series")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Пагинация продуктов */}
      {!loading && filtered.length > 0 && (
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
              {page} / {Math.ceil(filtered.length / pageSize)}
            </span>
            <button
              onClick={() => setPage(p => Math.min(Math.ceil(filtered.length / pageSize), p + 1))}
              disabled={page === Math.ceil(filtered.length / pageSize)}
              className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl font-bold uppercase text-xs disabled:opacity-20 transition-all"
            >
              Вперёд
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════ MODAL: Add / Edit Product ═══════════════ */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setModal(null); setImagePreview(null); }}>
          <div className="glass rounded-[2rem] p-10 w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-outfit font-black uppercase mb-8 text-gradient">
              {modal === "add" ? "Новый товар" : `Редактирование: ${editTarget?.name}`}
            </h2>

            <div className="space-y-4">
              {/* ── Image Upload ── */}
              <div>
                <label className="block text-xs font-bold uppercase opacity-40 mb-2">Фото товара</label>
                <div className="flex items-start gap-4">
                  {/* Preview */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-28 h-28 rounded-2xl bg-white/5 border-2 border-dashed border-white/10 hover:border-[var(--accent)]/50 cursor-pointer transition-all flex items-center justify-center overflow-hidden shrink-0"
                  >
                    {uploading ? (
                      <span className="text-xs opacity-40 animate-pulse">Загрузка...</span>
                    ) : imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto opacity-30 mb-1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                        <span className="text-[10px] opacity-30 font-bold">Нажмите</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <div className="flex-1">
                    <p className="text-xs opacity-40 mb-2">JPEG, PNG, WebP или GIF. Макс. 5 MB.</p>
                    {form.image_url && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono opacity-60 truncate flex-1">{form.image_url}</span>
                        <button
                          type="button"
                          onClick={() => { setForm({...form, image_url: ""}); setImagePreview(null); }}
                          className="text-red-400 text-xs font-bold hover:underline shrink-0"
                        >
                          Удалить
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Название */}
              <div>
                <label className="block text-xs font-bold uppercase opacity-40 mb-1">Название</label>
                <input
                  value={form.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setForm(prev => {
                      // автогенерация slug если он был пустым или совпадал с предыдущим slug-ом названия
                      const isSlugPristine = prev.slug === "" || prev.slug === slugify(prev.name);
                      return { ...prev, name: newName, slug: isSlugPristine ? slugify(newName) : prev.slug };
                    });
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all"
                  placeholder="Стул 'Осло'"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-bold uppercase opacity-40 mb-1">Slug (URL)</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] font-mono text-sm transition-all"
                  placeholder="oslo-oak-chair"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase opacity-40 mb-1">Новая цена (₸)</label>
                  <input
                    type="number"
                    value={form.new_price}
                    onChange={(e) => setForm({ ...form, new_price: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase opacity-40 mb-1">Старая цена (₸)</label>
                  <input
                    type="number"
                    value={form.old_price}
                    onChange={(e) => setForm({ ...form, old_price: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase opacity-40 mb-1">Категория</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

              {/* Материал + Цвет */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase opacity-40 mb-1">Материал</label>
                  <input
                    value={form.material}
                    onChange={(e) => setForm({ ...form, material: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all"
                    placeholder="oak, leather..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase opacity-40 mb-1">Цвет</label>
                  <input
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all"
                    placeholder="natural, black..."
                  />
                </div>
              </div>

              {/* Описание */}
              <div>
                <label className="block text-xs font-bold uppercase opacity-40 mb-1">Описание</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] resize-none transition-all"
                  placeholder="Краткое описание товара..."
                />
              </div>

              {/* Явные Характеристики */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <label className="block text-xs font-bold uppercase opacity-60 mb-4">Основные спецификации</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "dimensions", label: "Размеры" },
                    { key: "legs_material", label: "Материал ножек (опор)" },
                    { key: "tabletop_material", label: "Материал столешницы" },
                    { key: "tabletop_thickness", label: "Толщина столешницы" },
                    { key: "floor_clearance", label: "Просвет от пола" },
                    { key: "max_load", label: "Максимальная нагрузка" },
                    { key: "legs_adjustment", label: "Регулировка опор" },
                    { key: "tabletop_color", label: "Цвет столешницы" },
                    { key: "footings", label: "Подпятники" },
                    { key: "warranty", label: "Гарантия" },
                    { key: "delivery_format", label: "Вариант доставки" },
                    { key: "supports", label: "Опоры" },
                    { key: "country", label: "Страна" },
                    { key: "series", label: "Серия" },
                  ].map((field) => (
                    <div key={field.key}>
                      <span className="block text-[10px] uppercase opacity-40 mb-1">{field.label}</span>
                      <input
                        value={(form as any)[field.key]}
                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-[var(--accent)] text-xs transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Характеристики (Динамические) */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-xs font-bold uppercase opacity-60">Дополнительные характеристики</label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, characteristics: [...form.characteristics, { k: "", v: "" }] })}
                    className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1.5 rounded-lg hover:bg-[var(--accent)]/20 transition-all"
                  >
                    + Добавить
                  </button>
                </div>
                
                {form.characteristics.length === 0 ? (
                  <p className="text-xs text-center opacity-30 italic py-2">Спецификации пока не заданы (Ширина, Бренд и т.д.)</p>
                ) : (
                  <div className="space-y-3">
                    {form.characteristics.map((char, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          value={char.k}
                          onChange={(e) => {
                            const newChars = [...form.characteristics];
                            newChars[index].k = e.target.value;
                            setForm({ ...form, characteristics: newChars });
                          }}
                          placeholder="Например: Гарантия"
                          className="w-1/3 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all text-sm"
                        />
                        <input
                          value={char.v}
                          onChange={(e) => {
                            const newChars = [...form.characteristics];
                            newChars[index].v = e.target.value;
                            setForm({ ...form, characteristics: newChars });
                          }}
                          placeholder="12 месяцев"
                          className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newChars = [...form.characteristics];
                            newChars.splice(index, 1);
                            setForm({ ...form, characteristics: newChars });
                          }}
                          className="px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-all flex items-center justify-center shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

               <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <label className="block text-xs font-bold uppercase opacity-60">Параметры акции</label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.show_timer}
                      onChange={(e) => setForm({ ...form, show_timer: e.target.checked })}
                      className="w-5 h-5 accent-[var(--accent)]"
                    />
                    <span className="text-sm font-bold uppercase tracking-wider group-hover:text-[var(--accent)] transition-colors">Показывать таймер</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase opacity-40 mb-2">Начало акции</label>
                    <input
                      type="datetime-local"
                      value={form.promo_start}
                      onChange={(e) => setForm({ ...form, promo_start: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase opacity-40 mb-2">Конец акции</label>
                    <input
                      type="datetime-local"
                      value={form.promo_end}
                      onChange={(e) => setForm({ ...form, promo_end: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] text-sm transition-all"
                    />
                  </div>
                </div>
                <p className="text-[10px] opacity-25 mt-4 leading-relaxed">
                  * Если таймер включен, на странице товара будет отображаться обратный отсчет до конца акции, а цена будет выделена красным.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Активность */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col justify-center">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="w-5 h-5 accent-[var(--accent)]"
                    />
                    <span className="text-sm font-bold uppercase tracking-wider">Активен (Виден на сайте)</span>
                  </label>
                </div>

                {/* Бестселлер */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col justify-center">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_bestseller}
                      onChange={(e) => setForm({ ...form, is_bestseller: e.target.checked })}
                      className="w-5 h-5 accent-[var(--accent)]"
                    />
                    <span className="text-sm font-bold uppercase tracking-wider">Бестселлер (На главную)</span>
                  </label>
                </div>
              </div>

              {/* Статус наличия */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <label className="block text-xs font-bold uppercase opacity-60 mb-2">Наличие</label>
                <select
                  value={form.availability_status}
                  onChange={(e) => setForm({ ...form, availability_status: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all text-sm font-bold"
                >
                  <option value="in_stock">В наличии (In Stock)</option>
                  <option value="on_order">Под заказ (Made to Order)</option>
                  <option value="out_of_stock">Нет в наличии (Out of Stock)</option>
                </select>
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.slug}
                className="flex-1 bg-[var(--foreground)] text-[var(--background)] py-4 rounded-2xl font-black uppercase tracking-wider hover:bg-[var(--accent)] transition-all disabled:opacity-40"
              >
                {saving ? "Сохраняем..." : modal === "add" ? "Добавить" : "Сохранить"}
              </button>
              <button
                onClick={() => { setModal(null); setImagePreview(null); }}
                className="px-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold uppercase tracking-wider transition-all"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ MODAL: Bulk Import ═══════════════ */}
      {showImport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowImport(false)}>
          <div className="glass rounded-[2rem] p-10 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-outfit font-black uppercase mb-2 text-gradient">Импорт из Excel</h2>
            <p className="text-sm opacity-40 mb-8">Загрузите файл .xlsx. Первая строка — заголовки.</p>

            {/* Формат файла */}
            <div className="bg-white/5 rounded-xl p-4 mb-4">
              <p className="text-xs font-bold uppercase opacity-40 mb-2">Столбцы в файле:</p>
              <div className="flex flex-wrap gap-2">
                {["name*", "new_price*", "old_price", "category_id*", "slug", "material", "color", "description", "image_url", "is_active"].map((col) => (
                  <span
                    key={col}
                    className={`text-xs font-mono px-2 py-1 rounded-lg ${
                      col.includes("*")
                        ? "bg-[var(--accent)]/20 text-[var(--accent)] font-bold"
                        : "bg-white/5 opacity-60"
                    }`}
                  >
                    {col.replace("*", "")}
                    {col.includes("*") && <span className="text-[var(--accent)]"> *</span>}
                  </span>
                ))}
              </div>
              <p className="text-[10px] opacity-30 mt-2">* — обязательные поля. <strong>description</strong> — описание товара, <strong>image_url</strong> — ссылка на фото.</p>
            </div>

            {/* Download Template */}
            <button
              onClick={() => {
                const link = document.createElement("a");
                const token = localStorage.getItem("token");
                // Для авторизации добавляем токен через fetch
                fetch(`${API_URL}/catalog/products/template`, {
                  headers: { "Authorization": `Bearer ${token}` },
                }).then(res => res.blob()).then(blob => {
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "products_import_template.xlsx";
                  a.click();
                  URL.revokeObjectURL(url);
                });
              }}
              className="w-full mb-6 py-3 border border-dashed border-[var(--accent)]/30 rounded-xl text-sm font-bold text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Скачать шаблон с примерами
            </button>

            {/* File Input */}
            <div className="mb-6">
              <input
                ref={bulkFileRef}
                type="file"
                accept=".xlsx,.xls"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-[var(--accent)]/20 file:text-[var(--accent)] hover:file:bg-[var(--accent)]/30 cursor-pointer"
              />
            </div>

            {/* Import Result */}
            {importResult && (
              <div className={`rounded-xl p-4 mb-6 ${importResult.ok ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                {importResult.ok ? (
                  <>
                    <p className="text-green-400 font-bold">✅ Импорт завершён!</p>
                    <p className="text-sm opacity-60 mt-1">
                      Создано: <strong>{importResult.data.created}</strong> | 
                      Пропущено: <strong>{importResult.data.skipped}</strong> | 
                      Ошибок: <strong>{importResult.data.errors?.length ?? 0}</strong>
                    </p>
                    {importResult.data.errors?.length > 0 && (
                      <div className="mt-3 max-h-32 overflow-y-auto">
                        {importResult.data.errors.map((err: any, i: number) => (
                          <p key={i} className="text-xs text-red-400 opacity-80">
                            Строка {err.row}: {err.error}
                          </p>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-red-400 font-bold">❌ {importResult.error}</p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleBulkImport}
                disabled={importing}
                className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-wider hover:bg-emerald-600 transition-all disabled:opacity-40"
              >
                {importing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Импортируем...
                  </span>
                ) : "Импортировать"}
              </button>
              <button
                onClick={() => setShowImport(false)}
                className="px-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold uppercase tracking-wider transition-all"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
