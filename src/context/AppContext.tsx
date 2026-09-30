"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { City, Language, NavSection, Theme } from "@/lib/types";
import { CITIES, DEFAULT_CITY } from "@/lib/cities";
import { TRANSLATIONS, TranslationDictionary } from "@/lib/i18n";

interface AppContextType {
  city: City;
  setCity: (city: City) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  activeSection: NavSection;
  setActiveSection: (section: NavSection) => void;
  isMounted: boolean;
  t: TranslationDictionary;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CITY: "gagandrishti_city_id",
  LANG: "gagandrishti_lang",
  THEME: "gagandrishti_theme",
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [city, setCityState] = useState<City>(DEFAULT_CITY);
  const [language, setLanguageState] = useState<Language>("en");
  const [theme, setThemeState] = useState<Theme>("dark");
  const [activeSection, setActiveSection] = useState<NavSection>("citizen");
  const [isMounted, setIsMounted] = useState(false);

  // Initialize from localStorage safely after mount to avoid SSR hydration mismatch
  useEffect(() => {
    try {
      const storedCity = localStorage.getItem(STORAGE_KEYS.CITY);
      if (storedCity) {
        try {
          if (storedCity.startsWith("{")) {
            const parsedCity: City = JSON.parse(storedCity);
            if (parsedCity && parsedCity.lat && parsedCity.lon) {
              setCityState(parsedCity);
            }
          } else {
            const found = CITIES.find((c) => c.id === storedCity);
            if (found) {
              setCityState(found);
            }
          }
        } catch {
          // Ignore parse errors
        }
      }

      const storedLang = localStorage.getItem(STORAGE_KEYS.LANG) as Language | null;
      if (storedLang === "en" || storedLang === "hi" || storedLang === "mr") {
        setLanguageState(storedLang);
      }

      const storedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as Theme | null;
      if (storedTheme === "dark" || storedTheme === "light") {
        setThemeState(storedTheme);
        if (storedTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else {
        document.documentElement.classList.add("dark");
      }
    } catch {
      // LocalStorage unavailable (e.g. private browsing restriction)
      document.documentElement.classList.add("dark");
    } finally {
      setIsMounted(true);
    }
  }, []);

  const setCity = useCallback((newCity: City) => {
    setCityState(newCity);
    try {
      localStorage.setItem(STORAGE_KEYS.CITY, JSON.stringify(newCity));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEYS.LANG, newLang);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  }, [theme, setTheme]);

  const t = TRANSLATIONS[language];

  return (
    <AppContext.Provider
      value={{
        city,
        setCity,
        language,
        setLanguage,
        theme,
        setTheme,
        toggleTheme,
        activeSection,
        setActiveSection,
        isMounted,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
