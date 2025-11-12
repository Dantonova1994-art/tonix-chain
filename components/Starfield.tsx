"use client";

import React, { useEffect, useRef } from "react";

export default function Starfield({ density = 160, speed = 0.15 }: { density?: number; speed?: number }) {
  if (typeof window === 'undefined') return null;
  
  const enabled = process.env.NEXT_PUBLIC_ENABLE_STARFIELD !== 'false';
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled || !ref.current) return;
    
    const c = ref.current;
    const ctx = c.getContext('2d')!;
    let w = c.width = c.offsetWidth;
    let h = c.height = c.offsetHeight;
    let raf = 0;

    const stars = Array.from({ length: density }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random() * 1 + 0.2
    }));

    const onResize = () => {
      w = c.width = c.offsetWidth;
      h = c.height = c.offsetHeight;
    };
    
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.y += s.z * speed;
        if (s.y > h) { s.y = 0; s.x = Math.random() * w; }
        const alpha = 0.4 + s.z * 0.6;
        ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
        ctx.fillRect(s.x, s.y, 1.5, 1.5);
      }
      raf = requestAnimationFrame(draw);
    };
    
    draw();
    window.addEventListener('resize', onResize);
    
    return () => { 
      cancelAnimationFrame(raf); 
      window.removeEventListener('resize', onResize); 
    };
  }, [density, speed, enabled]);

  if (!enabled) return null;
  
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 -z-10 w-full h-full opacity-[0.35]" aria-hidden />;
}

