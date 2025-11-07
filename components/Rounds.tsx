"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface Round {
  id: number;
  start: number;
  end?: number;
  buyCount?: number;
  claimCount?: number;
  drawCount?: number;
}

interface RoundsData {
  rounds: Round[];
  currentRoundId: number;
}

export default function Rounds({
  selectedRoundId,
  onRoundChange,
}: {
  selectedRoundId: number;
  onRoundChange: (roundId: number) => void;
}) {
  const [roundsData, setRoundsData] = useState<RoundsData | null>(null);
  const [loading, setLoading] = useState(true);
  const lastErrorToastRef = useRef<number>(0);

  const showErrorToast = (message: string) => {
    const now = Date.now();
    if (now - lastErrorToastRef.current > 60000) {
      toast.error(message);
      lastErrorToastRef.current = now;
    }
  };

  const fetchRounds = async () => {
    try {
      setLoading(true);
      console.log("📊 Fetching rounds...");
      const response = await fetch("/api/lottery/rounds");
      if (!response.ok) {
        throw new Error("Failed to fetch rounds");
      }
      const data = await response.json();
      setRoundsData(data);
      console.log("✅ Rounds loaded:", data.rounds?.length || 0, "rounds");
    } catch (err: any) {
      console.error("❌ Error fetching rounds:", err);
      showErrorToast("Ошибка при загрузке раундов");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRounds();
    const interval = setInterval(fetchRounds, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (unixtime: number) => {
    const date = new Date(unixtime * 1000);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && !roundsData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="w-full max-w-md mx-auto mt-6"
      >
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (!roundsData || roundsData.rounds.length === 0) {
    return null;
  }

  const currentRound = roundsData.rounds.find((r) => r.id === roundsData.currentRoundId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="w-full max-w-md mx-auto mt-6"
    >
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(0,255,255,0.3)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-transparent blur-xl -z-10" />
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-cyan-400">Раунды</h2>
          <button
            onClick={fetchRounds}
            disabled={loading}
            className="text-xs text-cyan-300 hover:text-cyan-200 disabled:opacity-50"
          >
            {loading ? "⏳" : "🔄"}
          </button>
        </div>

        {currentRound && (
          <div className="mb-4 p-3 rounded-lg border border-green-500/50 bg-green-500/10">
            <p className="text-sm text-gray-400">Текущий раунд</p>
            <p className="text-lg font-bold text-green-300">#{currentRound.id}</p>
            <p className="text-xs text-gray-400 mt-1">
              Начало: {formatTime(currentRound.start)}
            </p>
          </div>
        )}

        <div className="space-y-2 max-h-64 overflow-y-auto">
          <AnimatePresence>
            {roundsData.rounds.slice(0, 10).map((round) => (
              <motion.button
                key={round.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => onRoundChange(round.id)}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  selectedRoundId === round.id
                    ? "border-cyan-500 bg-cyan-500/20"
                    : "border-gray-500/50 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Раунд #{round.id}
                      {round.id === roundsData.currentRoundId && (
                        <span className="ml-2 text-xs text-green-400">(текущий)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTime(round.start)}
                      {round.end && ` — ${formatTime(round.end)}`}
                    </p>
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    <p>🎟 {round.buyCount || 0}</p>
                    <p>🏆 {round.claimCount || 0}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

