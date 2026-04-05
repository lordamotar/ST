"use client";

import { useState } from "react";

export default function SearchInput() {
  const [query, setQuery] = useState("");

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedQuery = query.trim();
    
    if (trimmedQuery) {
      window.location.href = `/search?q=${encodeURIComponent(trimmedQuery)}`;
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-xl relative">
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
        placeholder="Поиск мебели (напр. дубовый стол)..."
        className="w-full glass py-5 px-8 rounded-full outline-none focus:border-[var(--accent)] text-lg placeholder:opacity-50 transition-all font-medium pr-32"
      />
      <button 
        type="submit"
        className="absolute right-3 top-2 bottom-2 bg-[var(--foreground)] text-[var(--background)] px-6 rounded-full font-bold hover:bg-[var(--accent)] transition-all cursor-pointer z-10"
      >
        Найти
      </button>
    </form>
  );
}
