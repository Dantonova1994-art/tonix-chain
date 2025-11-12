"use client";

import { useEffect, useState } from "react";

export default function StatusBar() {
  const [status, setStatus] = useState<"connected"|"syncing"|"error">("syncing");
  const [message, setMessage] = useState("Подключение к сети TON...");

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/metrics/jackpot");
        const data = await res.json();
        if (data.ok) {
          setStatus("connected");
          setMessage("🟢 Сеть TON активна");
        } else {
          setStatus("error");
          setMessage("🔴 Ошибка соединения, повтор...");
        }
      } catch {
        setStatus("error");
        setMessage("🔴 Сеть TON недоступна");
      }
    };
    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className={`status-bar ${status}`}>
        {message}
      </div>
      <style jsx>{`
        .status-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          padding: 6px 12px;
          font-size: 0.9rem;
          text-align: center;
          transition: all 0.3s ease;
          z-index: 1000;
          backdrop-filter: blur(8px);
        }
        .status-bar.connected { 
          background: rgba(0,255,150,0.08); 
          color: #00ffaa; 
        }
        .status-bar.syncing { 
          background: rgba(255,255,0,0.08); 
          color: #ffe680; 
        }
        .status-bar.error { 
          background: rgba(255,0,100,0.08); 
          color: #ff7070; 
        }
      `}</style>
    </>
  );
}

