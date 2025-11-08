/**
 * Хук для управления звуками через howler.js
 */

import { useState, useEffect, useRef } from "react";
import { Howl } from "howler";

const SOUNDS = {
  click: "/sounds/click.mp3",
  success: "/sounds/success.mp3",
  alert: "/sounds/alert.mp3",
  battle: "/sounds/battle.mp3",
} as const;

type SoundName = keyof typeof SOUNDS;

const soundCache: Record<string, Howl> = {};

export function useSound() {
  const [enabled, setEnabled] = useState(true);
  const soundsRef = useRef<Record<string, Howl>>({});

  useEffect(() => {
    // Загрузка состояния из localStorage
    const saved = localStorage.getItem("tonix_sound_enabled");
    if (saved !== null) {
      setEnabled(saved === "true");
    }
  }, []);

  useEffect(() => {
    // Сохранение состояния в localStorage
    localStorage.setItem("tonix_sound_enabled", enabled.toString());
  }, [enabled]);

  const loadSound = (name: SoundName): Howl => {
    if (soundCache[name]) {
      return soundCache[name];
    }

    const sound = new Howl({
      src: [SOUNDS[name]],
      volume: 0.5,
      preload: true,
    });

    soundCache[name] = sound;
    return sound;
  };

  const play = (name: SoundName) => {
    if (!enabled) return;

    try {
      const sound = loadSound(name);
      sound.play();
    } catch (err) {
      console.warn("⚠️ Sound playback failed:", err);
    }
  };

  const toggle = () => {
    setEnabled((prev) => !prev);
  };

  return { play, enabled, toggle };
}

