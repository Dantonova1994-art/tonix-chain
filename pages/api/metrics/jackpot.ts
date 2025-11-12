import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJackpot } from '../../../lib/jackpot';
import { CONTRACT_ADDRESS, ENV } from '../../../lib/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const address = CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
    const rpc = ENV.TONCENTER || process.env.NEXT_PUBLIC_TONCENTER_RPC || 'https://toncenter.com/api/v2/jsonRPC';
    const apiKey = ENV.TONCENTER_KEY || process.env.NEXT_PUBLIC_TONCENTER_API_KEY;
    
    const value = await fetchJackpot({ address, rpc, apiKey });
    
    res.setHeader('Cache-Control', 's-maxage=5, stale-while-revalidate=20');
    res.status(200).json({ ok: true, address, value });
  } catch (e: any) {
    res.status(200).json({ ok: false, error: e?.message || 'jackpot_error' });
  }
}

