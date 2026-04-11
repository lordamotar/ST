"use client";

import { useState, useEffect } from "react";
import { getAllSettings, updateSetting } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminSettings() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const fetchSettings = async () => {
    const data = await getAllSettings();
    setSettings(data);
    setLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchSettings();
  }, [router]);

  const handleUpdate = async (key: string, value: string) => {
    setSaving(key);
    try {
      await updateSetting(key, value);
      setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
      setMessage(`Настройка "${key}" сохранена`);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Ошибка при сохранении");
    } finally {
      setSaving(null);
    }
  };

  const getS = (key: string) => settings.find(s => s.key === key)?.value || "";

  const handleChange = (key: string, value: string) => {
    setSettings(prev => {
      if (prev.find(s => s.key === key)) {
        return prev.map(s => s.key === key ? { ...s, value } : s);
      } else {
        return [...prev, { key, value }];
      }
    });
  };

  if (loading) return <div className="p-8">Загрузка...</div>;

  const sections = [
    {
      title: "Основные",
      keys: [
        { key: "whatsapp_number", label: "WhatsApp (без +)", hint: "Для оформления заказов и в футере" },
      ]
    },
    {
      title: "Главная: Первый экран (Hero)",
      keys: [
        { key: "home_hero_badge", label: "Верхняя надпись (Badge)", hint: "Например: Premium Furniture 2026" },
        { key: "home_hero_title", label: "Заголовок (HTML разрешен)", hint: "Используйте <br/> для переноса" },
        { key: "home_hero_subtitle", label: "Подзаголовок", hint: "" },
      ]
    },
    {
      title: "Главная: Шоурум (Craftsmanship)",
      keys: [
        { key: "home_craft_badge", label: "Бейдж секции", hint: "Например: Our Craftsmanship" },
        { key: "home_craft_title", label: "Заголовок", hint: "" },
        { key: "home_craft_subtitle", label: "Описание", hint: "" },
      ]
    },
    {
      title: "Главная: CTA (Призыв к действию)",
      keys: [
        { key: "home_cta_title", label: "Заголовок CTA", hint: "" },
        { key: "home_cta_subtitle", label: "Текст CTA", hint: "" },
      ]
    },
    {
      title: "Социальные сети",
      keys: [
        { key: "social_instagram", label: "Instagram URL", hint: "Полная ссылка" },
        { key: "social_telegram", label: "Telegram URL", hint: "Полная ссылка или t.me/..." },
      ]
    }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-black uppercase mb-12">Настройки сайта</h1>
      
      {message && (
        <div className={`fixed bottom-8 right-8 p-4 rounded-2xl font-bold shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4 ${message.includes("Ошибка") ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}>
          {message}
        </div>
      )}

      <div className="space-y-12">
        {sections.map((section) => (
          <div key={section.title} className="glass p-8 rounded-[2.5rem] border-white/5 bg-white/[0.01]">
            <h2 className="text-xl font-black uppercase tracking-tighter mb-8 text-[var(--accent)]">{section.title}</h2>
            <div className="grid grid-cols-1 gap-8">
              {section.keys.map((s) => (
                <div key={s.key} className="relative group">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-3 opacity-30">
                    {s.label}
                  </label>
                  <div className="flex gap-4">
                    <input 
                      type="text"
                      value={getS(s.key)}
                      onChange={(e) => handleChange(s.key, e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[var(--accent)] transition-all text-sm font-medium"
                    />
                    <button 
                      onClick={() => handleUpdate(s.key, getS(s.key))}
                      disabled={saving === s.key}
                      className="bg-white/5 hover:bg-[var(--accent)] hover:text-black px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all disabled:opacity-50"
                    >
                      {saving === s.key ? "..." : "Save"}
                    </button>
                  </div>
                  {s.hint && <p className="mt-2 text-[10px] opacity-20 font-medium">{s.hint}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
