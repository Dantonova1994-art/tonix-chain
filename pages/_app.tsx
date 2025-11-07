import "../styles/globals.css";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { useEffect } from "react";
import Script from "next/script";

export default function App({ Component, pageProps }: any) {
  useEffect(() => {
    // Telegram WebApp SDK инициализация
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      // Установка темной темы
      tg.setHeaderColor("#0b0c10");
      tg.setBackgroundColor("#0b0c10");
      
      console.log("✅ Telegram WebApp initialized");
      console.log("📱 Platform:", tg.platform);
      console.log("👤 User:", tg.initDataUnsafe?.user);
    }
  }, []);

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
        <Component {...pageProps} />
      </TonConnectUIProvider>
    </>
  );
}
