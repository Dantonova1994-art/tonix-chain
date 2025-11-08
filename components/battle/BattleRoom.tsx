"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";
import { useTonConnectUI } from "@tonconnect/ui-react";
import toast from "react-hot-toast";
import { useHapticFeedback } from "../../lib/hooks";
import BattleResult from "./BattleResult";

interface BattleRoomProps {
  matchId: string;
  onExit: () => void;
}

export default function BattleRoom({ matchId, onExit }: BattleRoomProps) {
  const [tonConnectUI] = useTonConnectUI();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [p1, setP1] = useState<string>("");
  const [p2, setP2] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(5);
  const [canHit, setCanHit] = useState(false);
  const [p1Hit, setP1Hit] = useState(false);
  const [p2Hit, setP2Hit] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [events, setEvents] = useState<string[]>([]);
  const haptic = useHapticFeedback();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!tonConnectUI?.account?.address) return;

    const wallet = tonConnectUI.account.address;
    setP1(wallet);

    // Подключаемся к Socket.IO
    const newSocket = io("/api/socketio", {
      path: "/api/socketio",
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("🔌 Connected to battle room");
      setEvents((prev) => [...prev, "✅ Подключено к комнате"]);
    });

    newSocket.on("battle:queue:status", (data: { matchId: string; p2?: string; status: string }) => {
      if (data.matchId === matchId) {
        if (data.p2) {
          setP2(data.p2);
          setCanHit(true);
          setEvents((prev) => [...prev, "🎮 Второй игрок присоединился!"]);
          toast.success("🎮 Соперник найден!");
          haptic("medium");

          // Запускаем таймер
          setTimeLeft(5);
          timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
              if (prev <= 1) {
                if (timerRef.current) clearInterval(timerRef.current);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      }
    });

    newSocket.on("battle:action:hit", (data: { matchId: string; player: string }) => {
      if (data.matchId === matchId) {
        if (data.player === p1) {
          setP1Hit(true);
        } else if (data.player === p2) {
          setP2Hit(true);
        }
        setEvents((prev) => [...prev, `⚔️ ${data.player.slice(0, 6)}... ударил!`]);
        haptic("light");
      }
    });

    newSocket.on("battle:resolved", (data: { matchId: string; winner: string }) => {
      if (data.matchId === matchId) {
        setWinner(data.winner);
        setEvents((prev) => [...prev, `🏆 Победитель: ${data.winner.slice(0, 6)}...`]);
        haptic("heavy");
      }
    });

    setSocket(newSocket);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      newSocket.disconnect();
    };
  }, [matchId, tonConnectUI?.account?.address, p1, p2, haptic]);

  const handleHit = () => {
    if (!socket || !canHit || !tonConnectUI?.account?.address) return;

    socket.emit("battle:action:hit", {
      matchId,
      player: tonConnectUI.account.address,
    });

    setP1Hit(true);
    haptic("medium");
  };

  if (winner) {
    return <BattleResult matchId={matchId} winner={winner} onPlayAgain={onExit} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/5 backdrop-blur-md rounded-2xl border border-red-500/30 p-6 shadow-[0_0_20px_rgba(239,68,68,0.3)] space-y-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-red-400">⚔️ Бой #{matchId.slice(0, 8)}</h3>
        <button
          onClick={onExit}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Exit"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-lg border ${p1Hit ? "border-green-500 bg-green-500/20" : "border-gray-600 bg-white/5"}`}>
          <p className="text-xs text-gray-400 mb-1">Игрок 1</p>
          <p className="text-sm font-mono text-cyan-300">{p1.slice(0, 8)}...</p>
          {p1Hit && <p className="text-green-400 text-xs mt-1">✅ Ударил!</p>}
        </div>

        <div className={`p-4 rounded-lg border ${p2 ? (p2Hit ? "border-green-500 bg-green-500/20" : "border-gray-600 bg-white/5") : "border-gray-700 bg-gray-900/20"}`}>
          <p className="text-xs text-gray-400 mb-1">Игрок 2</p>
          {p2 ? (
            <>
              <p className="text-sm font-mono text-cyan-300">{p2.slice(0, 8)}...</p>
              {p2Hit && <p className="text-green-400 text-xs mt-1">✅ Ударил!</p>}
            </>
          ) : (
            <p className="text-gray-500 text-xs">Ожидание...</p>
          )}
        </div>
      </div>

      {canHit && timeLeft > 0 && (
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-2">Время до удара</p>
          <p className="text-3xl font-bold text-red-400">{timeLeft}s</p>
        </div>
      )}

      {canHit && (
        <motion.button
          onClick={handleHit}
          disabled={p1Hit || timeLeft === 0}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 text-white font-semibold shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:shadow-[0_0_40px_rgba(239,68,68,0.8)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label="Hit"
        >
          {p1Hit ? "✅ Удар нанесён!" : "⚔️ УДАРИТЬ!"}
        </motion.button>
      )}

      <div className="mt-4 p-3 rounded-lg bg-white/5 border border-gray-600 max-h-32 overflow-y-auto">
        <p className="text-xs text-gray-400 mb-2">События:</p>
        <div className="space-y-1">
          {events.map((event, i) => (
            <p key={i} className="text-xs text-gray-300">{event}</p>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

