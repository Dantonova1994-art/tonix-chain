"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { ENV } from "../../../lib/env";
import toast from "react-hot-toast";

export type BattleState = "idle" | "searching" | "matched" | "fighting" | "finished";

export interface BattleLog {
  type: "player_attack" | "enemy_attack" | "player_critical" | "enemy_critical" | "victory" | "defeat";
  message: string;
  damage?: number;
  timestamp: number;
}

export interface BattleResult {
  winner: "player" | "enemy" | null;
  playerHP: number;
  enemyHP: number;
  rounds: number;
}

const INITIAL_HP = 100;
const MIN_DAMAGE = 5;
const MAX_PLAYER_DAMAGE = 25;
const MAX_ENEMY_DAMAGE = 20;
const CRITICAL_CHANCE = 0.15; // 15% шанс крита
const CRITICAL_MULTIPLIER = 2;

export function useBattle() {
  const [tonConnectUI] = useTonConnectUI();
  const [state, setState] = useState<BattleState>("idle");
  const [playerHP, setPlayerHP] = useState(INITIAL_HP);
  const [enemyHP, setEnemyHP] = useState(INITIAL_HP);
  const [log, setLog] = useState<BattleLog[]>([]);
  const [winner, setWinner] = useState<"player" | "enemy" | null>(null);
  const [rounds, setRounds] = useState(0);
  const battleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFightingRef = useRef(false);

  const addLog = useCallback((logEntry: BattleLog) => {
    setLog((prev) => [...prev, logEntry]);
  }, []);

  const calculateDamage = useCallback((maxDamage: number, isCritical: boolean = false): number => {
    const baseDamage = Math.floor(Math.random() * (maxDamage - MIN_DAMAGE + 1)) + MIN_DAMAGE;
    return isCritical ? Math.floor(baseDamage * CRITICAL_MULTIPLIER) : baseDamage;
  }, []);

  const attack = useCallback(() => {
    if (state !== "fighting" || isFightingRef.current) return;

    const isCritical = Math.random() < CRITICAL_CHANCE;
    const damage = calculateDamage(MAX_PLAYER_DAMAGE, isCritical);
    const newEnemyHP = Math.max(0, enemyHP - damage);
    setEnemyHP(newEnemyHP);

    addLog({
      type: isCritical ? "player_critical" : "player_attack",
      message: isCritical
        ? `💥 Критический удар! Вы нанесли ${damage} урона!`
        : `⚔️ Вы атакуете и наносите ${damage} урона!`,
      damage,
      timestamp: Date.now(),
    });

    if (newEnemyHP <= 0) {
      finishBattle("player");
    }
  }, [state, enemyHP, calculateDamage, addLog]);

  const enemyAttack = useCallback(() => {
    if (state !== "fighting" || isFightingRef.current) return;

    const isCritical = Math.random() < CRITICAL_CHANCE;
    const damage = calculateDamage(MAX_ENEMY_DAMAGE, isCritical);
    const newPlayerHP = Math.max(0, playerHP - damage);
    setPlayerHP(newPlayerHP);

    addLog({
      type: isCritical ? "enemy_critical" : "enemy_attack",
      message: isCritical
        ? `💥 Противник наносит критический удар ${damage} урона!`
        : `⚔️ Противник атакует и наносит ${damage} урона!`,
      damage,
      timestamp: Date.now(),
    });

    if (newPlayerHP <= 0) {
      finishBattle("enemy");
    }
  }, [state, playerHP, calculateDamage, addLog]);

  const finishBattle = useCallback(
    async (battleWinner: "player" | "enemy") => {
      if (isFightingRef.current) return;
      isFightingRef.current = true;

      setState("finished");
      setWinner(battleWinner);

      if (battleIntervalRef.current) {
        clearInterval(battleIntervalRef.current);
        battleIntervalRef.current = null;
      }

      if (battleWinner === "player") {
        addLog({
          type: "victory",
          message: "🏆 ПОБЕДА! Вы выиграли бой!",
          timestamp: Date.now(),
        });

        // Сохраняем результат в localStorage
        const result: BattleResult = {
          winner: "player",
          playerHP,
          enemyHP: 0,
          rounds,
        };
        const history = JSON.parse(localStorage.getItem("battle_history") || "[]");
        history.push({
          ...result,
          timestamp: Date.now(),
          entryValue: parseFloat(ENV.BATTLE_ENTRY_TON || "0.1"),
        });
        localStorage.setItem("battle_history", JSON.stringify(history));

        // Отправляем транзакцию на BattlePool при победе
        const battlePoolAddress = ENV.BATTLEPOOL_ADDRESS;
        if (battlePoolAddress && !battlePoolAddress.startsWith("EQAAAA") && battlePoolAddress !== "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c") {
          try {
            if (tonConnectUI?.connected && tonConnectUI.account?.address) {
              const entryValueTon = parseFloat(ENV.BATTLE_ENTRY_TON || "0.1");
              const entryValueNano = (entryValueTon * 1e9).toString();

              await tonConnectUI.sendTransaction({
                validUntil: Math.floor(Date.now() / 1000) + 300,
                messages: [
                  {
                    address: battlePoolAddress,
                    amount: entryValueNano,
                  },
                ],
              });

              toast.success(`🎉 ${entryValueTon} TON отправлено на BattlePool!`);
            }
          } catch (err: any) {
            console.error("❌ Error sending transaction:", err);
            toast.error("Ошибка при отправке транзакции");
          }
        }
      } else {
        addLog({
          type: "defeat",
          message: "😔 Поражение... Попробуйте ещё раз!",
          timestamp: Date.now(),
        });
      }
    },
    [playerHP, enemyHP, rounds, tonConnectUI, addLog]
  );

  const joinBattle = useCallback(() => {
    if (state !== "idle") return;

    setState("searching");
    setLog([]);
    setPlayerHP(INITIAL_HP);
    setEnemyHP(INITIAL_HP);
    setWinner(null);
    setRounds(0);
    isFightingRef.current = false;

    addLog({
      type: "player_attack",
      message: "🔍 Поиск соперника...",
      timestamp: Date.now(),
    });

    // Имитация поиска соперника (1-3 секунды)
    const searchDelay = Math.floor(Math.random() * 2000) + 1000;
    setTimeout(() => {
      setState("matched");
      addLog({
        type: "player_attack",
        message: "✅ Соперник найден! Бой начинается!",
        timestamp: Date.now(),
      });

      // Начинаем бой через 1 секунду
      setTimeout(() => {
        setState("fighting");
        isFightingRef.current = false;

        // Автоматический цикл боя
        battleIntervalRef.current = setInterval(() => {
          if (isFightingRef.current || state === "finished") {
            if (battleIntervalRef.current) {
              clearInterval(battleIntervalRef.current);
              battleIntervalRef.current = null;
            }
            return;
          }

          // Игрок атакует
          attack();

          // Противник атакует через 700мс
          setTimeout(() => {
            if (!isFightingRef.current && state === "fighting") {
              enemyAttack();
              setRounds((prev) => prev + 1);
            }
          }, 700);
        }, 1500);
      }, 1000);
    }, searchDelay);
  }, [state, attack, enemyAttack, addLog]);

  const resetBattle = useCallback(() => {
    if (battleIntervalRef.current) {
      clearInterval(battleIntervalRef.current);
      battleIntervalRef.current = null;
    }
    isFightingRef.current = false;
    setState("idle");
    setPlayerHP(INITIAL_HP);
    setEnemyHP(INITIAL_HP);
    setLog([]);
    setWinner(null);
    setRounds(0);
  }, []);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (battleIntervalRef.current) {
        clearInterval(battleIntervalRef.current);
      }
    };
  }, []);

  return {
    state,
    playerHP,
    enemyHP,
    log,
    winner,
    rounds,
    joinBattle,
    attack,
    enemyAttack,
    resetBattle,
  };
}

