"use client";

import React, { ReactNode, useEffect, useRef } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";

export function Counter({ value, className }: { value: string, className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  // Extract number from string (e.g., "15+" -> 15)
  const numericValue = parseInt(value.replace(/\D/g, "")) || 0;
  const suffix = value.replace(/[0-9]/g, "");
  
  const spring = useSpring(0, { stiffness: 50, damping: 20 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    if (isInView) {
      spring.set(numericValue);
    }
  }, [isInView, spring, numericValue]);

  return (
    <span ref={ref} className={className}>
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}

export function HeroText({ children }: { children: ReactNode }) {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" } 
    }
  };

  const childrenArray = React.Children.toArray(children);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center"
    >
      {childrenArray.map((child, i) => (
        <motion.div key={i} variants={item} className="w-full">
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

export function FadeIn({ children, delay = 0 }: { children: ReactNode, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function TrustMarquee({ items }: { items: { n: string, t: string }[] }) {
  return (
    <div className="flex whitespace-nowrap">
      <motion.div 
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="flex gap-20 md:gap-40 pr-20 md:pr-40 items-center"
      >
        {[...Array(6)].map((_, groupIndex) => (
          <div key={groupIndex} className="flex gap-20 md:gap-40 items-center">
            {items.map((item, i) => (
              <div key={`${groupIndex}-${i}`} className="flex items-center gap-6">
                <span className="text-3xl md:text-5xl font-black font-outfit text-white">{item.n}</span>
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 whitespace-normal w-24 leading-[1.2]">{item.t}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-20 ml-4 hidden md:block"></div>
              </div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
