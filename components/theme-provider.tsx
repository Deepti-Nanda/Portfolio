"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "theme";
const listeners = new Set<() => void>();

// The saved theme lives in localStorage; also follow changes from other tabs.
function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getStoredTheme(): Theme | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
}

function storeTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  listeners.forEach((listener) => listener());
}

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
  // The server (and hydration) render the default; the saved theme follows.
  const theme = useSyncExternalStore(
    subscribe,
    () => getStoredTheme() ?? defaultTheme,
    () => defaultTheme,
  );

  useEffect(() => {
    const root = document.documentElement;

    root.setAttribute(attribute, theme);

    if (disableTransitionOnChange) {
      root.style.setProperty("--transition", "none");

      requestAnimationFrame(() => {
        root.style.removeProperty("--transition");
      });
    }
  }, [theme, attribute, disableTransitionOnChange]);

  const contextValue: ThemeContextType = {
    theme,
    resolvedTheme: theme,
    setTheme: storeTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
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
