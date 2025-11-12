export async function fetchJackpot({ address, rpc, apiKey }: { address: string; rpc: string; apiKey?: string }) {
  try {
    // Используем правильный формат для Toncenter API
    const endpoint = rpc.includes('/jsonRPC') ? rpc : `${rpc}/jsonRPC`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        method: 'getAddressBalance',
        params: { address },
        id: 1,
      }),
      cache: 'no-store',
    });
    
    if (!response.ok) throw new Error('Failed to fetch balance');
    
    const data = await response.json();
    const nanotons = BigInt(data.result?.balance ?? '0');
    return Number(nanotons) / 1e9;
  } catch (err) {
    console.error('Jackpot fetch error:', err);
    throw err;
  }
}

