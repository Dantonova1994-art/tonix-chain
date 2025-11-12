let socket: WebSocket | null = null;
let listeners: ((data: any) => void)[] = [];

export function subscribeTON(address: string) {
  if (typeof window === 'undefined') return;
  if (socket) return;

  try {
    // Используем альтернативный endpoint, так как tonapi.io может требовать авторизацию
    const wsUrl = process.env.NEXT_PUBLIC_TON_WS_URL || "wss://toncenter.com/api/v2/ws";
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("🔌 TON WebSocket connected");
      socket?.send(JSON.stringify({ type: "subscribe", address }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.type === "transaction" || data?.transaction) {
          listeners.forEach((cb) => cb(data));
        }
      } catch (err) {
        console.warn("WebSocket parse error:", err);
      }
    };

    socket.onerror = (err) => {
      console.warn("WebSocket error:", err);
    };

    socket.onclose = () => {
      console.log("🔌 TON WebSocket disconnected");
      socket = null;
      // Переподключение через 5 секунд
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          subscribeTON(address);
        }
      }, 5000);
    };
  } catch (err) {
    console.error("Failed to create WebSocket:", err);
  }
}

export function onTONUpdate(callback: (data: any) => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((cb) => cb !== callback);
  };
}

export function unsubscribeTON() {
  if (socket) {
    socket.close();
    socket = null;
  }
  listeners = [];
}

