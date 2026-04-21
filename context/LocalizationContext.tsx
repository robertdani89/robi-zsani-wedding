import {
  DEFAULT_LOCALE,
  Locale,
  TRANSLATIONS,
  TranslationKey,
} from "@/constants/locales/common";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/constants";

interface TranslationParams {
  [key: string]: string | number;
}

interface LocalizationContextType {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  toggleLocale: () => Promise<void>;
  t: (key: TranslationKey, params?: TranslationParams) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(
  undefined,
);

const interpolate = (template: string, params?: TranslationParams): string => {
  if (!params) {
    return template;
  }

  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = params[key];
    return value === undefined ? "" : String(value);
  });
};

export const LocalizationProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const loadLocale = async () => {
      try {
        const savedLocale = await AsyncStorage.getItem(STORAGE_KEYS.LOCALE);
        if (savedLocale === "en" || savedLocale === "hu") {
          setLocaleState(savedLocale);
        }
      } catch (error) {
        console.error("Error loading locale:", error);
      }
    };

    loadLocale();
  }, []);

  const setLocale = async (nextLocale: Locale) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LOCALE, nextLocale);
      setLocaleState(nextLocale);
    } catch (error) {
      console.error("Error saving locale:", error);
    }
  };

  const toggleLocale = async () => {
    const nextLocale: Locale = locale === "hu" ? "en" : "hu";
    await setLocale(nextLocale);
  };

  const t = (key: TranslationKey, params?: TranslationParams) => {
    const activeTranslations =
      TRANSLATIONS[locale] ?? TRANSLATIONS[DEFAULT_LOCALE];
    const fallback = TRANSLATIONS[DEFAULT_LOCALE][key];
    const value = activeTranslations[key] ?? fallback;
    return interpolate(value, params);
  };

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t,
    }),
    [locale],
  );

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error("useLocalization must be used within LocalizationProvider");
  }

  return context;
};
