"use client";

import { useState, useEffect } from "react";
import { createOrder, getSetting } from "@/lib/api";

interface SiteSetting {
  key: string;
  value: string;
}

export default function OrderForm({ productId, productName }: { productId: number, productName: string }) {
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const [waNumber, setWaNumber] = useState("77770000000");

  useEffect(() => {
    getSetting("whatsapp_number").then((s: SiteSetting) => {
      console.log("Fetched WA Number from DB:", s.value);
      if (s && s.value) {
        const clean = s.value.replace(/\D/g, "");
        setWaNumber(clean);
        console.log("Cleaned WA Number set to state:", clean);
      }
    });
  }, []);

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
      const text = `Здравствуйте! Меня интересует "${productName}".\nСсылка: ${window.location.href}`;
      const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
      console.log("Opening WhatsApp URL:", url);
      // Попробуем открыть автоматически
      window.open(url, "_blank");
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
        <div className="flex flex-col gap-3 mt-8">
           <a 
             href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Здравствуйте! Меня интересует "${productName}".`)}`}
             target="_blank"
             className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-black uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2"
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="opacity-80"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884 0 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
             Чат в WhatsApp
           </a>
           <button onClick={() => setStatus("idle")} className="text-[10px] font-bold uppercase tracking-widest opacity-30 hover:opacity-100 transition-all">Отправить еще раз</button>
        </div>
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
