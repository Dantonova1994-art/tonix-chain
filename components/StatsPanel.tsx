"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface PoolData {
  timestamp: number;
  value: number;
}

export default function StatsPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<PoolData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const r = await fetch("/api/metrics/jackpot");
        const j = await r.json();
        if (j.ok) {
          setData((prev) => {
            const newData = [...prev, { timestamp: Date.now(), value: j.value }];
            return newData.slice(-20); // Последние 20 точек
          });
        }
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    };

    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = 120;

    const padding = 20;
    const w = canvas.width - padding * 2;
    const h = canvas.height - padding * 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (data.length < 2) return;

    const min = Math.min(...data.map((d) => d.value));
    const max = Math.max(...data.map((d) => d.value));
    const range = max - min || 1;

    // Градиентная линия
    const gradient = ctx.createLinearGradient(0, 0, w, 0);
    gradient.addColorStop(0, "#00f0ff");
    gradient.addColorStop(1, "#7b2ff7");
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((point, i) => {
      const x = padding + (i / (data.length - 1)) * w;
      const y = padding + h - ((point.value - min) / range) * h;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Точки
    data.forEach((point, i) => {
      const x = padding + (i / (data.length - 1)) * w;
      const y = padding + h - ((point.value - min) / range) * h;
      
      const dotGradient = ctx.createRadialGradient(x, y, 0, x, y, 4);
      dotGradient.addColorStop(0, "#00f0ff");
      dotGradient.addColorStop(1, "transparent");
      ctx.fillStyle = dotGradient;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="glass-panel rounded-xl p-4 md:p-6 border border-white/10"
    >
      <h3 
        className="text-sm font-semibold mb-3"
        style={{
          background: "linear-gradient(120deg,#00f0ff,#7b2ff7)",
          WebkitBackgroundClip: "text",
          color: "transparent"
        }}
      >
        Pool Evolution
      </h3>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: "120px" }}
      />
      {data.length === 0 && (
        <p className="text-center text-gray-400 text-xs mt-2">Загрузка данных...</p>
      )}
    </motion.div>
  );
}

