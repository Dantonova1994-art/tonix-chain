"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import { useOnchainEvents } from "../hooks/useOnchainEvents";
import { useSoundContext } from "./SoundProvider";

export default function SystemNotifier() {
  const { play } = useSoundContext();

  useOnchainEvents((event) => {
    console.log("💎 Onchain event:", event);
    
    // Уведомления для разных типов событий
    switch (event.type) {
      case "buy":
        toast.success("💎 Покупка билета успешна!", {
          icon: "🎫",
          duration: 4000,
        });
        play("success");
        break;
      
      case "draw":
        toast("🎲 Новый розыгрыш!", {
          icon: "🎉",
          duration: 4000,
        });
        play("success");
        break;
      
      case "claim":
        toast.success("🎉 Выигрыш получен!", {
          icon: "💰",
          duration: 5000,
        });
        play("success");
        break;
      
      default:
        break;
    }
  });

  // Слушаем события для DAO
  useEffect(() => {
    const handleDAOEvent = (e: CustomEvent) => {
      toast("🧩 Новое DAO-голосование!", {
        icon: "🗳️",
        duration: 4000,
      });
      play("click");
    };

    window.addEventListener("tonix:dao-proposal", handleDAOEvent as EventListener);
    return () => {
      window.removeEventListener("tonix:dao-proposal", handleDAOEvent as EventListener);
    };
  }, [play]);

  // Слушаем события для Battle
  useEffect(() => {
    const handleBattleWin = (e: CustomEvent) => {
      toast.success("🎉 Победа в Battle!", {
        icon: "⚔️",
        duration: 5000,
      });
      play("success");
    };

    window.addEventListener("tonix:battle-win", handleBattleWin as EventListener);
    return () => {
      window.removeEventListener("tonix:battle-win", handleBattleWin as EventListener);
    };
  }, [play]);

  return null; // Компонент не рендерит UI
}

