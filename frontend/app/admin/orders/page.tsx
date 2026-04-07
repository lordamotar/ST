"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getOrders, API_URL } from "@/lib/api";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new:         { label: "Новый",        color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  in_progress: { label: "В работе",    color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  completed:   { label: "Завершён",    color: "bg-green-500/15 text-green-400 border-green-500/30" },
  cancelled:   { label: "Отменён",     color: "bg-red-500/15 text-red-400 border-red-500/30" },
};

const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([value, { label }]) => ({ value, label }));

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);
  const router = useRouter();
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const PAGE_SIZES = [10, 25, 50, 100];

  // View Mode
  const [viewMode, setViewMode] = useState<"table" | "list">("table");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const matchSearch = !q || o.customer_name?.toLowerCase().includes(q) || o.customer_phone?.includes(q) || o.product?.name?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    
    getOrders().then(data => {
      if (data) {
        setOrders(data);
      } else {
        localStorage.removeItem("token");
        router.push("/login");
      }
    }).catch(() => {
        router.push("/login");
    }).finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      }
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="p-12 text-center opacity-40 uppercase tracking-[0.3em] text-xs font-black">Загрузка данных...</div>;

  return (
    <div className="max-w-7xl mx-auto px-8 py-20 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-5xl font-outfit font-black uppercase text-gradient">Входящие заявки</h1>
          <p className="opacity-40 font-medium mt-1">Всего заявок: {orders.length}</p>
        </div>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <button 
          onClick={() => setViewMode("table")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
            viewMode === "table" ? "bg-white/15 text-white" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
          }`}
        >
          Таблица
        </button>
        <button 
          onClick={() => setViewMode("list")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
            viewMode === "list" ? "bg-white/15 text-white" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
          }`}
        >
          Список
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6 p-3 bg-white/3 rounded-2xl border border-white/5">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 opacity-25" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Поиск по имени, телефону или товару..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-white/5 border border-white/8 rounded-xl pl-8 pr-4 py-2 text-sm text-white/70 placeholder:text-white/25 outline-none focus:border-white/20 transition-all"
          />
          {search && (
            <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-all">×</button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-[#111] border border-white/8 rounded-xl px-4 py-2 text-sm text-white/60 outline-none focus:border-white/20 transition-all min-w-[150px] cursor-pointer"
        >
          <option value="" className="bg-[#111] text-white/60">Все статусы</option>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-[#111] text-white/80">{o.label}</option>)}
        </select>
        {(search || statusFilter) && (
          <button
            onClick={() => { setSearch(""); setStatusFilter(""); setPage(1); }}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-white/40 hover:text-white/70 font-medium uppercase transition-all"
          >
            Сброс
          </button>
        )}
        <span className="self-center text-xs text-white/25 font-medium ml-auto">{filtered.length} / {orders.length}</span>
      </div>

      {/* Списочная часть */}
      {orders.length === 0 ? (
        <div className="h-[40vh] flex items-center justify-center glass rounded-3xl opacity-30 mt-4">
          <p className="text-3xl font-bold uppercase">Заявок пока нет</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="h-32 flex items-center justify-center glass rounded-2xl opacity-40">
          <p className="font-bold uppercase">Ничего не найдено</p>
        </div>
      ) : viewMode === "list" ? (
        <div className="space-y-4">
          {filtered.slice((page - 1) * pageSize, page * pageSize).map((order) => {
            const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG["new"];
            return (
              <div key={order.id} className="glass p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-8 hover:border-[var(--accent)]/30 transition-all border border-transparent">
                {/* ID + Клиент */}
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-[var(--accent)]/10 text-[var(--accent)] rounded-2xl flex items-center justify-center font-bold text-xl shrink-0">
                    #{order.id}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold uppercase">{order.customer_name}</h4>
                    <p className="font-outfit text-lg text-[var(--accent)] font-medium">{order.customer_phone}</p>
                  </div>
                </div>

                {/* Товар + Сообщение */}
                <div className="bg-white/5 p-4 rounded-2xl flex-1 max-w-sm">
                  <span className="block text-[10px] font-bold uppercase opacity-40 mb-1">Товар</span>
                  <span className="font-bold">{order.product?.name || `Продукт #${order.product_id}`}</span>
                  {order.message && <p className="text-sm mt-1 italic opacity-60">«{order.message}»</p>}
                </div>

                {/* Дата */}
                <div className="text-right shrink-0">
                  <span className="block text-xs opacity-40 font-bold uppercase mb-1">Дата заявки</span>
                  <span className="font-medium text-sm">
                    {new Date(order.created_at).toLocaleDateString()} в {new Date(order.created_at).toLocaleTimeString()}
                  </span>
                </div>

                {/* Статус */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                  <select
                    value={order.status}
                    disabled={updating === order.id}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:border-[var(--accent)] cursor-pointer disabled:opacity-40 transition-all"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#0a0a0a]">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass rounded-[2rem] overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-xs font-bold uppercase opacity-60">
                <th className="px-6 py-4">№ ЗАКАЗА</th>
                <th className="px-6 py-4">ИМЯ КЛИЕНТА</th>
                <th className="px-6 py-4">ТЕЛЕФОН</th>
                <th className="px-6 py-4">ТОВАР</th>
                <th className="px-6 py-4">ДАТА ЗАКАЗА</th>
                <th className="px-6 py-4">КТО ОБРАБОТАЛ</th>
                <th className="px-6 py-4">ДАТА ИЗМЕНЕНИЯ</th>
                <th className="px-6 py-4 text-right">СТАТУС</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium">
              {filtered.slice((page - 1) * pageSize, page * pageSize).map((order) => {
                const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG["new"];
                return (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="px-6 py-4 font-bold text-[var(--accent)]">#{order.id}</td>
                    <td className="px-6 py-4">{order.customer_name}</td>
                    <td className="px-6 py-4 font-mono">{order.customer_phone}</td>
                    <td className="px-6 py-4 italic max-w-[200px] truncate" title={order.product?.name || `Продукт #${order.product_id}`}>
                      {order.product?.name || `Продукт #${order.product_id}`}
                    </td>
                    <td className="px-6 py-4 opacity-80">{new Date(order.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4 opacity-80">{order.processed_by || "—"}</td>
                    <td className="px-6 py-4 opacity-80">
                      {order.updated_at ? new Date(order.updated_at).toLocaleString() : "—"}
                      {order.modified_by && <span className="block text-[10px] opacity-50">{order.modified_by}</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={order.status}
                        disabled={updating === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`bg-white/5 border border-white/10 rounded-xl px-3 py-1 outline-none text-xs font-bold ${statusCfg.color} cursor-pointer disabled:opacity-40 transition-all`}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-[#0a0a0a]">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Пагинация заказов */}
      {filtered.length > 0 && (
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
    </div>
  );
}
