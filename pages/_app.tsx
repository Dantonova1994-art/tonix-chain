import "../styles/globals.css";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { useEffect } from "react";
import Script from "next/script";
import { Toaster, toast } from "react-hot-toast";

// Sentry инициализация (если DSN задан) - динамическая загрузка
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
      beforeSend(event, hint) {
        // Логируем ошибки в консоль
        console.error("🔴 Sentry error:", event, hint);
        return event;
      },
    });
    console.log("✅ Sentry initialized");
  }).catch((err) => {
    console.warn("⚠️ Sentry initialization failed:", err);
  });
}

export default function App({ Component, pageProps }: any) {
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      tg.expand();

      const applyTheme = () => {
        const bgColor = tg.themeParams.bg_color || "#0b0c10";
        const textColor = tg.themeParams.text_color || "#ffffff";
        document.body.style.backgroundColor = bgColor;
        document.body.style.color = textColor;
        tg.setHeaderColor(bgColor);
        tg.setBackgroundColor(bgColor);
        console.log("🎨 Telegram Theme changed:", tg.themeParams);

        // Update toast theme
        toast.remove(); // Clear existing toasts to re-render with new theme
      };

      applyTheme(); // Apply theme on initial load
      tg.onEvent("themeChanged", applyTheme); // Apply theme on change

      console.log("✅ Telegram WebApp initialized");
      console.log("📱 Platform:", tg.platform);
      console.log("👤 User:", tg.initDataUnsafe?.user);

      return () => {
        tg.offEvent("themeChanged", applyTheme);
      };
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
        <Toaster
          toastOptions={{
            style: {
              background: 'rgba(17, 24, 39, 0.8)', // bg-gray-900/80
              color: '#fff',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 255, 255, 0.3)', // cyan-500/30
            },
            success: {
              iconTheme: {
                primary: '#00FFFF', // cyan
                secondary: '#0b0c10',
              },
            },
            error: {
              iconTheme: {
                primary: '#FF0000', // red
                secondary: '#0b0c10',
              },
            },
          }}
        />
      </TonConnectUIProvider>
    </>
  );
}
