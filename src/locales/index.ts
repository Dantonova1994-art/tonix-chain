import { ru } from "./ru";
import { en } from "./en";

export type Locale = "ru" | "en";
export type Translations = typeof ru;

const translations: Record<Locale, Translations> = {
  ru,
  en,
};

export function getTranslations(locale: Locale = "ru"): Translations {
  return translations[locale] || translations.ru;
}

export function setLocale(locale: Locale) {
  if (typeof window !== "undefined") {
    localStorage.setItem("tonix_locale", locale);
  }
}

export function getLocale(): Locale {
  if (typeof window === "undefined") return "ru";
  const saved = localStorage.getItem("tonix_locale");
  if (saved === "en" || saved === "ru") return saved;
  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith("en") ? "en" : "ru";
}

