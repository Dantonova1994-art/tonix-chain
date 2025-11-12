import type { NextApiRequest, NextApiResponse } from 'next';
import { tonFetch, respond } from '../fix/_shared';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  if (!address) {
    return respond(res, { ok: false, error: "Missing contract address" }, 500);
  }

  const rpc = await tonFetch("getAddressBalance", [address]);

  if (!rpc || !rpc.result) {
    return respond(res, {
      ok: false,
      value: 0,
      error: "Network unreachable or TON RPC failed",
    }, 503);
  }

  // Toncenter возвращает баланс в нанотонах как строку
  const balanceNanotons = BigInt(rpc.result || '0');
  const balanceTon = Number(balanceNanotons) / 1e9;

  respond(res, { ok: true, value: balanceTon });
}
