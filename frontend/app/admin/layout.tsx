import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Админ-панель | LuxeFurniture",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* Шапка админки */}
      <div className="border-b border-white/5 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-8">
          <span className="font-outfit font-black text-sm uppercase tracking-widest opacity-40">Admin</span>
          <nav className="flex gap-6">
            <Link
              href="/admin/orders"
              className="text-sm font-bold uppercase tracking-wider opacity-60 hover:opacity-100 transition-all hover:text-[var(--accent)]"
            >
              Заявки
            </Link>
            <Link
              href="/admin/products"
              className="text-sm font-bold uppercase tracking-wider opacity-60 hover:opacity-100 transition-all hover:text-[var(--accent)]"
            >
              Товары
            </Link>
          </nav>
          <div className="ml-auto">
            <Link href="/" className="text-xs font-bold uppercase opacity-40 hover:opacity-80 transition-all">
              ← На сайт
            </Link>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
