"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { formatAddressShort } from "../lib/address";
import { ENV, hasRequiredEnv } from "../lib/env";

export default function StatusPage() {
  const [healthStatus, setHealthStatus] = useState<{
    ok: boolean;
    network?: string;
    contract?: boolean;
    owner?: boolean;
    toncenter?: boolean;
  } | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [toncenterStatus, setToncenterStatus] = useState<{
    balance: boolean;
    history: boolean;
  } | null>(null);
  const [toncenterLoading, setToncenterLoading] = useState(false);
  const [pingInterval, setPingInterval] = useState<NodeJS.Timeout | null>(null);

  const envCheck = hasRequiredEnv();

  const fetchHealth = async () => {
    try {
      setHealthLoading(true);
      const response = await fetch("/api/health", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Health check failed");
      }
      const data = await response.json();
      setHealthStatus(data);
    } catch (err) {
      console.error("❌ Health check error:", err);
      setHealthStatus({ ok: false });
    } finally {
      setHealthLoading(false);
    }
  };

  const checkToncenter = async () => {
    setToncenterLoading(true);
    setToncenterStatus(null);
    
    try {
      console.log("🔍 Checking Toncenter connectivity...");
      
      // Проверка баланса
      const balanceResponse = await fetch("/api/lottery/balance", {
        signal: AbortSignal.timeout(10000),
      });
      const balanceOk = balanceResponse.ok;
      
      // Проверка истории
      const historyResponse = await fetch("/api/lottery/history", {
        signal: AbortSignal.timeout(10000),
      });
      const historyOk = historyResponse.ok;
      
      setToncenterStatus({
        balance: balanceOk,
        history: historyOk,
      });
      
      if (balanceOk && historyOk) {
        toast.success("✅ Toncenter доступен");
      } else {
        toast.error("❌ Проблемы с Toncenter");
      }
    } catch (err) {
      console.error("❌ Toncenter check error:", err);
      setToncenterStatus({
        balance: false,
        history: false,
      });
      toast.error("❌ Ошибка при проверке Toncenter");
    } finally {
      setToncenterLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} скопировано`);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Ошибка при копировании");
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Обновление каждые 30 секунд
    setPingInterval(interval);
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b0c10] to-[#121826] text-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            TONIX CHAIN
          </h1>
          <p className="text-gray-400">Страница статуса системы</p>
        </motion.div>

        {/* ENV Warning */}
        {!envCheck.allPresent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4"
          >
            <p className="text-yellow-300 font-semibold mb-2">⚠️ Отсутствуют переменные окружения:</p>
            <ul className="list-disc list-inside text-yellow-200 text-sm space-y-1">
              {envCheck.missing.map((key) => (
                <li key={key}>NEXT_PUBLIC_{key}</li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Health Check */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(0,255,255,0.3)]"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-cyan-400">Health Check</h2>
            <div className="flex items-center gap-2">
              {healthLoading ? (
                <span className="text-xs text-gray-400">⏳ Проверка...</span>
              ) : healthStatus?.ok ? (
                <span className="text-xs text-green-400">✅ OK</span>
              ) : (
                <span className="text-xs text-red-400">❌ Ошибка</span>
              )}
              <button
                onClick={fetchHealth}
                disabled={healthLoading}
                className="text-xs text-cyan-300 hover:text-cyan-200 disabled:opacity-50"
              >
                🔄
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Сеть</span>
              <span className="text-white font-mono">{healthStatus?.network || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Контракт настроен</span>
              <span className={healthStatus?.contract ? "text-green-400" : "text-red-400"}>
                {healthStatus?.contract ? "✅" : "❌"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Owner настроен</span>
              <span className={healthStatus?.owner ? "text-green-400" : "text-yellow-400"}>
                {healthStatus?.owner ? "✅" : "⚠️"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Toncenter настроен</span>
              <span className={healthStatus?.toncenter ? "text-green-400" : "text-red-400"}>
                {healthStatus?.toncenter ? "✅" : "❌"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(0,255,255,0.3)]"
        >
          <h2 className="text-xl font-bold text-cyan-400 mb-4">Конфигурация</h2>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-400 mb-1">Адрес контракта</p>
              {ENV.CONTRACT ? (
                <button
                  onClick={() => copyToClipboard(ENV.CONTRACT!, "Адрес контракта")}
                  className="text-cyan-300 font-mono hover:text-cyan-200 cursor-pointer"
                  title={ENV.CONTRACT}
                >
                  {formatAddressShort(ENV.CONTRACT)}
                </button>
              ) : (
                <span className="text-red-400">Не настроен</span>
              )}
            </div>

            {ENV.OWNER && (
              <div>
                <p className="text-sm text-gray-400 mb-1">Owner адрес</p>
                <button
                  onClick={() => copyToClipboard(ENV.OWNER!, "Owner адрес")}
                  className="text-cyan-300 font-mono hover:text-cyan-200 cursor-pointer"
                  title={ENV.OWNER}
                >
                  {formatAddressShort(ENV.OWNER)}
                </button>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-400 mb-1">Toncenter API</p>
              <span className="text-gray-300 text-sm">
                {ENV.TONCENTER ? "Настроен" : "Не настроен"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Toncenter Check */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(0,255,255,0.3)]"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-cyan-400">Проверка Toncenter</h2>
            <button
              onClick={checkToncenter}
              disabled={toncenterLoading}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-all duration-300 disabled:opacity-50"
            >
              {toncenterLoading ? "⏳ Проверка..." : "Проверить Toncenter"}
            </button>
          </div>

          {toncenterStatus && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Баланс API</span>
                <span className={toncenterStatus.balance ? "text-green-400" : "text-red-400"}>
                  {toncenterStatus.balance ? "✅ Доступен" : "❌ Недоступен"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">История API</span>
                <span className={toncenterStatus.history ? "text-green-400" : "text-red-400"}>
                  {toncenterStatus.history ? "✅ Доступен" : "❌ Недоступен"}
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <a
            href="/"
            className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-all duration-300"
          >
            ← Вернуться на главную
          </a>
        </motion.div>
      </div>
    </main>
  );
}

