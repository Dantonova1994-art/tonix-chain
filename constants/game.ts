export const LEVELS = [
  { level: 1, name: "Новичок", xp: 0, color: "#A8A29E" },
  { level: 2, name: "Участник", xp: 100, color: "#FCD34D" },
  { level: 3, name: "Игрок", xp: 250, color: "#34D399" },
  { level: 4, name: "Мастер", xp: 500, color: "#60A5FA" },
  { level: 5, name: "Легенда", xp: 1000, color: "#A78BFA" },
  { level: 6, name: "Чемпион", xp: 2000, color: "#F87171" },
];

export const DAILY_BONUS_XP = 25;
export const REFERRAL_XP = 25;
export const NFT_MINT_XP = 100;

export const GAME_REWARDS = {
  FLIP_WIN: 1,
  CATCH_COIN: 2,
  SPIN_BONUS: 5,
} as const;
