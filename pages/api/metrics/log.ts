import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event = req.body;
    // Mock endpoint - в продакшене можно отправлять в аналитику (Mixpanel, Amplitude и т.д.)
    console.log('📊 Telemetry event:', event);
    
    // Здесь можно добавить отправку в реальную аналитику
    // await analytics.track(event.type, event);
    
    res.status(200).json({ ok: true });
  } catch (e: any) {
    res.status(200).json({ ok: false, error: e?.message || 'telemetry_error' });
  }
}

