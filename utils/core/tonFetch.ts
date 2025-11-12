type CacheEntry = { data: any; timestamp: number };

const cache = new Map<string, CacheEntry>();

export async function tonFetch(url: string, options: RequestInit = {}, ttl = 10000, retries = 3): Promise<any> {
  const key = url;
  const now = Date.now();

  const cached = cache.get(key);
  if (cached && now - cached.timestamp < ttl) return cached.data;

  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      cache.set(key, { data, timestamp: now });
      return data;
    } catch (err) {
      lastError = err;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw lastError;
}

