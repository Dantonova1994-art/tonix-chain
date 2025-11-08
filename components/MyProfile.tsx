"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTonWallet } from "@tonconnect/ui-react";
import { useGame } from "../context/GameContext";
import { useSoundContext } from "./SoundProvider";
import toast from "react-hot-toast";

interface ProfileData {
  username: string;
  xp: number;
  level: number;
  badges: string[];
  nftId?: number;
}

export default function MyProfile() {
  const wallet = useTonWallet();
  const { xp, level } = useGame();
  const { play } = useSoundContext();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wallet?.account?.address) {
      // Загрузка профиля из localStorage или API
      const savedProfile = localStorage.getItem(`profile_${wallet.account.address}`);
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      } else {
        // Создание нового профиля
        setProfile({
          username: `Player_${wallet.account.address.slice(-6)}`,
          xp,
          level,
          badges: [],
        });
      }
    }
  }, [wallet, xp, level]);

  const handleMintProfile = async () => {
    if (!wallet?.account?.address) {
      toast.error("Подключите кошелек");
      return;
    }

    setLoading(true);
    play("click");

    try {
      // Вызов API для минта профиля
      const response = await fetch("/api/nft/mint-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: wallet.account.address,
          username: profile?.username || `Player_${wallet.account.address.slice(-6)}`,
          xp,
          level,
          badges: profile?.badges || [],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile({ ...profile!, nftId: data.nftId });
        localStorage.setItem(`profile_${wallet.account.address}`, JSON.stringify({ ...profile!, nftId: data.nftId }));
        toast.success("🎨 Profile NFT minted!");
        play("success");
      } else {
        throw new Error("Mint failed");
      }
    } catch (err) {
      console.error("❌ Error minting profile:", err);
      toast.error("Ошибка при минте профиля");
      play("alert");
    } finally {
      setLoading(false);
    }
  };

  if (!wallet?.account?.address) {
    return null;
  }

  const levelColors: Record<number, string> = {
    1: "from-blue-500 to-cyan-500",
    2: "from-purple-500 to-pink-500",
    3: "from-yellow-500 to-orange-500",
    4: "from-red-500 to-pink-500",
    5: "from-cyan-500 via-blue-500 to-purple-500",
  };

  const glowColor = levelColors[level] || "from-cyan-500 to-blue-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(0,255,255,0.3)]"
    >
      <h3 className="text-xl font-bold text-cyan-400 mb-4">👤 My Profile</h3>

      {profile && (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl bg-gradient-to-r ${glowColor} glow-pulse`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-bold text-lg">{profile.username}</span>
              {profile.nftId && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded">NFT #{profile.nftId}</span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-white/90">
              <div>
                <span className="text-white/60">Level:</span> {level}
              </div>
              <div>
                <span className="text-white/60">XP:</span> {xp}
              </div>
            </div>
          </div>

          {profile.badges.length > 0 && (
            <div>
              <p className="text-sm text-gray-400 mb-2">Badges:</p>
              <div className="flex flex-wrap gap-2">
                {profile.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 text-xs"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!profile.nftId && (
            <motion.button
              onClick={handleMintProfile}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_40px_rgba(168,85,247,0.8)] transition-all disabled:opacity-50"
            >
              {loading ? "⏳ Minting..." : "✨ Upgrade to Neon Avatar (0.2 TON)"}
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
}

