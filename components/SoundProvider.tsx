"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useSound } from "../hooks/useSound";

interface SoundContextType {
  play: (name: "click" | "success" | "alert" | "battle") => void;
  enabled: boolean;
  toggle: () => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const sound = useSound();

  return (
    <SoundContext.Provider value={sound}>
      {children}
      {/* Toggle звука в верхнем правом углу */}
      <button
        onClick={sound.toggle}
        className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-cyan-500/30 flex items-center justify-center hover:bg-white/20 transition-all"
        aria-label={sound.enabled ? "Выключить звук" : "Включить звук"}
      >
        {sound.enabled ? "🔊" : "🔇"}
      </button>
    </SoundContext.Provider>
  );
}

export function useSoundContext() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSoundContext must be used within SoundProvider");
  }
  return context;
}

