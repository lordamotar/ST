"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // Слушаем изменения в localStorage (на случай входа в другой вкладке)
    const handleStorage = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");
    setIsLoggedIn(false);
    router.push("/");
    router.refresh();
  };

  if (!isLoggedIn) return null;

  return (
    <div className="flex items-center gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <Link 
        href="/admin" 
        className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[var(--accent)] transition-colors"
      >
        Панель управления
      </Link>
      <button 
        onClick={handleLogout}
        className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-red-500 transition-all"
      >
        <span>Выйти</span>
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="12" height="12" 
            viewBox="0 0 24 24" fill="none" stroke="currentColor" 
            strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            className="group-hover:translate-x-1 transition-transform"
        >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    </div>
  );
}
