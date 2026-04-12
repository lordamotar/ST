"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function MobileMenu({ categories = [] }: { categories?: any[] }) {
  const [isOpen, setIsOpen] = useState(false);

  const easeCustom = [0.16, 1, 0.3, 1] as const;

  const menuVariants = {
    closed: { x: "100%", transition: { duration: 0.8, ease: easeCustom } },
    opened: { x: 0, transition: { duration: 0.8, ease: easeCustom } },
  };

  const itemVariants = {
    closed: { opacity: 0, x: 20 },
    opened: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: 0.3 + i * 0.1, duration: 0.8, ease: easeCustom },
    }),
  };

  const links = [
    { href: "/", label: "Главная" },
    { href: "/catalog", label: "Каталог" },
    ...categories.map(cat => ({
        href: `/catalog/${cat.slug}`,
        label: cat.name
    })),
    { href: "/contacts", label: "Контакты" },
  ];

  return (
    <div className="md:hidden">
      {/* Burger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="w-12 h-12 glass rounded-xl flex flex-col items-center justify-center gap-1.5 focus:outline-none"
      >
        <span className="w-6 h-0.5 bg-white rounded-full"></span>
        <span className="w-4 h-0.5 bg-white/50 rounded-full self-start ml-3"></span>
        <span className="w-6 h-0.5 bg-white rounded-full"></span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60]"
            />

            {/* Menu Panel */}
            <motion.div
              variants={menuVariants}
              initial="closed"
              animate="opened"
              exit="closed"
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-[#0a0a0a] border-l border-white/5 z-[70] p-12 flex flex-col"
            >
              <div className="flex justify-between items-center mb-20">
                <div className="text-xl font-bold font-outfit uppercase tracking-tighter">
                  Menu
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 glass rounded-full flex items-center justify-center"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              <nav className="flex flex-col gap-8">
                {links.map((link, i) => (
                  <motion.div
                    key={link.href}
                    custom={i}
                    variants={itemVariants}
                  >
                    <Link 
                      href={link.href} 
                      onClick={() => setIsOpen(false)}
                      className="text-4xl font-outfit font-black uppercase tracking-tighter hover:text-[var(--accent)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-auto pt-10 border-t border-white/5">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20 mb-6">Socials</p>
                <div className="flex gap-6">
                  {["Instagram", "WhatsApp", "Telegram"].map(s => (
                    <span key={s} className="text-[10px] font-bold uppercase tracking-widest hover:text-[var(--accent)] cursor-pointer">{s}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
