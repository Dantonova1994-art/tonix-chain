/**
 * Простая i18n прослойка для RU/EN локализации
 */

export type Locale = "ru" | "en";

const translations = {
  ru: {
    hero: {
      title: "TONIX CHAIN",
      subtitle: "Лотерея будущего на TON — децентрализованная, прозрачная и мгновенная.",
      cta: "🚀 НАЧАТЬ ИГРУ",
    },
    wallet: {
      connect: "Подключить кошелёк",
      connected: "Кошелёк подключен",
      address: "Адрес",
    },
    contract: {
      status: "Статус контракта",
      prizePool: "💰 Призовой фонд",
      tickets: "🎟 Билетов",
      round: "Раунд",
      statusLabel: "🎯 Статус",
      participants: "👥 Участников",
      refresh: "Обновить",
    },
    buy: {
      button: "🎟 Купить билет — 0.5 TON",
      loading: "Отправка транзакции...",
      success: "🎟 Билет куплен успешно!",
      error: "❌ Ошибка при транзакции",
      connectFirst: "Сначала подключите кошелёк",
    },
    rounds: {
      title: "Раунды",
      current: "Текущий раунд",
      currentLabel: "(текущий)",
    },
    history: {
      title: "История событий",
      empty: "История пуста",
      buy: "купил билет",
      draw: "Розыгрыш проведён",
      claim: "забрал приз",
    },
    tickets: {
      title: "Мои билеты",
      total: "Всего",
      empty: "У вас пока нет билетов",
      connect: "Подключите кошелёк, чтобы увидеть свои билеты",
    },
    wins: {
      title: "Мои выигрыши",
      total: "Всего",
      empty: "У вас пока нет выигрышей",
      connect: "Подключите кошелёк, чтобы увидеть свои выигрыши",
      winInRound: "Выигрыш в раунде",
    },
    games: {
      hub: "🎮 Игровая Арена TONIX",
      subtitle: "Выиграй бонусы TON!",
      miniGames: "Mini Games",
      flip: "Flip & Win",
      catch: "Catch TONs",
      spin: "Spin the Galaxy",
      play: "Играть 🎮",
      home: "🏠",
      back: "← Назад",
    },
    xp: {
      level: "Уровень",
      xp: "XP",
      dailyBonus: "🎁 Получить ежедневный бонус",
      bonusClaimed: "🎁 Ежедневный бонус получен!",
      newLevel: "🎉 Новый уровень!",
    },
    leaderboard: {
      title: "🏆 Лидерборд",
      empty: "Пока нет участников",
      enterName: "Введите ваше имя:",
      welcome: "Добро пожаловать",
      topEntry: "🔥 Новый уровень! Ты вошёл в ТОП!",
    },
    status: {
      title: "TONIX CHAIN",
      subtitle: "Страница статуса системы",
      health: "Health Check",
      config: "Конфигурация",
      toncenter: "Проверка Toncenter",
      check: "Проверить Toncenter",
      back: "← Вернуться на главную",
    },
    footer: {
      copyright: "© TONIX Chain — The Future of Web3 Games 💎",
      status: "Статус системы",
    },
    toast: {
      copied: "Скопировано",
      networkBusy: "⚠️ Сеть перегружена, попробуйте позже",
      error: "Ошибка",
    },
  },
  en: {
    hero: {
      title: "TONIX CHAIN",
      subtitle: "The future lottery on TON — decentralized, transparent, and instant.",
      cta: "🚀 START GAME",
    },
    wallet: {
      connect: "Connect wallet",
      connected: "Wallet connected",
      address: "Address",
    },
    contract: {
      status: "Contract Status",
      prizePool: "💰 Prize Pool",
      tickets: "🎟 Tickets",
      round: "Round",
      statusLabel: "🎯 Status",
      participants: "👥 Participants",
      refresh: "Refresh",
    },
    buy: {
      button: "🎟 Buy ticket — 0.5 TON",
      loading: "Sending transaction...",
      success: "🎟 Ticket purchased successfully!",
      error: "❌ Transaction error",
      connectFirst: "Please connect wallet first",
    },
    rounds: {
      title: "Rounds",
      current: "Current round",
      currentLabel: "(current)",
    },
    history: {
      title: "Event History",
      empty: "History is empty",
      buy: "bought ticket",
      draw: "Draw conducted",
      claim: "claimed prize",
    },
    tickets: {
      title: "My Tickets",
      total: "Total",
      empty: "You have no tickets yet",
      connect: "Connect wallet to see your tickets",
    },
    wins: {
      title: "My Wins",
      total: "Total",
      empty: "You have no wins yet",
      connect: "Connect wallet to see your wins",
      winInRound: "Win in round",
    },
    games: {
      hub: "🎮 TONIX Game Arena",
      subtitle: "Win TON bonuses!",
      miniGames: "Mini Games",
      flip: "Flip & Win",
      catch: "Catch TONs",
      spin: "Spin the Galaxy",
      play: "Play 🎮",
      home: "🏠",
      back: "← Back",
    },
    xp: {
      level: "Level",
      xp: "XP",
      dailyBonus: "🎁 Claim daily bonus",
      bonusClaimed: "🎁 Daily bonus claimed!",
      newLevel: "🎉 New level!",
    },
    leaderboard: {
      title: "🏆 Leaderboard",
      empty: "No participants yet",
      enterName: "Enter your name:",
      welcome: "Welcome",
      topEntry: "🔥 New level! You entered TOP!",
    },
    status: {
      title: "TONIX CHAIN",
      subtitle: "System status page",
      health: "Health Check",
      config: "Configuration",
      toncenter: "Toncenter Check",
      check: "Check Toncenter",
      back: "← Back to home",
    },
    footer: {
      copyright: "© TONIX Chain — The Future of Web3 Games 💎",
      status: "System status",
    },
    toast: {
      copied: "Copied",
      networkBusy: "⚠️ Network busy, please try later",
      error: "Error",
    },
  },
};

let currentLocale: Locale = "ru";

export function setLocale(locale: Locale) {
  currentLocale = locale;
  if (typeof window !== "undefined") {
    localStorage.setItem("tonix_locale", locale);
  }
}

export function getLocale(): Locale {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("tonix_locale") as Locale;
    if (saved && (saved === "ru" || saved === "en")) {
      return saved;
    }
    // Auto-detect from browser
    const lang = navigator.language.toLowerCase();
    if (lang.startsWith("en")) {
      return "en";
    }
  }
  return currentLocale;
}

export function t(key: string): string {
  const keys = key.split(".");
  let value: any = translations[getLocale()];
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      // Fallback to Russian
      value = translations.ru;
      for (const k2 of keys) {
        value = value?.[k2];
      }
      break;
    }
  }
  
  return typeof value === "string" ? value : key;
}
