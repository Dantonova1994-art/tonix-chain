/**
 * Полезные React хуки
 */

import { useCallback, useRef } from "react";

export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  const lastRun = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastRun.current >= delay) {
        lastRun.current = now;
        func(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          lastRun.current = Date.now();
          func(...args);
        }, delay - (now - lastRun.current));
      }
    }) as T,
    [func, delay]
  );
}

export function useHapticFeedback() {
  return useCallback((style: "light" | "medium" | "heavy" | "rigid" | "soft" = "medium") => {
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp?.HapticFeedback) {
      try {
        (window as any).Telegram.WebApp.HapticFeedback.impactOccurred(style);
      } catch (err) {
        console.warn("Haptic feedback failed:", err);
      }
    }
  }, []);
}

export function useConfetti() {
  const lastConfetti = useRef<number>(0);
  
  return useCallback(() => {
    const now = Date.now();
    if (now - lastConfetti.current < 2000) return; // Rate limit: не чаще 1 раза в 2 секунды
    lastConfetti.current = now;

    if (typeof window !== "undefined") {
      try {
        const canvas = document.createElement("canvas");
        canvas.style.position = "fixed";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.pointerEvents = "none";
        canvas.style.zIndex = "9999";
        document.body.appendChild(canvas);

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: Array<{ x: number; y: number; vx: number; vy: number; color: string }> = [];
        const colors = ["#00FFFF", "#007BFF", "#FF00FF", "#FFFF00"];

        for (let i = 0; i < 50; i++) {
          particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            color: colors[Math.floor(Math.random() * colors.length)],
          });
        }

        let animationFrame: number;
        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          particles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2;
            
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
          });

          if (particles.some((p) => p.y < canvas.height + 100)) {
            animationFrame = requestAnimationFrame(animate);
          } else {
            if (document.body.contains(canvas)) {
              document.body.removeChild(canvas);
            }
          }
        };

        animate();
        setTimeout(() => {
          if (document.body.contains(canvas)) {
            document.body.removeChild(canvas);
          }
        }, 3000);
      } catch (err) {
        console.warn("Confetti animation failed:", err);
      }
    }
  }, []);
}

