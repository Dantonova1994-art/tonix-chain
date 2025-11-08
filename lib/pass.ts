/**
 * TONIX PASS - NFT-уровни и бусты XP
 */

export interface PassLevel {
  level: number;
  name: string;
  xpRequired: number;
  boostMultiplier: number;
  color: string;
  nftId?: string;
}

export const PASS_LEVELS: PassLevel[] = [
  { level: 1, name: "Starter", xpRequired: 0, boostMultiplier: 1.0, color: "#3B82F6" }, // blue
  { level: 2, name: "Explorer", xpRequired: 200, boostMultiplier: 1.1, color: "#A855F7" }, // purple
  { level: 3, name: "Master", xpRequired: 400, boostMultiplier: 1.2, color: "#FCD34D" }, // gold
  { level: 4, name: "Legend", xpRequired: 600, boostMultiplier: 1.3, color: "#EF4444" }, // red
  { level: 5, name: "Cosmic", xpRequired: 1000, boostMultiplier: 1.5, color: "linear-gradient(90deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3)" }, // rainbow
];

const STORAGE_KEY_LEVEL = "tonix_pass_level";
const STORAGE_KEY_NFT = "tonix_pass_nft";

export function getPassLevel(xp: number): PassLevel {
  let currentLevel = PASS_LEVELS[0];
  
  for (let i = PASS_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= PASS_LEVELS[i].xpRequired) {
      currentLevel = PASS_LEVELS[i];
      break;
    }
  }
  
  return currentLevel;
}

export function getNextLevelXP(currentXP: number): number | null {
  const currentLevel = getPassLevel(currentXP);
  const nextLevel = PASS_LEVELS.find((l) => l.level === currentLevel.level + 1);
  return nextLevel ? nextLevel.xpRequired : null;
}

export function getBoostMultiplier(level: number): number {
  const passLevel = PASS_LEVELS.find((l) => l.level === level) || PASS_LEVELS[0];
  return passLevel.boostMultiplier;
}

export function getPassLevelFromStorage(): number {
  if (typeof window === "undefined") return 1;
  const saved = localStorage.getItem(STORAGE_KEY_LEVEL);
  return saved ? parseInt(saved, 10) : 1;
}

export function setPassLevelInStorage(level: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_LEVEL, level.toString());
}

export function getPassNFTFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY_NFT);
}

export function setPassNFTInStorage(nftId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_NFT, nftId);
}

export function checkLevelUp(currentXP: number, previousXP: number): PassLevel | null {
  const currentLevel = getPassLevel(currentXP);
  const previousLevel = getPassLevel(previousXP);
  
  if (currentLevel.level > previousLevel.level) {
    setPassLevelInStorage(currentLevel.level);
    return currentLevel;
  }
  
  return null;
}

