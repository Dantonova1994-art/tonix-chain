import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { q } = req.body || {};
  const text = String(q || '').toLowerCase();
  
  // Получаем текущий джекпот для динамических ответов
  let jackpot = "—";
  try {
    const jRes = await fetch(`${req.headers.host?.startsWith('localhost') ? 'http://' : 'https://'}${req.headers.host}/api/metrics/jackpot`);
    if (jRes.ok) {
      const jData = await jRes.json();
      if (jData.ok) {
        jackpot = `${jData.value.toFixed(3)} TON`;
      }
    }
  } catch {}
  
  // Улучшенные ответы с эмоциями
  if (text.includes('джекпот') || text.includes('jackpot')) {
    return res.status(200).json({ 
      answer: `💎 Джекпот растёт как комета! Сейчас ${jackpot} — ты участвуешь?` 
    });
  }
  if (text.includes('билет') || text.includes('ticket') || text.includes('купить')) {
    return res.status(200).json({ 
      answer: "🎟 Нажми «Купить билет» — откроется Tonkeeper для отправки 0.5 TON на контракт. Удачи! 💎" 
    });
  }
  if (text.includes('раунд') || text.includes('draw') || text.includes('розыгрыш')) {
    return res.status(200).json({ 
      answer: "🪩 Следующий розыгрыш — смотри таймер в Hero. История победителей — в секции Last Winners." 
    });
  }
  if (text.includes('привет') || text.includes('hello') || text.includes('hi')) {
    return res.status(200).json({ 
      answer: "😎 Привет! Я NOVA — твой AI-ассистент в TONIX CHAIN. Готов помочь с джекпотом, билетами и раундами!" 
    });
  }
  
  // В будущем здесь можно подключить OpenAI API
  // const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {...});
  
  return res.status(200).json({ 
    answer: "😎 Я готов помочь: спроси про джекпот, раунды, билеты или статус контракта." 
  });
}

