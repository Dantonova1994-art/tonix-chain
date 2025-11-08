/**
 * Игровые константы и конфигурация
 */

export const LEVELS = [
  { level: 1, xp: 0, name: "Новичок" },
  { level: 2, xp: 100, name: "Игрок" },
  { level: 3, xp: 250, name: "Профи" },
  { level: 4, xp: 500, name: "Мастер" },
  { level: 5, xp: 1000, name: "Легенда" },
];

export const GAME_REWARDS = {
  FLIP_WIN: 1,
  CATCH_COIN: 2,
  SPIN_BONUS: 5,
  DAILY_BONUS: 25,
  LOTTERY_TICKET: 10,
};

export const GAME_COLORS = {
  primary: "#00FFFF",
  secondary: "#007BFF",
  accent: "#FF00FF",
  success: "#00FF00",
  warning: "#FFFF00",
  error: "#FF0000",
};

export const STORAGE_KEYS = {
  XP: "tonix_xp",
  LEVEL: "tonix_level",
  STREAK: "tonix_streak",
  LAST_BONUS: "tonix_last_bonus",
  LEADERBOARD: "tonix_leaderboard",
  USERNAME: "tonix_username",
};

export function getLevelByXP(xp: number): { level: number; name: string; xpForNext: number } {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) {
      const nextLevel = LEVELS[i + 1];
      return {
        level: LEVELS[i].level,
        name: LEVELS[i].name,
        xpForNext: nextLevel ? nextLevel.xp - xp : 0,
      };
    }
  }
  return { level: 1, name: "Новичок", xpForNext: 100 };
}

export function getXPProgress(xp: number): { current: number; next: number; percentage: number } {
  const { level, xpForNext } = getLevelByXP(xp);
  const currentLevelXP = LEVELS.find((l) => l.level === level)?.xp || 0;
  const nextLevelXP = LEVELS.find((l) => l.level === level + 1)?.xp || currentLevelXP + 100;
  
  const progress = xp - currentLevelXP;
  const total = nextLevelXP - currentLevelXP;
  const percentage = total > 0 ? (progress / total) * 100 : 0;

  return {
    current: progress,
    next: total,
    percentage: Math.min(100, Math.max(0, percentage)),
  };
}

