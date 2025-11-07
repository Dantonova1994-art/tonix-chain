/**
 * Универсальный helper для fetch с таймаутом и обработкой ошибок
 */

export interface FetchOptions extends RequestInit {
  timeout?: number;
}

export async function fetchJSON(
  url: string,
  options: FetchOptions = {},
  timeout: number = 15000
): Promise<any> {
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
    if (err.name === "AbortError") {
      throw new Error("Request timeout");
    }
    throw err;
  }
}

