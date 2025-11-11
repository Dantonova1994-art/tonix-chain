"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Howl } from "howler";

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [showControls, setShowControls] = useState(false);
  const soundRef = useRef<Howl | null>(null);

  useEffect(() => {
    // Загрузка состояния из localStorage
    const savedVolume = localStorage.getItem("tonix_music_volume");
    const savedMuted = localStorage.getItem("tonix_music_muted");
    
    if (savedVolume) {
      setVolume(parseFloat(savedVolume));
    }
    
    if (savedMuted === "true") {
      setIsPlaying(false);
    }

    // Инициализация музыки
    try {
      soundRef.current = new Howl({
        src: ["/sounds/bg_music.mp3"],
        volume: savedMuted === "true" ? 0 : parseFloat(savedVolume || "0.3"),
        loop: true,
        preload: true,
        onload: () => {
          console.log("🎵 Background music loaded");
        },
        onloaderror: (id, error) => {
          console.warn("⚠️ Music file not found, skipping:", error);
        },
      });
    } catch (err) {
      console.warn("⚠️ Howl initialization failed:", err);
    }

    // Автозапуск при фокусе
    const handleFocus = () => {
      if (soundRef.current && !isPlaying && savedMuted !== "true") {
        soundRef.current.play();
        setIsPlaying(true);
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      if (soundRef.current) {
        soundRef.current.unload();
      }
    };
  }, []);

  const togglePlay = () => {
    if (!soundRef.current) return;

    if (isPlaying) {
      soundRef.current.pause();
      setIsPlaying(false);
      localStorage.setItem("tonix_music_muted", "true");
    } else {
      soundRef.current.play();
      setIsPlaying(true);
      localStorage.setItem("tonix_music_muted", "false");
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (soundRef.current) {
      soundRef.current.volume(newVolume);
    }
    localStorage.setItem("tonix_music_volume", newVolume.toString());
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.button
        onClick={() => setShowControls(!showControls)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`music-button ${isPlaying ? 'playing' : ''}`}
        aria-label="Music player"
      >
        {isPlaying ? "🎵" : "🔇"}
      </motion.button>

      {showControls && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-16 right-0 w-64 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-cyan-500/30 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-cyan-300">Background Music</span>
            <button
              onClick={togglePlay}
              className="text-2xl hover:scale-110 transition-transform"
            >
              {isPlaying ? "⏸️" : "▶️"}
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-400">Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="text-xs text-gray-500 text-right">{Math.round(volume * 100)}%</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

