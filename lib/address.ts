/**
 * Нормализация адресов TON
 */

/**
 * Приводит friendly адрес (EQ...) к верхнему регистру без пробелов
 */
export function normalizeFriendly(addr: string): string {
  if (!addr) return "";
  return addr.trim().toUpperCase().replace(/\s+/g, "");
}

/**
 * Убирает префиксы workchain (-1:, 0:) из адреса
 */
export function stripWorkchainPrefix(addr: string): string {
  if (!addr) return "";
  // Убираем префиксы типа "0:EQ..." или "-1:EQ..."
  return addr.replace(/^[-]?\d+:/, "");
}

/**
 * Сравнивает два адреса кошелька (нормализует оба и сравнивает)
 */
export function sameWallet(a: string, b: string): boolean {
  if (!a || !b) return false;
  const normalizedA = normalizeFriendly(stripWorkchainPrefix(a));
  const normalizedB = normalizeFriendly(stripWorkchainPrefix(b));
  return normalizedA === normalizedB;
}

/**
 * Форматирует адрес для отображения (укороченный формат)
 */
export function formatAddressShort(addr: string, start: number = 6, end: number = 4): string {
  if (!addr) return "—";
  const normalized = normalizeFriendly(stripWorkchainPrefix(addr));
  if (normalized.length <= start + end) return normalized;
  return `${normalized.slice(0, start)}...${normalized.slice(-end)}`;
}

