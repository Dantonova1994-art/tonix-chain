"use client";

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from "react";
import toast from "react-hot-toast";
import { LEVELS, DAILY_BONUS_XP, GAME_REWARDS } from "../constants/game";
import { getPassLevel, checkLevelUp, getBoostMultiplier, setPassLevelInStorage, getPassLevelFromStorage } from "../lib/pass";
import { captureEvent } from "../lib/analytics";
import { useHapticFeedback } from "../lib/hooks";

interface LevelInfo {
  level: number;
  xp: number;
  nextLevelXP: number | null;
  progress: number;
}

interface GameContextType {
  xp: number;
  levelInfo: LevelInfo;
  streak: number;
  bonusAvailable: boolean;
  passLevel: number;
  boostMultiplier: number;
  addXP: (amount: number, reason?: string) => void;
  claimDailyBonus: () => void;
  resetProgress: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const STORAGE_KEYS = {
  XP: "tonix_game_xp",
  STREAK: "tonix_game_streak",
  LAST_BONUS: "tonix_game_last_bonus",
  LAST_LOGIN: "tonix_game_last_login",
};

function getLevelByXP(currentXP: number): LevelInfo {
  let currentLevel = 1;
  let xpForCurrentLevel = 0;
  let nextLevelXP: number | null = null;

  for (let i = 0; i < LEVELS.length; i++) {
    if (currentXP >= LEVELS[i].xp) {
      currentLevel = LEVELS[i].level;
      xpForCurrentLevel = LEVELS[i].xp;
      if (i + 1 < LEVELS.length) {
        nextLevelXP = LEVELS[i + 1].xp;
      } else {
        nextLevelXP = null;
      }
    } else {
      break;
    }
  }

  const xpSinceLastLevel = currentXP - xpForCurrentLevel;
  const xpToNextLevel = nextLevelXP !== null ? nextLevelXP - xpForCurrentLevel : 0;
  const progress = nextLevelXP !== null ? Math.min(100, (xpSinceLastLevel / xpToNextLevel) * 100) : 100;

  return {
    level: currentLevel,
    xp: currentXP,
    nextLevelXP,
    progress,
  };
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [xp, setXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bonusAvailable, setBonusAvailable] = useState(false);
  const [passLevel, setPassLevel] = useState(1);
  const [boostMultiplier, setBoostMultiplier] = useState(1.0);
  const haptic = useHapticFeedback();

  // Загрузка из localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedXP = parseInt(localStorage.getItem(STORAGE_KEYS.XP) || "0", 10);
    const savedStreak = parseInt(localStorage.getItem(STORAGE_KEYS.STREAK) || "0", 10);
    const lastBonus = localStorage.getItem(STORAGE_KEYS.LAST_BONUS);
    const lastLogin = localStorage.getItem(STORAGE_KEYS.LAST_LOGIN);
    const savedPassLevel = getPassLevelFromStorage();

    setXP(savedXP);
    setStreak(savedStreak);
    setPassLevel(savedPassLevel);
    setBoostMultiplier(getBoostMultiplier(savedPassLevel));

    const today = new Date().toDateString();

    if (lastBonus !== today) {
      setBonusAvailable(true);
    } else {
      setBonusAvailable(false);
    }

    if (lastLogin !== today) {
      if (lastLogin) {
        const lastLoginDate = new Date(lastLogin);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastLoginDate.toDateString() === yesterday.toDateString()) {
          setStreak((prev) => prev + 1);
        } else {
          setStreak(0);
        }
      } else {
        setStreak(1);
      }
      localStorage.setItem(STORAGE_KEYS.LAST_LOGIN, today);
    }
  }, []);

  const levelInfo = getLevelByXP(xp);

  const addXP = useCallback((amount: number, reason?: string) => {
    const previousXP = xp;
    const currentPassLevel = getPassLevel(previousXP);
    const boost = getBoostMultiplier(currentPassLevel.level);
    
    // Применяем буст
    const boostedAmount = Math.floor(amount * boost);
    const newXP = previousXP + boostedAmount;
    
    setXP(newXP);
    localStorage.setItem(STORAGE_KEYS.XP, newXP.toString());

    // Проверка Level-Up для TONIX PASS
    const newPassLevel = checkLevelUp(newXP, previousXP);
    if (newPassLevel) {
      setPassLevel(newPassLevel.level);
      setBoostMultiplier(newPassLevel.boostMultiplier);
      toast.success(`🚀 Новый уровень — TONIX PASS L${newPassLevel.level}!`, { duration: 5000 });
      haptic("heavy");
      
      // PostHog event
      captureEvent("pass_level_up", {
        level: newPassLevel.level,
        xp: newXP,
        boost: newPassLevel.boostMultiplier,
      });
    }

    const newLevelInfo = getLevelByXP(newXP);
    if (newLevelInfo.level > levelInfo.level) {
      toast.success(`🔥 Новый уровень! Вы достигли уровня ${newLevelInfo.level}!`, { duration: 5000 });
      haptic("medium");
    }

    // PostHog event
    captureEvent("game_xp_gain", {
      amount: boostedAmount,
      baseAmount: amount,
      boost: boost,
      reason: reason || "unknown",
      totalXP: newXP,
    });

    console.log(`➕ Добавлено ${boostedAmount} XP (базовый: ${amount}, буст: ${boost}x). Всего: ${newXP} XP. Причина: ${reason || "N/A"}`);
  }, [xp, levelInfo.level, haptic]);

  const claimDailyBonus = useCallback(() => {
    if (bonusAvailable) {
      addXP(DAILY_BONUS_XP, "Ежедневный бонус");
      setBonusAvailable(false);
      const today = new Date().toDateString();
      localStorage.setItem(STORAGE_KEYS.LAST_BONUS, today);
      toast.success(`🎁 Ежедневный бонус получен! +${DAILY_BONUS_XP} XP`);
      haptic("light");
    } else {
      toast.error("Ежедневный бонус уже получен сегодня.");
    }
  }, [bonusAvailable, addXP, haptic]);

  const resetProgress = useCallback(() => {
    setXP(0);
    setStreak(0);
    setBonusAvailable(true);
    setPassLevel(1);
    setBoostMultiplier(1.0);
    localStorage.removeItem(STORAGE_KEYS.XP);
    localStorage.removeItem(STORAGE_KEYS.STREAK);
    localStorage.removeItem(STORAGE_KEYS.LAST_BONUS);
    localStorage.removeItem(STORAGE_KEYS.LAST_LOGIN);
    toast.success("Прогресс сброшен!");
  }, []);

  const contextValue = {
    xp,
    levelInfo,
    streak,
    bonusAvailable,
    passLevel,
    boostMultiplier,
    addXP,
    claimDailyBonus,
    resetProgress,
  };

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
