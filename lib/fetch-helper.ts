/**
 * Универсальный helper для fetch с таймаутом, ретраями и обработкой ошибок
 */

export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
}

export async function fetchJSON(
  url: string,
  options: FetchOptions = {},
  timeout: number = 15000
): Promise<any> {
  const retries = options.retries ?? 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;

      if (err.name === "AbortError") {
        lastError = new Error("Request timeout");
      }

      // Экспоненциальный backoff: 200ms → 600ms
      if (attempt < retries) {
        const delay = 200 * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  throw lastError || new Error("Request failed after retries");
}
