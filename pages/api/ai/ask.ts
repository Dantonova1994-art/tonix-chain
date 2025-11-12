import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q } = req.body || {};
  const text = String(q || '').toLowerCase();

  // Простые правила без внешних API
  if (text.includes('джекпот') || text.includes('jackpot')) {
    return res.status(200).json({ answer: "Текущий джекпот обновляется каждые 5 секунд на главной — и доступен в секции Status." });
  }
  
  if (text.includes('билет') || text.includes('ticket')) {
    return res.status(200).json({ answer: "Нажми «Купить билет» — откроется Tonkeeper для отправки 0.5 TON на контракт. Удачи! 💎" });
  }
  
  if (text.includes('раунд') || text.includes('draw')) {
    return res.status(200).json({ answer: "Следующий розыгрыш — смотри таймер в Hero. История победителей — в секции Last Winners." });
  }
  
  if (text.includes('помощь') || text.includes('help')) {
    return res.status(200).json({ answer: "Я могу помочь с информацией о джекпоте, покупке билетов, раундах и статусе контракта. Спроси что угодно! 🚀" });
  }

  return res.status(200).json({ answer: "Я готов помочь: спроси про джекпот, раунды, билеты или статус контракта." });
}

