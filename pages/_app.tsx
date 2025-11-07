"use client";

import "../styles/globals.css";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { useEffect, useState } from "react";
import Script from "next/script";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }: any) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Telegram WebApp SDK инициализация
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      // Установка цветов темы
      const bgColor = tg.themeParams.bg_color || "#0b0c10";
      const textColor = tg.themeParams.text_color || "#ffffff";
      
      document.body.style.backgroundColor = bgColor;
      document.body.style.color = textColor;
      
      // Определение темы
      const isDark = !tg.themeParams.bg_color || tg.themeParams.bg_color === "#0b0c10" || tg.themeParams.bg_color?.includes("0b0c10");
      setTheme(isDark ? "dark" : "light");
      
      // Реакция на смену темы
      tg.onEvent("themeChanged", () => {
        const newBgColor = tg.themeParams.bg_color || "#0b0c10";
        const newTextColor = tg.themeParams.text_color || "#ffffff";
        document.body.style.backgroundColor = newBgColor;
        document.body.style.color = newTextColor;
        setTheme(newBgColor.includes("0b0c10") || !newBgColor ? "dark" : "light");
        console.log("🎨 Theme changed:", newBgColor.includes("0b0c10") ? "dark" : "light");
      });
      
      console.log("✅ Telegram WebApp initialized");
      console.log("📱 Platform:", tg.platform);
      console.log("👤 User:", tg.initDataUnsafe?.user);
      console.log("🎨 Theme:", isDark ? "dark" : "light");
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
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: theme === "dark" ? "#1a1b26" : "#ffffff",
              color: theme === "dark" ? "#ffffff" : "#000000",
              border: `1px solid ${theme === "dark" ? "rgba(0,255,255,0.3)" : "rgba(0,0,0,0.1)"}`,
              borderRadius: "12px",
              padding: "12px 16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            },
            success: {
              iconTheme: {
                primary: "#00ff00",
                secondary: "#ffffff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ff0000",
                secondary: "#ffffff",
              },
            },
          }}
        />
      </TonConnectUIProvider>
    </>
  );
}
