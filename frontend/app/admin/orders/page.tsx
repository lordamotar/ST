"use client";

import { useState } from "react";
import { getOrders, API_URL } from "@/lib/api";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new:         { label: "Новый",        color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  in_progress: { label: "В работе",    color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  completed:   { label: "Завершён",    color: "bg-green-500/15 text-green-400 border-green-500/30" },
  cancelled:   { label: "Отменён",     color: "bg-red-500/15 text-red-400 border-red-500/30" },
};

const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([value, { label }]) => ({ value, label }));

export default function AdminOrders() {
  const [token, setToken] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [isLogged, setIsLogged] = useState(false);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await getOrders(token);
    if (data) {
      setOrders(data);
      setIsLogged(true);
      setError("");
    } else {
      setError("Неверный Admin Token. Проверьте JWT_SECRET в .env бэкенда.");
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "admin-token": token,
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

  if (!isLogged) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="glass p-12 rounded-[3rem] w-full max-w-md text-center">
          <h1 className="text-3xl font-outfit font-black uppercase mb-8 text-gradient">Админ-панель</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-40">Введите Admin Token</label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[var(--accent)] text-center text-xl"
                placeholder="••••••••"
              />
            </div>
            <button className="w-full bg-[var(--foreground)] text-[var(--background)] py-5 rounded-2xl font-black uppercase tracking-wider hover:bg-[var(--accent)] transition-all">
              Войти
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-20 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-16">
        <div>
          <h1 className="text-5xl font-outfit font-black uppercase text-gradient">Входящие заявки</h1>
          <p className="opacity-40 font-medium mt-1">Всего заявок: {orders.length}</p>
        </div>
        <button onClick={() => setIsLogged(false)} className="text-xs font-bold uppercase tracking-tighter opacity-40 hover:opacity-100 transition-all">
          Выйти
        </button>
      </div>

      <div className="grid gap-6">
        {orders.map((order: any) => {
          const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["new"];
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
                <span className="font-bold">Продукт #{order.product_id}</span>
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

        {orders.length === 0 && (
          <div className="h-[40vh] flex items-center justify-center glass rounded-3xl opacity-30">
            <p className="text-3xl font-bold uppercase">Заявок пока нет</p>
          </div>
        )}
      </div>
    </div>
  );
}
