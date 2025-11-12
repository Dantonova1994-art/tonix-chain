"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export default function AIWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "👾 Привет! Я TONIX-AI. Спрашивай всё про лотерею 💎" },
  ]);

  const askAI = async () => {
    if (!input.trim()) return;
    const question = input.trim();
    setMessages([...messages, { role: "user", text: question }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (!data.ok && !data.answer) throw new Error(data.error || "Ошибка AI");
      setMessages((m) => [...m, { role: "ai", text: data.answer || data.text || "Не удалось получить ответ" }]);
    } catch (err) {
      console.error(err);
      toast.error("AI временно недоступен 🛰");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 shadow-lg shadow-cyan-800/40 flex items-center justify-center text-2xl hover:scale-110 transition-transform ai-glow"
        onClick={() => setOpen(!open)}
        whileTap={{ scale: 0.95 }}
        aria-label="Open TONIX-AI"
      >
        👾
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="ai-modal"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 w-80 max-h-[60vh] bg-[#0a0f1e]/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-xl shadow-cyan-700/20 flex flex-col z-50"
          >
            <div className="p-3 border-b border-cyan-500/20 text-cyan-300 font-semibold text-sm">
              TONIX-AI 🤖
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: m.role === "ai" ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`px-3 py-2 rounded-lg ${
                    m.role === "ai"
                      ? "bg-cyan-900/40 text-cyan-200 self-start"
                      : "bg-purple-900/40 text-purple-200 self-end text-right"
                  }`}
                >
                  {m.text}
                </motion.div>
              ))}
              {loading && (
                <div className="text-cyan-400/70 animate-pulse text-center text-xs">
                  TONIX-AI думает...
                </div>
              )}
            </div>
            <div className="p-3 border-t border-cyan-500/20 flex items-center space-x-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && askAI()}
                className="flex-1 bg-transparent border border-cyan-500/30 rounded-lg px-2 py-1 text-xs text-cyan-100 placeholder-cyan-500/40 focus:outline-none focus:border-cyan-400/60"
                placeholder="Спроси что угодно..."
              />
              <button
                onClick={askAI}
                disabled={loading}
                className="px-2 py-1 text-xs rounded-md bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 transition disabled:opacity-50"
              >
                🚀
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
