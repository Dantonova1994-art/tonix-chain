"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { fetchContractBalance } from "../lib/ton-read";
import { CONTRACT_ADDRESS } from "../lib/env";

interface DataPoint {
  time: number;
  balance: number;
}

export default function OnchainGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<DataPoint[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Загрузка начальных данных
    const loadData = async () => {
      try {
        const balance = await fetchContractBalance(CONTRACT_ADDRESS);
        const now = Date.now();
        setData((prev) => {
          const newData = [...prev, { time: now, balance }];
          // Храним только последние 24 часа (96 точек при обновлении каждые 15 минут)
          return newData.slice(-96);
        });
      } catch (err) {
        console.error("❌ Error loading graph data:", err);
      }
    };

    loadData();
    const interval = setInterval(loadData, 15 * 60 * 1000); // Каждые 15 минут

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    ctx.clearRect(0, 0, width, height);

    // Градиент для линии
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, "rgba(0, 255, 255, 1)");
    gradient.addColorStop(0.5, "rgba(0, 123, 255, 1)");
    gradient.addColorStop(1, "rgba(123, 97, 255, 1)");

    // Находим min/max для масштабирования
    const balances = data.map((d) => d.balance);
    const minBalance = Math.min(...balances);
    const maxBalance = Math.max(...balances);
    const range = maxBalance - minBalance || 1;

    // Отрисовка линии
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(0, 255, 255, 0.8)";
    ctx.beginPath();

    data.forEach((point, index) => {
      const x = padding + (index / (data.length - 1 || 1)) * (width - 2 * padding);
      const y = height - padding - ((point.balance - minBalance) / range) * (height - 2 * padding);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Отрисовка точек
    data.forEach((point, index) => {
      const x = padding + (index / (data.length - 1 || 1)) * (width - 2 * padding);
      const y = height - padding - ((point.balance - minBalance) / range) * (height - 2 * padding);

      ctx.fillStyle = hoveredPoint === point ? "#00FFFF" : "rgba(0, 255, 255, 0.6)";
      ctx.beginPath();
      ctx.arc(x, y, hoveredPoint === point ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Подписи осей
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "12px monospace";
    ctx.fillText(`${minBalance.toFixed(2)} TON`, 10, height - padding + 5);
    ctx.fillText(`${maxBalance.toFixed(2)} TON`, 10, padding + 5);
  }, [data, hoveredPoint]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padding = 40;

    const pointIndex = Math.round(
      ((x - padding) / (canvas.width - 2 * padding)) * (data.length - 1)
    );

    if (pointIndex >= 0 && pointIndex < data.length) {
      setHoveredPoint(data[pointIndex]);
      setTooltipPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-4"
    >
      <h3 className="text-lg font-bold text-cyan-400 mb-3">📈 Live Contract Analytics</h3>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-48 rounded-lg"
        />
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed pointer-events-none z-50 bg-black/80 backdrop-blur-md px-3 py-2 rounded-lg border border-cyan-500/50 text-sm text-cyan-300"
            style={{
              left: tooltipPos.x + 10,
              top: tooltipPos.y - 10,
            }}
          >
            💎 {hoveredPoint.balance.toFixed(3)} TON @{" "}
            {new Date(hoveredPoint.time).toLocaleTimeString()}
          </motion.div>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        Last 24 hours • Updates every 15 min
      </p>
    </motion.div>
  );
}

