"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTonWallet } from "@tonconnect/ui-react";
import toast from "react-hot-toast";
import { formatAddressShort } from "../lib/address";
import { captureEvent } from "../lib/analytics";

export default function ReferralPanel() {
  const wallet = useTonWallet();
  const [referralLink, setReferralLink] = useState("");
  const [stats, setStats] = useState<{
    totalReferrals: number;
    uniqueBuyers: number;
    totalTickets: number;
    totalVolume: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wallet?.account?.address) {
      const link = `https://t.me/tonixchain_lottery_bot/app?startapp=ref_${wallet.account.address}`;
      setReferralLink(link);
    }
  }, [wallet?.account?.address]);

  useEffect(() => {
    if (wallet?.account?.address) {
      fetchStats();
    }
  }, [wallet?.account?.address]);

  const fetchStats = async () => {
    if (!wallet?.account?.address) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/referral/stats?referrer=${encodeURIComponent(wallet.account.address)}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching referral stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast.success("🔗 Реферальная ссылка скопирована!");
      captureEvent("referral_link_copied", {
        wallet: wallet?.account?.address,
      });
    }
  };

  if (!wallet?.account?.address) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card text-center"
      >
        <p className="text-gray-400">Подключите кошелёк, чтобы получить реферальную ссылку</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-teal-500/10 to-transparent blur-xl -z-10" />

      <h2 className="text-xl font-bold text-green-400 mb-4 text-center">🎁 Реферальная система</h2>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-400 mb-2">Ваша реферальная ссылка:</p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-gray-600 text-sm text-gray-300 font-mono"
            />
            <button
              onClick={copyLink}
              className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 transition-colors"
            >
              📋
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin text-cyan-400">⏳</div>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-white/5 border border-gray-600">
              <p className="text-xs text-gray-400 mb-1">Рефералов</p>
              <p className="text-xl font-bold text-green-300">{stats.totalReferrals}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-gray-600">
              <p className="text-xs text-gray-400 mb-1">Билетов</p>
              <p className="text-xl font-bold text-cyan-300">{stats.totalTickets}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-gray-600">
              <p className="text-xs text-gray-400 mb-1">Объём</p>
              <p className="text-xl font-bold text-yellow-300">{stats.totalVolume.toFixed(2)} TON</p>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-gray-600">
              <p className="text-xs text-gray-400 mb-1">Уникальных</p>
              <p className="text-xl font-bold text-purple-300">{stats.uniqueBuyers}</p>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-400 text-sm">Нет данных о рефералах</p>
        )}

        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/50">
          <p className="text-sm text-green-300">
            💡 За каждого приглашённого друга вы получаете +25 XP!
          </p>
        </div>
      </div>
    </motion.div>
  );
}

