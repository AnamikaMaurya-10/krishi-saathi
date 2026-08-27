import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { t, tWithParams, type Locale } from "@/services/i18n";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  tParams: (key: string, params: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem("krishisaathi-locale");
    return (saved as Locale) || "en";
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("krishisaathi-locale", newLocale);
  }, []);

  const translate = useCallback((key: string) => t(key, locale), [locale]);
  const translateParams = useCallback(
    (key: string, params: Record<string, string | number>) => tWithParams(key, params, locale),
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translate, tParams: translateParams }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
