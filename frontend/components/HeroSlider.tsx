"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeroText, FadeIn } from "./HeroAnimations";
import SearchInput from "./SearchInput";
import { BASE_URL } from "@/lib/api";

interface Slide {
  id: number;
  title: string;
  description: string;
  image_url: string;
  start_date: string;
  end_date: string;
  show_timer: boolean;
}

export default function HeroSlider({ slides, defaultSettings }: { slides: Slide[], defaultSettings: any }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    // Falls back to static hero if no slides
    return (
      <section className="relative w-full min-h-[85vh] md:h-[95vh] flex flex-col justify-center items-center text-center px-4 py-20 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_-20%,_var(--accent)_0%,_transparent_50%)] opacity-20"></div>
        <div className="absolute inset-0 z-0 pattern-bg opacity-[0.03]"></div>
        
        <HeroText>
          <span className="text-[var(--accent)] font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs mb-6 block">
            {defaultSettings.badge}
          </span>
          <h1 className="text-5xl sm:text-6xl md:text-[6rem] lg:text-[10rem] font-outfit uppercase font-black tracking-tighter leading-[0.9] md:leading-[0.8] mb-8 px-4" 
              dangerouslySetInnerHTML={{ __html: defaultSettings.title }}
          />
          <p className="text-sm md:text-xl max-w-2xl mx-auto opacity-50 mb-12 font-medium leading-relaxed px-6"
             dangerouslySetInnerHTML={{ __html: defaultSettings.subtitle }}
          />
        </HeroText>
        
        <FadeIn delay={0.8}>
          <div className="w-full max-w-xl px-6">
            <SearchInput />
          </div>
        </FadeIn>
      </section>
    );
  }

  const slide = slides[current];

  return (
    <section className="relative w-full min-h-[90vh] md:h-[100vh] flex flex-col justify-center items-center text-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0"
        >
          {(() => {
            const finalUrl = slide.image_url.startsWith('http') 
              ? slide.image_url 
              : slide.image_url.startsWith('/') 
                ? `${BASE_URL}${slide.image_url}`
                : `${BASE_URL}/${slide.image_url}`;
            
            return (
              <img 
                src={finalUrl} 
                alt={slide.title} 
                className="w-full h-full object-cover" 
                onError={(e) => console.error("Slider Fail:", finalUrl)}
              />
            );
          })()}
          <div className="absolute inset-0 bg-black/60 z-10"></div>
        </motion.div>
      </AnimatePresence>

      <div className="relative z-20 w-full flex flex-col items-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <span className="text-[var(--accent)] font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs mb-6 block drop-shadow-lg">
              Flash Deal
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-[5rem] lg:text-[8rem] font-outfit uppercase font-black tracking-tighter leading-[0.9] md:leading-[0.8] mb-8 px-4 text-white drop-shadow-2xl">
              {slide.title}
            </h1>
            <p className="text-sm md:text-xl max-w-2xl mx-auto text-white/70 mb-12 font-medium leading-relaxed px-6 drop-shadow-md">
              {slide.description}
            </p>

            {slide.show_timer && (
              <CountdownTimer targetDate={slide.end_date} />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="w-full max-w-xl px-6 mt-8">
          <SearchInput />
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 transition-all duration-500 rounded-full ${i === current ? 'w-12 bg-[var(--accent)]' : 'w-4 bg-white/20 hover:bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<any>(null);

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(targetDate).getTime() - new Date().getTime();
      if (diff <= 0) return null;

      return {
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / 1000 / 60) % 60),
        s: Math.floor((diff / 1000) % 60),
      };
    };

    setTimeLeft(calculate());
    const interval = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="flex gap-4 md:gap-8 mt-4 bg-black/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/10">
      {[
        { v: timeLeft.d, l: "Days" },
        { v: timeLeft.h, l: "Hours" },
        { v: timeLeft.m, l: "Mins" },
        { v: timeLeft.s, l: "Secs" },
      ].map((t, i) => (
        <div key={i} className="flex flex-col items-center min-w-[60px]">
          <span className="text-2xl md:text-4xl font-black font-outfit text-[var(--accent)]">{t.v.toString().padStart(2, '0')}</span>
          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-40">{t.l}</span>
        </div>
      ))}
    </div>
  );
}
