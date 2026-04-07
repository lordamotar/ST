"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

export default function LoginPage() {
  const [formData, setFormData] = useState({ login: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await login(formData);
      localStorage.setItem("token", data.access_token);
      router.push("/admin/products"); // По умолчанию ведем в админку
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
        {/* Декоративный фон */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,_var(--accent)_0%,_transparent_40%)] opacity-10"></div>
        <div className="absolute inset-0 z-0 pattern-bg opacity-[0.03]"></div>

        <div className="w-full max-w-md z-10">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-outfit uppercase font-black tracking-tighter mb-4">Вход в систему</h1>
                <p className="text-white/40 uppercase tracking-widest text-xs font-black">Stoly-Sklad CRM</p>
            </div>

            <form onSubmit={handleSubmit} className="glass p-12 rounded-[3rem] border-white/5 space-y-6">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-2xl text-sm font-bold text-center">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-50 ml-2">Логин или Телефон</label>
                    <input 
                        required
                        type="text"
                        value={formData.login}
                        onChange={(e) => {
                          let val = e.target.value;
                          const isPhone = /^[0-9+]/.test(val);
                          
                          if (isPhone) {
                            let digits = val.replace(/\D/g, "");
                            if (digits.startsWith("7")) digits = digits.substring(1);
                            digits = digits.substring(0, 10);
                            
                            let formatted = "+7";
                            if (digits.length > 0) formatted += " " + digits.substring(0, 3);
                            if (digits.length > 3) formatted += " " + digits.substring(3, 6);
                            if (digits.length > 6) formatted += " " + digits.substring(6, 8);
                            if (digits.length > 8) formatted += " " + digits.substring(8, 10);
                            
                            setFormData({...formData, login: formatted === "+7" ? "" : formatted});
                          } else {
                            setFormData({...formData, login: val});
                          }
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[var(--accent)] transition-all font-mono"
                        placeholder="admin или +7 777 777 77 77"
                        maxLength={16}
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-50 ml-2">Пароль</label>
                    <input 
                        required
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[var(--accent)] transition-all"
                        placeholder="••••••••"
                    />
                </div>

                <button 
                    disabled={loading}
                    type="submit" 
                    className="w-full bg-[var(--foreground)] text-[var(--background)] py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[var(--accent)] transition-all disabled:opacity-50"
                >
                    {loading ? "Загрузка..." : "Войти"}
                </button>
            </form>
        </div>
    </div>
  );
}
