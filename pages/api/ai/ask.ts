import type { NextApiRequest, NextApiResponse } from "next";

async function fetchJSON(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Bad response");
    return await res.json();
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ ok: false, error: "Method not allowed" });

  const { question } = req.body;
  if (!question) return res.status(400).json({ ok: false, error: "Missing question" });

  const q = question.toLowerCase();
  let answer = "✨ Я пока не знаю ответ на это, но скоро научусь!";

  // Получаем базовый URL для внутренних запросов
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host || 'localhost:3000';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;

  // Fetch live metrics
  const jackpotData = await fetchJSON(`${baseUrl}/api/metrics/jackpot`);
  const jackpotValue = jackpotData?.value ? Number(jackpotData.value).toFixed(3) : "—";

  const historyData = await fetchJSON(`${baseUrl}/api/lottery/history`);
  const lastWinner = historyData?.result?.[0]?.winner || historyData?.history?.[0]?.winner || null;

  if (q.includes("джекпот") || q.includes("jackpot")) {
    answer = `💎 Текущий джекпот составляет *${jackpotValue} TON*. Обновляется каждые 5 секунд напрямую с блокчейна TON.`;
  } else if (q.includes("баланс") || q.includes("contract") || q.includes("контракт")) {
    answer = `🔗 Контракт TONIX сейчас содержит *${jackpotValue} TON* на балансе. Всё прозрачно и проверяемо ончейн.`;
  } else if (q.includes("побед") || q.includes("winner") || q.includes("победитель")) {
    answer = lastWinner
      ? `🏆 Последний победитель — \`${lastWinner}\`. Его выигрыш уже зафиксирован в блокчейне.`
      : "🏆 Победителей пока нет, следующий розыгрыш скоро начнётся!";
  } else if (q.includes("правил") || q.includes("rules")) {
    answer = "🎲 Каждая покупка билета участвует в общем пуле. В конце раунда контракт случайно выбирает победителя и отправляет выигрыш напрямую в его кошелёк TON.";
  } else if (q.includes("pass") || q.includes("тон") || q.includes("xp")) {
    answer = "🪪 TONIX PASS открывает доступ к XP-системе, бонусам и будущему DAO-управлению. XP начисляется за активность, розыгрыши и приглашения друзей.";
  }

  return res.status(200).json({ ok: true, answer });
}
