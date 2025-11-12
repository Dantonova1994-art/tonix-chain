"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSoundContext } from "./SoundProvider";

interface WinBlastProps {
  trigger?: boolean;
  onComplete?: () => void;
}

export default function WinBlast({ trigger, onComplete }: WinBlastProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const { win } = useSoundContext();

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true);
      win();
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const particles: Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        life: number;
        maxLife: number;
      }> = [];

      // Создание 50 частиц
      for (let i = 0; i < 50; i++) {
        const angle = (Math.PI * 2 * i) / 50;
        const speed = 2 + Math.random() * 4;
        particles.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 3 + Math.random() * 5,
          life: 1,
          maxLife: 1,
        });
      }

      let animationFrame: number;
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let alive = 0;
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.98;
          p.vy *= 0.98;
          p.life -= 0.02;
          
          if (p.life > 0) {
            alive++;
            const alpha = p.life;
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
            gradient.addColorStop(0, `rgba(0, 240, 255, ${alpha})`);
            gradient.addColorStop(0.5, `rgba(123, 47, 247, ${alpha * 0.7})`);
            gradient.addColorStop(1, `rgba(123, 47, 247, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        if (alive > 0) {
          animationFrame = requestAnimationFrame(animate);
        } else {
          setIsActive(false);
          if (onComplete) onComplete();
        }
      };

      animate();

      setTimeout(() => {
        setIsActive(false);
        if (onComplete) onComplete();
      }, 1200);

      return () => {
        if (animationFrame) cancelAnimationFrame(animationFrame);
      };
    }
  }, [trigger, isActive, win, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.canvas
          ref={canvasRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: 1.2 }}
          className="fixed inset-0 pointer-events-none z-50"
          style={{ mixBlendMode: "screen" }}
        />
      )}
    </AnimatePresence>
  );
}

