"use client";

import { useState, useEffect } from "react";
import { getSetting, updateSetting } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminSettings() {
  const [waNumber, setWaNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    getSetting("whatsapp_number").then((s) => {
      setWaNumber(s.value);
      setLoading(false);
    });
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await updateSetting("whatsapp_number", waNumber);
      setMessage("Настройки сохранены!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Ошибка при сохранении");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Загрузка...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-black uppercase mb-8">Настройки сайта</h1>
      
      <div className="glass p-8 rounded-3xl">
        <div className="mb-6">
          <label className="block text-sm font-bold uppercase tracking-widest mb-2 opacity-50">
            WhatsApp менеджера (без +)
          </label>
          <input 
            type="text"
            value={waNumber}
            onChange={(e) => setWaNumber(e.target.value)}
            placeholder="77001234567"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[var(--accent)] transition-all"
          />
          <p className="mt-2 text-xs opacity-40">
            Введите номер в международном формате без знака +, начиная с 7. На этот номер будет открываться чат при оформлении заказа.
          </p>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-[var(--accent)] px-8 py-4 rounded-xl font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "Сохранение..." : "Сохранить изменения"}
        </button>

        {message && (
          <p className={`mt-4 font-bold ${message.includes("Ошибка") ? "text-red-500" : "text-green-500"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
