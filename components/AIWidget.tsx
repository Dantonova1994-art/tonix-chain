"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

async function askNova(q: string) {
  try {
    const r = await fetch("/api/ai/ask", { 
      method: "POST", 
      headers: {"Content-Type":"application/json"}, 
      body: JSON.stringify({ q }) 
    });
    const j = await r.json();
    return j.answer ?? "Nova is thinking...";
  } catch (err) {
    console.error("AI error:", err);
    return "Network error. Try again.";
  }
}

export default function AIWidget() {
  const enabled = process.env.NEXT_PUBLIC_AI_ASSISTANT !== 'false';
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [log, setLog] = useState<{ role: "you"|"nova"; text: string }[]>([
    { role: "nova", text: "Привет! Я NOVA. Спроси меня про джекпот, раунды или как купить билет 🚀" }
  ]);
  
  if (!enabled) return null;

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!q.trim()) return;
    
    const your = { role: "you" as const, text: q.trim() };
    setLog((l) => [...l, your]);
    setQ("");
    
    const a = await askNova(your.text);
    setLog((l) => [...l, { role: "nova", text: a }]);
  };

  return (
    <>
      <motion.button 
        onClick={() => setOpen(!open)} 
        aria-label="Open AI assistant"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-5 right-5 z-40 rounded-full p-3 backdrop-blur-md border border-white/15 bg-white/5 hover:bg-white/10 shadow-lg transition transform"
      >
        👾
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.22 }}
            className="fixed bottom-20 right-5 z-40 w-[86vw] max-w-[380px] glass-panel rounded-2xl border border-white/10 shadow-2xl p-3"
            role="dialog" 
            aria-modal="true" 
            aria-label="NOVA assistant"
          >
            <div className="flex items-center justify-between mb-2">
              <div 
                className="text-sm font-semibold"
                style={{
                  background: "linear-gradient(120deg,#00f0ff,#7b2ff7)",
                  WebkitBackgroundClip: "text",
                  color: "transparent"
                }}
              >
                NOVA — TONIX AI
              </div>
              <button 
                onClick={() => setOpen(false)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="h-56 overflow-y-auto pr-1 space-y-2">
              {log.map((m, i) => (
                <div 
                  key={i} 
                  className={`text-[13px] leading-relaxed ${m.role === "nova" ? "text-white/90" : "text-white/80"}`}
                >
                  <span className="opacity-60 mr-1">{m.role === "nova" ? "NOVA:" : "You:"}</span>
                  {m.text}
                </div>
              ))}
            </div>
            <form onSubmit={submit} className="mt-2 flex gap-2">
              <input 
                value={q} 
                onChange={e=>setQ(e.target.value)} 
                placeholder="Спроси про джекпот, билеты, раунды…"
                className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-cyan-400/60 text-white placeholder-white/40"
              />
              <button 
                type="submit"
                className="rounded-lg px-3 py-2 text-sm font-medium bg-gradient-to-r from-cyan-400 to-violet-500 hover:opacity-90 text-white"
              >
                Send
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

