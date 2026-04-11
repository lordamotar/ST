"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  getDashboardStats, 
  BASE_URL 
} from "@/lib/api";
import { 
  ShoppingBag, 
  Users, 
  Package, 
  TrendingUp, 
  AlertCircle, 
  Plus, 
  FileDown, 
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend
} from "recharts";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(7); // 7, 14, 30
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [isCustom, setIsCustom] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchData();
  }, [router, range, customRange, isCustom]);

  const fetchData = async () => {
    try {
      const params: any = {};
      if (isCustom && customRange.start && customRange.end) {
        params.start_date = customRange.start;
        params.end_date = customRange.end;
      } else {
        params.days = range;
      }
      
      const stats = await getDashboardStats(params);
      setData(stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
        <span className="font-black uppercase tracking-widest text-xs opacity-40">Загрузка аналитики...</span>
      </div>
    </div>
  );

  if (!data) return <div className="p-8">Ошибка загрузки данных.</div>;

  const COLORS = ['#FFBB28', '#0088FE', '#00C49F', '#FF8042'];

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'new': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">Обзор бизнеса</h1>
          <p className="opacity-40 font-medium">Статистика продаж и ключевые показатели эффективности</p>
        </div>
        <div className="flex gap-4">
            <button 
                onClick={() => router.push('/admin/products')}
                className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl flex items-center gap-2 transition-all border border-white/5 active:scale-95"
            >
                <Plus className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Товар</span>
            </button>
            <button className="bg-[var(--accent)] text-black p-4 px-6 rounded-2xl flex items-center gap-2 transition-all font-black uppercase text-[10px] tracking-widest hover:opacity-90 active:scale-95">
                <FileDown className="w-4 h-4" />
                <span>Отчет</span>
            </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Всего заказов", value: data.kpi.total_orders, sub: `${data.kpi.new_orders} новых`, icon: <ShoppingBag />, color: "border-blue-500/20" },
          { label: "Выручка", value: `${data.kpi.total_revenue.toLocaleString()} ₸`, sub: "Общая сумма", icon: <TrendingUp />, color: "border-emerald-500/20" },
          { label: "В каталоге", value: data.kpi.total_products, sub: "Активных товаров", icon: <Package />, color: "border-amber-500/20" },
          { label: "Клиенты", value: data.kpi.total_clients, sub: "Зарегистрировано", icon: <Users />, color: "border-purple-500/20" },
        ].map((card, i) => (
          <div key={i} className={`glass p-6 rounded-[2.5rem] border ${card.color} flex items-center gap-6 group hover:translate-y-[-4px] transition-all`}>
            <div className="w-14 h-14 rounded-3xl bg-white/5 flex items-center justify-center text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-black transition-colors duration-500">
              {card.icon}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 block mb-1">{card.label}</span>
              <span className="text-2xl font-black font-outfit block">{card.value}</span>
              <span className="text-[9px] font-bold uppercase tracking-widest opacity-20">{card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Line Chart */}
        <div className="lg:col-span-2 glass rounded-[3rem] p-8 border border-white/5 h-[450px] flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h3 className="text-lg font-black uppercase tracking-tight">Динамика заказов</h3>
            
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 overflow-hidden">
                {[7, 14, 30].map((d) => (
                    <button 
                        key={d}
                        onClick={() => { setRange(d); setIsCustom(false); }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${range === d && !isCustom ? 'bg-[var(--accent)] text-black' : 'opacity-40 hover:opacity-100'}`}
                    >
                        {d}д
                    </button>
                ))}
                <button 
                    onClick={() => setIsCustom(true)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${isCustom ? 'bg-[var(--accent)] text-black' : 'opacity-40 hover:opacity-100'}`}
                >
                    Период
                </button>
            </div>
          </div>

          {isCustom && (
              <div className="flex items-center gap-4 mb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex-1 flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                      <span className="text-[9px] font-black uppercase opacity-30">От:</span>
                      <input 
                        type="date" 
                        value={customRange.start}
                        onChange={(e) => setCustomRange({...customRange, start: e.target.value})}
                        className="bg-transparent border-none outline-none text-xs font-bold w-full"
                      />
                  </div>
                  <div className="flex-1 flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                      <span className="text-[9px] font-black uppercase opacity-30">До:</span>
                      <input 
                        type="date" 
                        value={customRange.end}
                        onChange={(e) => setCustomRange({...customRange, end: e.target.value})}
                        className="bg-transparent border-none outline-none text-xs font-bold w-full"
                      />
                  </div>
              </div>
          )}

          <div className="flex-1 w-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.charts.orders_daily || []}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f3ff4d" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f3ff4d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#ffffff20', fontSize: 10}}
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#ffffff20', fontSize: 10}}
                />
                <Tooltip 
                  contentStyle={{backgroundColor: '#111', borderRadius: '16px', border: '1px solid #ffffff10', fontSize: '12px'}}
                  itemStyle={{color: '#f3ff4d'}}
                />
                <Area type="monotone" dataKey="orders" stroke="#f3ff4d" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="glass rounded-[3rem] p-8 border border-white/5 h-[450px] flex flex-col">
          <h3 className="text-lg font-black uppercase tracking-tight mb-8">Статусы заказов</h3>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.charts.status_distribution || []}
                  cx="50%"
                  cy="45%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {data.charts.status_distribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom Legend */}
            <div className="absolute bottom-4 left-0 w-full grid grid-cols-2 gap-4 px-4">
                {(data.charts.status_distribution || []).map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{item.name} ({item.value})</span>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Products & Categories Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="glass rounded-[3rem] p-8 border border-white/5 h-[400px] flex flex-col">
          <h3 className="text-lg font-black uppercase tracking-tight mb-8 text-[var(--accent)]">Топ-5 товаров</h3>
          <div className="flex-1 w-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={data.charts.top_products} margin={{ left: -20, right: 30 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#ffffff60', fontSize: 10}} width={120} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{backgroundColor: '#111', borderRadius: '12px', border: '1px solid #ffffff10', fontSize: '12px'}}
                />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                  {(data.charts.top_products || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#f3ff4d' : '#f3ff4d60'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Categories */}
        <div className="glass rounded-[3rem] p-8 border border-white/5 h-[400px] flex flex-col">
          <h3 className="text-lg font-black uppercase tracking-tight mb-8">Популярные категории</h3>
          <div className="flex-1 w-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.top_categories} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#ffffff40', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#ffffff40', fontSize: 10}} />
                <Tooltip 
                   cursor={{fill: 'white', opacity: 0.05}}
                   contentStyle={{backgroundColor: '#111', borderRadius: '12px', border: '1px solid #ffffff10', fontSize: '12px'}}
                />
                <Bar dataKey="value" fill="#0088FE" radius={[10, 10, 0, 0]} barSize={40}>
                   {(data.charts.top_categories || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Orders & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 glass rounded-[3rem] border border-white/5 overflow-hidden flex flex-col">
           <div className="p-8 border-b border-white/5 flex justify-between items-center">
             <h3 className="text-lg font-black uppercase tracking-tight">Последние заказы</h3>
             <button 
                onClick={() => router.push('/admin/orders')}
                className="text-[var(--accent)] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all"
             >
                 Все заказы <ArrowRight className="w-3 h-3" />
             </button>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-white/5">
                   <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-20">ID / Дата</th>
                   <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-20">Клиент / Товар</th>
                   <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-20">Статус</th>
                   <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-20">Действие</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {(data.recent_orders || []).map((order: any) => (
                   <tr key={order.id} className="group hover:bg-white/[0.02] transition-colors">
                     <td className="p-6">
                        <span className="text-xs font-black block mb-1">#{order.id}</span>
                        <span className="text-[10px] opacity-30 uppercase font-medium">{new Date(order.date).toLocaleDateString()}</span>
                     </td>
                     <td className="p-6">
                        <span className="text-xs font-bold block mb-1 line-clamp-1">{order.customer}</span>
                        <span className="text-[10px] opacity-40 uppercase tracking-tight line-clamp-1">{order.product}</span>
                     </td>
                     <td className="p-6">
                        <div className="flex items-center gap-2">
                           {getStatusIcon(order.status)}
                           <span className="text-[10px] font-black uppercase tracking-wider opacity-60">{order.status}</span>
                        </div>
                     </td>
                     <td className="p-6">
                        <button 
                            onClick={() => router.push('/admin/orders')}
                            className="p-3 rounded-xl bg-white/5 hover:bg-[var(--accent)] hover:text-black transition-all"
                        >
                            <ArrowRight className="w-3 h-3" />
                        </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="space-y-6">
            <div className="glass rounded-[2.5rem] p-8 border border-white/5 space-y-8">
                <h3 className="text-lg font-black uppercase tracking-tight mb-4">Уведомления</h3>
                
                <div className="space-y-6">
                    {data.alerts.new_orders_count > 0 && (
                        <div className="flex gap-5 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 group hover:bg-amber-500/20 transition-all cursor-pointer" onClick={() => router.push('/admin/orders?status=new')}>
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <span className="text-[10px] font-black uppercase text-amber-500 block mb-1 tracking-widest">Новые заказы</span>
                                <p className="text-xs font-medium opacity-60">У вас {data.alerts.new_orders_count} необработанных заявок</p>
                            </div>
                        </div>
                    )}

                    {data.alerts.out_of_stock_count > 0 && (
                        <div className="flex gap-5 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 group hover:bg-red-500/20 transition-all cursor-pointer" onClick={() => router.push('/admin/products')}>
                            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <span className="text-[10px] font-black uppercase text-red-500 block mb-1 tracking-widest">Склад</span>
                                <p className="text-xs font-medium opacity-60">{data.alerts.out_of_stock_count} товаров закончились</p>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-5 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <span className="text-[10px] font-black uppercase text-emerald-500 block mb-1 tracking-widest">Система</span>
                            <p className="text-xs font-medium opacity-60">Синхронизация завершена успешно</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Mini Card */}
            <div className="glass rounded-[2.5rem] p-8 border border-white/5 bg-gradient-to-br from-[var(--accent)]/10 to-transparent">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Конверсия за месяц</span>
                    <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
                </div>
                <div className="text-4xl font-black font-outfit mb-2">4.8%</div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-emerald-500">+1.2% от прошлого месяца</div>
            </div>
        </div>

      </div>
    </div>
  );
}
