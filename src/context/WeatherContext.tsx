"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useApp } from "./AppContext";
import { NormalizedWeatherData } from "@/lib/weather/types";
import { fetchCityWeather } from "@/lib/weather/weatherService";

interface WeatherContextType {
  weather: NormalizedWeatherData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refreshWeather: (force?: boolean) => Promise<void>;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { city } = useApp();
  const [weather, setWeather] = useState<NormalizedWeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cityRef = useRef(city.id);
  cityRef.current = city.id;

  const loadWeather = useCallback(
    async (force: boolean = false) => {
      if (force) {
        setIsRefreshing(true);
      } else if (!weather || weather.cityId !== city.id) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await fetchCityWeather(city, force);
        // Ensure city hasn't changed while awaiting response
        if (cityRef.current === city.id) {
          setWeather(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (cityRef.current === city.id) {
          const msg =
            err instanceof Error
              ? err.message
              : "Failed to connect to Open-Meteo weather API.";
          setError(msg);
        }
      } finally {
        if (cityRef.current === city.id) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [city, weather]
  );

  // Auto-fetch when selected city changes
  useEffect(() => {
    loadWeather(false);
  }, [city.id]); // only trigger on city ID change

  return (
    <WeatherContext.Provider
      value={{
        weather,
        isLoading,
        isRefreshing,
        error,
        refreshWeather: loadWeather,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = (): WeatherContextType => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error("useWeather must be used within a WeatherProvider");
  }
  return context;
};
