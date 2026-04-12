"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  endDate: string | Date;
  onExpire?: () => void;
}

export default function CountdownTimer({ endDate, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const end = new Date(endDate).getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = end - now;

      if (difference <= 0) {
        setTimeLeft(prev => ({ ...prev, isExpired: true }));
        if (onExpire) onExpire();
        return null;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft(); // Initial call

    return () => clearInterval(timer);
  }, [endDate, onExpire]);

  if (timeLeft.isExpired) return null;

  return (
    <div className="flex gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
      <div className="flex flex-col items-center">
        <span className="text-[var(--accent)] font-bold">{timeLeft.days}д</span>
      </div>
      <span>:</span>
      <div className="flex flex-col items-center">
        <span className="text-white/80">{String(timeLeft.hours).padStart(2, '0')}ч</span>
      </div>
      <span>:</span>
      <div className="flex flex-col items-center">
        <span className="text-white/80">{String(timeLeft.minutes).padStart(2, '0')}м</span>
      </div>
      <span>:</span>
      <div className="flex flex-col items-center">
        <span className="text-white/80">{String(timeLeft.seconds).padStart(2, '0')}с</span>
      </div>
    </div>
  );
}
