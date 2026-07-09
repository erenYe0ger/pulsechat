import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined
);

function getThemeStorageKey(userId?: string | number): string {
  return `theme:${userId ?? "guest"}`;
}

function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function getStoredTheme(storageKey: string): Theme {
  return localStorage.getItem(storageKey) === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { user } = useAuth();
  const storageKey = getThemeStorageKey(user?.id);
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme(storageKey));

  useEffect(() => {
    const storedTheme = getStoredTheme(storageKey);

    setTheme(storedTheme);
    applyTheme(storedTheme);
  }, [storageKey]);

  function toggleTheme(): void {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "light" ? "dark" : "light";

      localStorage.setItem(storageKey, nextTheme);
      applyTheme(nextTheme);

      return nextTheme;
    });
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }

  return context;
}
