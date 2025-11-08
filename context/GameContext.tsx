"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { STORAGE_KEYS, getLevelByXP, GAME_REWARDS } from "../constants/game";
import toast from "react-hot-toast";

interface GameContextType {
  xp: number;
  level: number;
  levelName: string;
  streak: number;
  bonusAvailable: boolean;
  addXP: (amount: number, reason?: string) => void;
  claimDailyBonus: () => void;
  resetProgress: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [xp, setXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bonusAvailable, setBonusAvailable] = useState(false);

  // Загрузка из localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedXP = parseInt(localStorage.getItem(STORAGE_KEYS.XP) || "0", 10);
    const savedStreak = parseInt(localStorage.getItem(STORAGE_KEYS.STREAK) || "0", 10);
    const lastBonus = localStorage.getItem(STORAGE_KEYS.LAST_BONUS);

    setXP(savedXP);
    setStreak(savedStreak);

    // Проверка доступности ежедневного бонуса
    const today = new Date().toDateString();
    if (lastBonus !== today) {
      setBonusAvailable(true);
    }
  }, []);

  const levelInfo = getLevelByXP(xp);

  const addXP = (amount: number, reason?: string) => {
    const newXP = xp + amount;
    setXP(newXP);
    localStorage.setItem(STORAGE_KEYS.XP, newXP.toString());

    const newLevelInfo = getLevelByXP(newXP);
    if (newLevelInfo.level > levelInfo.level) {
      toast.success(`🎉 Новый уровень! ${newLevelInfo.name} (${newLevelInfo.level})`);
      
      // Вибрация при повышении уровня
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    }

    if (reason) {
      toast.success(`+${amount} XP: ${reason}`);
    }

    console.log(`✅ XP added: +${amount} (Total: ${newXP})`);
  };

  const claimDailyBonus = () => {
    const today = new Date().toDateString();
    const lastBonus = localStorage.getItem(STORAGE_KEYS.LAST_BONUS);

    if (lastBonus === today) {
      toast.error("Бонус уже получен сегодня");
      return;
    }

    const newStreak = lastBonus === new Date(Date.now() - 86400000).toDateString() 
      ? streak + 1 
      : 1;

    setStreak(newStreak);
    localStorage.setItem(STORAGE_KEYS.LAST_BONUS, today);
    localStorage.setItem(STORAGE_KEYS.STREAK, newStreak.toString());
    setBonusAvailable(false);

    addXP(GAME_REWARDS.DAILY_BONUS, "Ежедневный бонус");
    toast.success(`🎁 Ежедневный бонус получен! Серия: ${newStreak} дней`);
  };

  const resetProgress = () => {
    setXP(0);
    setStreak(0);
    setBonusAvailable(false);
    localStorage.removeItem(STORAGE_KEYS.XP);
    localStorage.removeItem(STORAGE_KEYS.STREAK);
    localStorage.removeItem(STORAGE_KEYS.LAST_BONUS);
    toast.success("Прогресс сброшен");
  };

  return (
    <GameContext.Provider
      value={{
        xp,
        level: levelInfo.level,
        levelName: levelInfo.name,
        streak,
        bonusAvailable,
        addXP,
        claimDailyBonus,
        resetProgress,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within GameProvider");
  }
  return context;
}

