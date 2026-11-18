"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  attribute = "data-theme",
  defaultTheme = "light",
  disableTransitionOnChange = false,
}: {
  children: ReactNode;
  attribute?: string;
  defaultTheme?: Theme;
  disableTransitionOnChange?: boolean;
}) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");

    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    root.setAttribute(attribute, theme);
    localStorage.setItem("theme", theme);

    if (disableTransitionOnChange) {
      root.style.setProperty("--transition", "none");

      requestAnimationFrame(() => {
        root.style.removeProperty("--transition");
      });
    }
  }, [theme, attribute, disableTransitionOnChange, mounted]);

  const contextValue: ThemeContextType = {
    theme,
    resolvedTheme: theme,
    setTheme,
  };

  const defaultContext: ThemeContextType = {
    theme: defaultTheme,
    resolvedTheme: defaultTheme,
    setTheme: () => {},
  };

  return (
    <ThemeContext.Provider value={mounted ? contextValue : defaultContext}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    return {
      theme: "light" as const,
      resolvedTheme: "light" as const,
      setTheme: () => {},
    };
  }

  return context;
}