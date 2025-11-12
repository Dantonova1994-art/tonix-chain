import "../styles/globals.css";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Script from "next/script";
import { Toaster, toast } from "react-hot-toast";
import { GameProvider } from "../context/GameContext";
import { SoundProvider } from "../components/SoundProvider";
import IntroSequence from "../components/IntroSequence";
import MusicPlayer from "../components/MusicPlayer";
import Navigator from "../components/Navigator";
import SystemNotifier from "../components/SystemNotifier";
import AIWidget from "../components/AIWidget";
import Preloader from "../components/Preloader";
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
  const [showIntro, setShowIntro] = useState(false);
  const router = useRouter();

  // Проверка, показывали ли интро
  useEffect(() => {
    const introSeen = localStorage.getItem("introSeen");
    if (!introSeen) {
      setShowIntro(true);
    }
  }, []);

  // Обработка параметра startapp из Telegram диплинка
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      
      // Проверка параметра startapp из URL или initDataUnsafe
      const url = new URL(window.location.href);
      const startapp = url.searchParams.get("startapp") || tg.initDataUnsafe?.start_param;
      
      console.log("🎯 startapp param:", startapp);
      
      if (startapp === "lottery") {
        localStorage.setItem("tonix_start_target", "lottery");
        console.log("🚀 Auto navigation to: lottery");
      } else if (startapp === "game") {
        localStorage.setItem("tonix_start_target", "game");
        console.log("🚀 Auto navigation to: game");
      } else {
        localStorage.removeItem("tonix_start_target");
      }
    }
  }, [router.asPath]);

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
      console.log("✅ Telegram WebApp initialized", {
        initDataUnsafe: tg.initDataUnsafe,
        initData: tg.initData,
        version: tg.version,
        platform: tg.platform,
        colorScheme: tg.colorScheme,
        themeParams: tg.themeParams,
      });
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
    } else {
      console.warn("⚠️ Telegram WebApp not detected - running in browser mode");
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
      <Preloader />
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
      <TonConnectUIProvider manifestUrl="https://tonix-chain.vercel.app/tonconnect-manifest.json">
        <GameProvider>
          <SoundProvider>
            {showIntro ? (
              <IntroSequence
                onComplete={() => {
                  localStorage.setItem("introSeen", "true");
                  setShowIntro(false);
                }}
              />
            ) : (
              <>
                <Component {...pageProps} />
                <MusicPlayer />
                <Navigator />
                <SystemNotifier />
                <AIWidget />
              </>
            )}
            <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#e6faff',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                fontFamily: "'Satoshi', 'Inter', sans-serif",
                boxShadow: '0 0 20px rgba(0,255,247,0.2)',
              },
              success: {
                className: 'toast-success',
                iconTheme: {
                  primary: '#00ffa3',
                  secondary: '#060913',
                },
                duration: 4000,
              },
              error: {
                className: 'toast-error',
                iconTheme: {
                  primary: '#ff6ad5',
                  secondary: '#060913',
                },
                duration: 4000,
              },
              duration: 4000,
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
            </SoundProvider>
          </GameProvider>
        </TonConnectUIProvider>
    </>
  );
}
