/**
 * Telemetry logging для событий приложения
 */

export type TelemetryEvent = 
  | { type: "buy_ticket"; wallet: string }
  | { type: "win"; amount: number }
  | { type: "draw"; roundId: number }
  | { type: "connect_wallet"; wallet: string }
  | { type: "share"; method: string };

export async function logEvent(event: TelemetryEvent) {
  try {
    await fetch("/api/metrics/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...event,
        timestamp: Date.now(),
        userAgent: typeof window !== "undefined" ? navigator.userAgent : "",
      }),
    });
  } catch (err) {
    console.warn("⚠️ Telemetry logging failed:", err);
  }
}

