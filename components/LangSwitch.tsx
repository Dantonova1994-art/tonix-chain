"use client";

import useLocale from "../hooks/useLocale";
import { type Locale } from "../src/locales";

export default function LangSwitch() {
  const { locale, changeLocale } = useLocale();

  const toggle = () => {
    changeLocale(locale === "ru" ? "en" : "ru");
  };

  return (
    <button
      onClick={toggle}
      className="lang-switch"
      aria-label="Switch language"
    >
      {locale === "ru" ? "EN" : "RU"}
      <style jsx>{`
        .lang-switch {
          position: fixed;
          top: 8px;
          right: 12px;
          z-index: 1001;
          padding: 4px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--text-main);
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(8px);
        }
        .lang-switch:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
        }
      `}</style>
    </button>
  );
}

