import { useState, useEffect } from "react";
import { getLocale, setLocale, getTranslations, type Locale, type Translations } from "../src/locales";

export default function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(() => getLocale());
  const [t, setT] = useState<Translations>(() => getTranslations(locale));

  useEffect(() => {
    setT(getTranslations(locale));
    setLocale(locale);
  }, [locale]);

  const changeLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  return { locale, t, changeLocale };
}

