import "../styles/globals.css";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { useEffect, useState } from "react";
import Script from "next/script";
import { Toaster, toast } from "react-hot-toast";
import { GameProvider } from "../context/GameContext";
import { initAnalytics } from "../lib/analytics";
import { getLocale, setLocale } from "../i18n";

// Sentry инициализация (если DSN задан) - динамическая загрузка
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
      beforeSend(event, hint) {
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
  const [analyticsConsent, setAnalyticsConsent] = useState<boolean | null>(null);

  useEffect(() => {
    // Инициализация локализации
    const savedLocale = localStorage.getItem("tonix_locale");
    if (!savedLocale) {
      const browserLang = navigator.language.toLowerCase();
      setLocale(browserLang.startsWith("en") ? "en" : "ru");
    }

    // Проверка consent для аналитики
    const consent = localStorage.getItem("analytics_consent");
    if (consent === null) {
      setAnalyticsConsent(null); // Показываем баннер
    } else {
      setAnalyticsConsent(consent === "true");
      if (consent === "true") {
        initAnalytics();
      }
    }

    // Парсинг реферальной ссылки из Telegram Mini App
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      const startParam = tg.initDataUnsafe?.start_param;
      
      if (startParam && startParam.startsWith("ref_")) {
        const referrerWallet = startParam.replace("ref_", "");
        if (referrerWallet) {
          localStorage.setItem("referrer_wallet", referrerWallet);
          console.log("🎁 Referrer detected:", referrerWallet);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      tg.expand();

      // CSS переменные для темы
      const applyTheme = () => {
        const bgColor = tg.themeParams.bg_color || "#0b0c10";
        const textColor = tg.themeParams.text_color || "#ffffff";
        const linkColor = tg.themeParams.link_color || "#00FFFF";
        
        document.documentElement.style.setProperty("--tg-bg", bgColor);
        document.documentElement.style.setProperty("--tg-text", textColor);
        document.documentElement.style.setProperty("--tg-link", linkColor);
        
        document.body.style.backgroundColor = bgColor;
        document.body.style.color = textColor;
        tg.setHeaderColor(bgColor);
        tg.setBackgroundColor(bgColor);
        
        document.body.classList.toggle("tg-theme-dark", !bgColor.includes("fff") && !bgColor.includes("FFF"));
        
        console.log("🎨 Telegram Theme changed:", tg.themeParams);
        toast.remove();
      };

      applyTheme();
      tg.onEvent("themeChanged", applyTheme);

      console.log("✅ Telegram WebApp initialized");
      console.log("📱 Platform:", tg.platform);
      console.log("👤 User:", tg.initDataUnsafe?.user);
    }
  }, []);

  const handleAnalyticsConsent = (accepted: boolean) => {
    localStorage.setItem("analytics_consent", accepted.toString());
    setAnalyticsConsent(accepted);
    if (accepted) {
      initAnalytics();
    }
  };

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <Script
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            // DNS prefetch и preconnect
            const link1 = document.createElement('link');
            link1.rel = 'dns-prefetch';
            link1.href = 'https://toncenter.com';
            document.head.appendChild(link1);
            
            const link2 = document.createElement('link');
            link2.rel = 'preconnect';
            link2.href = 'https://toncenter.com';
            document.head.appendChild(link2);
          `,
        }}
      />
      <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
        <GameProvider>
          <Component {...pageProps} />
          <Toaster
            toastOptions={{
              style: {
                background: 'rgba(17, 24, 39, 0.8)',
                color: '#fff',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 255, 255, 0.3)',
              },
              success: {
                iconTheme: {
                  primary: '#00FFFF',
                  secondary: '#0b0c10',
                },
              },
              error: {
                iconTheme: {
                  primary: '#FF0000',
                  secondary: '#0b0c10',
                },
              },
            }}
          />
          {/* Analytics consent banner */}
          {analyticsConsent === null && process.env.NEXT_PUBLIC_POSTHOG_KEY && (
            <div className="fixed bottom-4 left-4 right-4 z-50 bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 text-xs text-yellow-300 flex items-center justify-between gap-2">
              <span>Аналитика выключена</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAnalyticsConsent(true)}
                  className="px-3 py-1 rounded bg-green-500/20 hover:bg-green-500/30 text-green-300"
                >
                  Включить
                </button>
                <button
                  onClick={() => handleAnalyticsConsent(false)}
                  className="px-3 py-1 rounded bg-gray-500/20 hover:bg-gray-500/30"
                >
                  Отклонить
                </button>
              </div>
            </div>
          )}
        </GameProvider>
      </TonConnectUIProvider>
    </>
  );
}
