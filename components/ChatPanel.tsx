"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const RESPONSES: Record<string, string[]> = {
  balance: [
    "💎 Текущий баланс контракта можно увидеть в блоке Contract Status. Он обновляется каждые 5 секунд!",
    "💰 Баланс контракта отображается в реальном времени. Проверь секцию статуса выше.",
  ],
  rounds: [
    "🎲 Раунды лотереи доступны в разделе 'Rounds'. Там можно увидеть историю всех розыгрышей.",
    "📊 Информация о раундах находится в секции 'Rounds'. Каждый раунд содержит события покупок и розыгрышей.",
  ],
  battle: [
    "⚔️ TON Battle — это мультиплеерная битва на TON. Войди в GameHub и выбери 'TON Battle'.",
    "🎮 TON Battle доступен в игровом хабе. Требуется подключенный кошелек и ставка 0.1 TON.",
  ],
  dao: [
    "🏛️ TONIX DAO — это система управления сообществом. Активные голосования доступны в разделе DAO Dashboard.",
    "🗳️ В DAO можно создавать предложения (Level 5+), голосовать и влиять на развитие платформы.",
    "💎 Токены TIX дают право голоса. Чем больше токенов, тем больше влияние!",
  ],
  token: [
    "🪙 TONIX Token (TIX) — нативный токен платформы. Total Supply: 10,000,000 TIX.",
    "💎 Токены TIX можно получить за активность, покупку билетов или участие в DAO.",
    "📈 Текущий курс и supply можно увидеть в разделе DAO.",
  ],
  help: [
    "💡 Доступные команды: /balance, /rounds, /battle, /dao, /token, /help",
    "🚀 Я TONIX Navigator — твой AI-гид по платформе. Спроси меня о балансе, раундах, битвах или DAO!",
  ],
  default: [
    "💎 Привет, игрок. Хочешь узнать, кто выиграл последний раунд?",
    "🚀 Добро пожаловать в TONIX CHAIN! Я помогу тебе разобраться с платформой.",
    "⚡ Используй команды: /balance, /rounds, /battle, /dao, /token, /help",
  ],
};

export default function ChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "💎 Привет, игрок. Я TONIX Navigator — твой AI-гид. Чем могу помочь?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getResponse = (prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase().trim();

    // Сохранение последней команды в память
    if (lowerPrompt.startsWith("/")) {
      localStorage.setItem("tonix_last_command", lowerPrompt);
    }

    if (lowerPrompt.startsWith("/balance")) {
      return RESPONSES.balance[Math.floor(Math.random() * RESPONSES.balance.length)];
    } else if (lowerPrompt.startsWith("/rounds")) {
      return RESPONSES.rounds[Math.floor(Math.random() * RESPONSES.rounds.length)];
    } else if (lowerPrompt.startsWith("/battle")) {
      return RESPONSES.battle[Math.floor(Math.random() * RESPONSES.battle.length)];
    } else if (lowerPrompt.startsWith("/dao")) {
      return RESPONSES.dao[Math.floor(Math.random() * RESPONSES.dao.length)];
    } else if (lowerPrompt.startsWith("/token")) {
      return RESPONSES.token[Math.floor(Math.random() * RESPONSES.token.length)];
    } else if (lowerPrompt.startsWith("/help")) {
      return RESPONSES.help[Math.floor(Math.random() * RESPONSES.help.length)];
    } else {
      // Проверка памяти для контекста
      const lastCommand = localStorage.getItem("tonix_last_command");
      if (lastCommand === "/dao") {
        return RESPONSES.dao[Math.floor(Math.random() * RESPONSES.dao.length)];
      } else if (lastCommand === "/token") {
        return RESPONSES.token[Math.floor(Math.random() * RESPONSES.token.length)];
      }
      return RESPONSES.default[Math.floor(Math.random() * RESPONSES.default.length)];
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Эмуляция задержки ответа
    setTimeout(() => {
      const response = getResponse(input);
      
      // Плавная печать текста
      let charIndex = 0;
      const typingInterval = setInterval(() => {
        if (charIndex < response.length) {
          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg.role === "assistant" && lastMsg.text.length < response.length) {
              return [...prev.slice(0, -1), { role: "assistant", text: response.slice(0, charIndex + 1) }];
            } else {
              return [...prev, { role: "assistant", text: response.slice(0, charIndex + 1) }];
            }
          });
          charIndex++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
        }
      }, 30);
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="fixed bottom-20 left-4 w-80 h-96 bg-white/10 backdrop-blur-md rounded-2xl border border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.3)] flex flex-col z-50"
    >
      {/* Заголовок */}
      <div className="flex items-center justify-between p-4 border-b border-cyan-500/30">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="text-cyan-400 font-bold">TONIX Navigator</span>
        </div>
        <button
          onClick={onClose}
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
              className={`max-w-[80%] px-3 py-2 rounded-lg ${
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
            placeholder="Введите команду или вопрос..."
            className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-cyan-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 transition-colors"
          >
            →
          </button>
        </div>
      </div>
    </motion.div>
  );
}

