import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, context } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const apiKey = process.env.NEXT_PUBLIC_NOVA_AI_KEY || process.env.OPENAI_API_KEY;

  // Если API ключ не настроен, используем локальные ответы
  if (!apiKey) {
    const localResponse = getLocalResponse(prompt, context);
    return res.status(200).json({ response: localResponse });
  }

  try {
    // Интеграция с OpenAI API (если настроено)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Ты NOVA — AI-ассистент в TONIX CHAIN, децентрализованной лотерее на TON. Отвечай кратко и дружелюбно.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI API error");
    }

    const data = await response.json();
    return res.status(200).json({ response: data.choices[0]?.message?.content || getLocalResponse(prompt, context) });
  } catch (err) {
    console.error("AI API error:", err);
    // Fallback на локальные ответы
    const localResponse = getLocalResponse(prompt, context);
    return res.status(200).json({ response: localResponse });
  }
}

function getLocalResponse(prompt: string, context?: any): string {
  const lowerPrompt = prompt.toLowerCase().trim();

  if (lowerPrompt.includes("wallet") || lowerPrompt.includes("кошелёк")) {
    return context?.connected
      ? "💎 Твой кошелёк подключен. Используй /wallet для деталей."
      : "⚠️ Кошелёк не подключен. Подключи через TonConnect.";
  }

  if (lowerPrompt.includes("dao") || lowerPrompt.includes("голосование")) {
    return "🏛️ DAO доступен в разделе управления. Используй /dao для открытия.";
  }

  if (lowerPrompt.includes("xp") || lowerPrompt.includes("уровень")) {
    return `⚡ Твой уровень: ${context?.level || 1}, XP: ${context?.xp || 0}. Продолжай играть!`;
  }

  if (lowerPrompt.includes("game") || lowerPrompt.includes("игра")) {
    return "🎮 GameHub открыт! Используй /game для доступа ко всем играм.";
  }

  return "👾 Я NOVA! Используй /help для списка команд или задай вопрос о TONIX CHAIN.";
}

