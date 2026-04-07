"use client";

import { useState } from "react";
import { createOrder } from "@/lib/api";

export default function OrderForm({ productId, productName }: { productId: number, productName: string }) {
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    const success = await createOrder({
      customer_name: formData.name,
      customer_phone: formData.phone,
      product_id: productId,
    });

    if (success) {
      setStatus("success");
      setFormData({ name: "", phone: "" });
    } else {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="glass p-8 rounded-3xl text-center animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
        <h3 className="text-2xl font-black uppercase mb-2">Заявка принята!</h3>
        <p className="opacity-60">Наш дизайнер свяжется с вами в ближайшее время.</p>
        <button onClick={() => setStatus("idle")} className="mt-6 text-[var(--accent)] font-bold hover:underline">Отправить еще раз</button>
      </div>
    );
  }

  return (
    <div className="glass p-8 rounded-3xl">
      <h3 className="text-2xl font-black uppercase mb-2 text-gradient">Узнать подробнее</h3>
      <p className="text-sm opacity-60 mb-6">Оставьте контакты, и мы рассчитаем стоимость с доставкой до вашего дома.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1 opacity-40">Ваше имя</label>
          <input 
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[var(--accent)] transition-all"
            placeholder="Александр"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1 opacity-40">Телефон</label>
          <input 
            required
            type="tel"
            value={formData.phone}
            onChange={(e) => {
              let val = e.target.value.replace(/\D/g, ""); // Только цифры
              
              if (val.startsWith("7") || val.startsWith("8")) {
                val = val.substring(1);
              }
              
              val = val.substring(0, 10);
              
              if (val.length === 0) {
                setFormData({...formData, phone: ""});
                return;
              }

              let masked = "+7";
              if (val.length > 0) masked += " " + val.substring(0, 3);
              if (val.length > 3) masked += " " + val.substring(3, 6);
              if (val.length > 6) masked += " " + val.substring(6, 8);
              if (val.length > 8) masked += " " + val.substring(8, 10);
              
              setFormData({...formData, phone: masked});
            }}
            onFocus={(e) => {
              if (!formData.phone) setFormData({...formData, phone: "+7 "});
            }}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[var(--accent)] transition-all font-mono"
            placeholder="+7 777 777 77 77"
            maxLength={16}
          />
        </div>
        <button 
          disabled={status === "loading"}
          className="w-full bg-[var(--accent)] py-5 rounded-2xl font-black uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {status === "loading" ? "Отправка..." : `Заказать ${productName}`}
        </button>
        {status === "error" && <p className="text-red-500 text-sm text-center">Ошибка! Попробуйте позже.</p>}
      </form>
    </div>
  );
}
