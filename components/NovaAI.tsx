"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useGame } from "../context/GameContext";
import { useSoundContext } from "./SoundProvider";
import toast from "react-hot-toast";

interface Message {
  role: "user" | "assistant";
  text: string;
  timestamp: number;
}

const NOVA_RESPONSES: Record<string, string[]> = {
  help: [
    "👾 Привет! Я NOVA — твой AI-ассистент в TONIX CHAIN.\n\nДоступные команды:\n/help — справка\n/wallet — баланс кошелька\n/dao — активные голосования\n/xp — твой уровень и XP\n/game — открыть GameHub",
    "💫 Я NOVA, твой проводник в мире TONIX!\n\nКоманды:\n• /wallet — проверить баланс\n• /dao — управление DAO\n• /xp — прогресс игрока\n• /game — игры\n• /help — помощь",
  ],
  wallet: [
    "💎 Проверяю баланс кошелька...",
    "💰 Загружаю данные кошелька...",
  ],
  dao: [
    "🏛️ Активные голосования доступны в DAO Dashboard. Открываю...",
    "🗳️ Проверяю активные предложения в DAO...",
  ],
  xp: [
    "⚡ Загружаю твой прогресс...",
    "🎮 Проверяю уровень и XP...",
  ],
  game: [
    "🎮 Открываю GameHub с играми...",
    "🚀 Запускаю игровую арену...",
  ],
  default: [
    "👾 Я NOVA! Чем могу помочь? Используй /help для списка команд.",
    "💫 Привет! Я твой AI-гид. Попробуй /wallet, /dao, /xp или /game",
  ],
};

export default function NovaAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "👾 Привет! Я NOVA — твой AI-ассистент. Чем могу помочь?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [tonConnectUI] = useTonConnectUI();
  const { xp, levelInfo } = useGame();
  const level = levelInfo.level;
  const { play } = useSoundContext();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getResponse = async (prompt: string): Promise<string> => {
    const lowerPrompt = prompt.toLowerCase().trim();

    if (lowerPrompt.startsWith("/help")) {
      return NOVA_RESPONSES.help[Math.floor(Math.random() * NOVA_RESPONSES.help.length)];
    } else if (lowerPrompt.startsWith("/wallet")) {
      if (!tonConnectUI.connected) {
        return "⚠️ Кошелёк не подключен. Подключи кошелёк через TonConnect.";
      }
      const address = tonConnectUI.account?.address || "—";
      return `💎 Твой кошелёк:\n${address.slice(0, 6)}...${address.slice(-6)}\n\nИспользуй /help для других команд.`;
    } else if (lowerPrompt.startsWith("/dao")) {
      const event = new CustomEvent("tonix:open-dao");
      window.dispatchEvent(event);
      return NOVA_RESPONSES.dao[0];
    } else if (lowerPrompt.startsWith("/xp")) {
      return `⚡ Твой прогресс:\n\nУровень: ${level}\nXP: ${xp}\n\nПродолжай играть, чтобы повысить уровень!`;
    } else if (lowerPrompt.startsWith("/game")) {
      const event = new CustomEvent("tonix:open-gamehub");
      window.dispatchEvent(event);
      return NOVA_RESPONSES.game[0];
    } else {
      // Попытка использовать API, если доступно
      try {
        const apiKey = process.env.NEXT_PUBLIC_NOVA_AI_KEY;
        if (apiKey) {
          const response = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, context: { xp, level, connected: tonConnectUI.connected } }),
          });
          if (response.ok) {
            const data = await response.json();
            return data.response || NOVA_RESPONSES.default[0];
          }
        }
      } catch (err) {
        console.warn("AI API недоступен, используем локальные ответы");
      }
      return NOVA_RESPONSES.default[Math.floor(Math.random() * NOVA_RESPONSES.default.length)];
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", text: input, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    play("click");

    setTimeout(async () => {
      const response = await getResponse(input);
      
      // Плавная печать текста
      let charIndex = 0;
      const typingInterval = setInterval(() => {
        if (charIndex < response.length) {
          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg.role === "assistant" && lastMsg.text.length < response.length) {
              return [...prev.slice(0, -1), { role: "assistant", text: response.slice(0, charIndex + 1), timestamp: Date.now() }];
            } else {
              return [...prev, { role: "assistant", text: response.slice(0, charIndex + 1), timestamp: Date.now() }];
            }
          });
          charIndex++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
          play("success");
        }
      }, 20);
    }, 300);
  };

  return (
    <>
      {/* Кнопка NOVA в правом нижнем углу */}
      <motion.button
        onClick={() => {
          setIsOpen(true);
          play("click");
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 shadow-[0_0_30px_rgba(123,97,255,0.6)] hover:shadow-[0_0_40px_rgba(123,97,255,0.9)] flex items-center justify-center text-3xl transition-all duration-300"
        aria-label="Открыть NOVA AI"
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          👾
        </motion.div>
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full bg-cyan-500/30 blur-xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Модальное окно NOVA */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="fixed bottom-6 right-6 w-96 h-[500px] bg-white/10 backdrop-blur-md rounded-2xl border border-cyan-500/30 shadow-[0_0_40px_rgba(0,255,255,0.4)] flex flex-col z-50"
            >
              {/* Заголовок */}
              <div className="flex items-center justify-between p-4 border-b border-cyan-500/30 bg-gradient-to-r from-purple-500/20 to-cyan-500/20">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👾</span>
                  <span className="text-cyan-400 font-bold text-lg">NOVA AI</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Сообщения */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-lg whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-cyan-500/20 text-cyan-300"
                          : "bg-white/5 text-gray-300"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 px-3 py-2 rounded-lg text-gray-400">
                      <span className="animate-pulse">...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Ввод */}
              <div className="p-4 border-t border-cyan-500/30">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Введите команду (/help, /wallet, /dao, /xp)..."
                    className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-cyan-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={handleSend}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white transition-all"
                  >
                    →
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

