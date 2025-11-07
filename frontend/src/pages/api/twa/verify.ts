import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { initData } = req.query;
  
  if (!initData) {
    return res.status(400).json({ ok: false, error: 'initData required' });
  }

  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    
    if (!botToken) {
      // В режиме разработки пропускаем проверку
      if (process.env.NODE_ENV === 'development') {
        return res.status(200).json({ ok: true, dev: true });
      }
      return res.status(500).json({ ok: false, error: 'Bot token not configured' });
    }

    const parsed = Object.fromEntries(new URLSearchParams(initData as string));
    const checkHash = parsed.hash;
    
    if (!checkHash) {
      return res.status(400).json({ ok: false, error: 'Hash not found in initData' });
    }
    
    delete parsed.hash;
    
    const dataCheckString = Object.keys(parsed)
      .sort()
      .map((k) => `${k}=${parsed[k]}`)
      .join('\n');
    
    const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const hash = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');
    
    if (hash !== checkHash) {
      return res.status(403).json({ ok: false, error: 'Invalid initData hash' });
    }
    
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('Verify error:', err);
    return res.status(500).json({ ok: false, error: err.message || 'Internal error' });
  }
}
