"use client";

import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { getContractBalance } from "../lib/ton";
import { getRoundInfoOnChain } from "../lib/ton-read";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { t } from "../i18n";
import { useThrottle } from "../lib/hooks";
import { CONTRACT_ADDRESS } from "../lib/env";

const statuses: Array<"Приём ставок" | "Розыгрыш" | "Выплата"> = ["Приём ставок", "Розыгрыш", "Выплата"];
const statusColors = {
  "Приём ставок": "bg-green-500/20 text-green-300 border-green-500/50",
  "Розыгрыш": "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
  "Выплата": "bg-cyan-500/20 text-cyan-300 border-cyan-500/50",
};

function ContractStatusComponent({ refreshKey }: { refreshKey?: number }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [roundInfo, setRoundInfo] = useState<{ roundId: number; ticketsCount: number; prizePoolTon: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState<"Приём ставок" | "Розыгрыш" | "Выплата">("Приём ставок");
  const [statusIndex, setStatusIndex] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [refreshInterval, setRefreshInterval] = useState(15000);
  const lastErrorToastRef = useRef<number>(0);

  const showErrorToast = useCallback((message: string) => {
    const now = Date.now();
    if (now - lastErrorToastRef.current > 60000) {
      toast.error(message);
      lastErrorToastRef.current = now;
    }
  }, []);

  const fetchContractData = useCallback(async (showToast = false) => {
    try {
      if (showToast) {
        setRefreshing(true);
      }
      
      const bal = await getContractBalance(CONTRACT_ADDRESS);
      setBalance(bal);
      
      try {
        const onChainInfo = await getRoundInfoOnChain();
        setRoundInfo(onChainInfo);
        console.log("✅ On-chain round info:", onChainInfo);
      } catch (err: any) {
        console.warn("⚠️ Failed to get on-chain round info, using fallback:", err);
        if (bal > 0 && bal < 10) {
          setStatus("Приём ставок");
          setStatusIndex(0);
        } else if (bal >= 10) {
          setStatus("Розыгрыш");
          setStatusIndex(1);
        } else {
          setStatus("Выплата");
          setStatusIndex(2);
        }
      }
      
      setErrorCount(0);
      setRefreshInterval(15000);
      
      console.log("✅ Contract data updated:", bal, "TON");
    } catch (e: any) {
      console.error("❌ Error fetching contract data:", e);
      const newErrorCount = errorCount + 1;
      setErrorCount(newErrorCount);
      
      if (newErrorCount >= 2) {
        setRefreshInterval(30000);
        console.log("⚠️ Backoff: increasing refresh interval to 30s");
      }
      
      if (e.message?.includes("timeout") || e.message?.includes("network")) {
        toast(t("toast.networkBusy"), {
          icon: "⚠️",
          duration: 5000,
        });
      } else if (showToast) {
        showErrorToast(t("toast.error"));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [errorCount, showErrorToast]);

  const throttledFetch = useThrottle(fetchContractData, 500);

  useEffect(() => {
    fetchContractData();
  }, [refreshKey, fetchContractData]);

  useEffect(() => {
    const interval = setInterval(() => {
      throttledFetch(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, throttledFetch]);

  useEffect(() => {
    if (roundInfo) return;
    
    const statusInterval = setInterval(() => {
      setStatusIndex((prev) => {
        const next = (prev + 1) % statuses.length;
        setStatus(statuses[next]);
        return next;
      });
    }, 30000);

    return () => clearInterval(statusInterval);
  }, [roundInfo]);

  const displayBalance = useMemo(() => {
    return roundInfo ? roundInfo.prizePoolTon : balance;
  }, [roundInfo, balance]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="w-full max-w-md mx-auto mt-8"
    >
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(0,255,255,0.3)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-transparent blur-xl -z-10" />
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-cyan-400">{t("contract.status")}</h2>
          <button
            onClick={() => fetchContractData(true)}
            disabled={loading || refreshing}
            className="text-xs text-cyan-300 hover:text-cyan-200 disabled:opacity-50"
            title={t("contract.refresh")}
            aria-label={t("contract.refresh")}
          >
            {refreshing ? "⏳" : "🔄"}
          </button>
        </div>
        
        <div className="mb-4 text-center">
          <p className="text-xs text-cyan-400 font-mono">
            {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-6)}
          </p>
        </div>
        
        <div className="space-y-4">
          {roundInfo && (
            <div className="text-center p-3 rounded-lg border border-cyan-500/50 bg-cyan-500/10">
              <p className="text-sm text-gray-400 mb-1">{t("contract.round")}</p>
              <p className="text-2xl font-bold text-cyan-300">#{roundInfo.roundId}</p>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">
              {roundInfo ? t("contract.prizePool") : t("contract.prizePool")}
            </p>
            {loading || refreshing ? (
              <div className="space-y-2">
                <div className="h-8 bg-white/10 rounded animate-pulse mx-auto max-w-[120px]" />
                <div className="h-4 bg-white/5 rounded animate-pulse mx-auto max-w-[80px]" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.p
                  key={displayBalance}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-3xl font-bold text-white"
                >
                  {displayBalance?.toFixed(2) || "0.00"} TON
                </motion.p>
              </AnimatePresence>
            )}
          </div>

          {roundInfo && (
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">{t("contract.tickets")}</p>
              <motion.p
                key={roundInfo.ticketsCount}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-xl font-bold text-white"
              >
                {roundInfo.ticketsCount}
              </motion.p>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">{t("contract.statusLabel")}</p>
            {refreshing ? (
              <div className="h-8 bg-white/10 rounded-full animate-pulse mx-auto max-w-[140px]" />
            ) : (
              <AnimatePresence mode="wait">
                <motion.span
                  key={status}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className={`inline-block px-4 py-2 rounded-full font-semibold border ${statusColors[status]}`}
                >
                  {status}
                </motion.span>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default React.memo(ContractStatusComponent);
