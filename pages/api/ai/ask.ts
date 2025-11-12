import type { NextApiRequest, NextApiResponse } from "next";

const ANSWERS_RU: Record<string, string> = {
  jackpot: "💎 Текущий джекпот обновляется в реальном времени через блокчейн TON. Вы можете следить за ростом пула прямо на экране.",
  rules: "🎲 Каждый билет участвует в общем пуле. В конце раунда контракт случайным образом выбирает победителя и переводит выигрыш автоматически.",
  pass: "🪪 TONIX PASS — это цифровой пропуск к XP, бонусам и участию в будущих DAO-голосованиях.",
  xp: "⚡ XP начисляется за активность, участие и приглашения друзей. Чем выше XP — тем больше привилегий!",
  referral: "👥 Реферальная программа приносит вам XP и долю от активности друзей. Всё фиксируется ончейн.",
  джекпот: "💎 Текущий джекпот обновляется в реальном времени через блокчейн TON. Вы можете следить за ростом пула прямо на экране.",
  правила: "🎲 Каждый билет участвует в общем пуле. В конце раунда контракт случайным образом выбирает победителя и переводит выигрыш автоматически.",
  билет: "🎟 Нажми «Купить билет» — откроется Tonkeeper для отправки 0.5 TON на контракт. Удачи! 💎",
  раунд: "🪩 Следующий розыгрыш — смотри таймер в Hero. История победителей — в секции Last Winners.",
  помощь: "🤖 Я могу рассказать про джекпот, XP, правила, TONIX PASS или реферальную систему.",
};

const ANSWERS_EN: Record<string, string> = {
  jackpot: "💎 The current jackpot updates in real time via the TON blockchain. You can see it grow live.",
  rules: "🎲 Each ticket joins the global pool. At the end of the round, the smart contract randomly picks a winner and sends the prize instantly.",
  pass: "🪪 TONIX PASS grants access to XP, bonuses, and future DAO voting.",
  xp: "⚡ XP is earned by activity, participation, and inviting friends. Higher XP means more perks!",
  referral: "👥 The referral system gives you XP and a share from your friends' participation. All recorded on-chain.",
  help: "🤖 I can tell you about jackpot, XP, rules, TONIX PASS, or the referral system.",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const { question, lang } = req.body;
  const dict = lang === "en" ? ANSWERS_EN : ANSWERS_RU;
  const q = (question || "").toLowerCase();

  const key = Object.keys(dict).find((k) => q.includes(k)) as keyof typeof dict | undefined;
  const answer = key
    ? dict[key]
    : lang === "ru"
    ? "✨ Я пока не знаю ответ на это, но скоро научусь!"
    : "✨ I don't know the answer yet, but I'll learn soon!";

  return res.status(200).json({ ok: true, answer });
}
