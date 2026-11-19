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

    if (!disableTransitionOnChange) {
      root.setAttribute(attribute, theme);
      return;
    }

    // Switch every color in the same frame: hover transitions would otherwise
    // fade some elements while the background flips instantly.
    const style = document.createElement("style");
    style.textContent =
      "*,*::before,*::after{transition:none!important}";
    document.head.appendChild(style);

    root.setAttribute(attribute, theme);
    // Apply the new colors before transitions come back.
    void window.getComputedStyle(document.body).color;

    const timeoutId = window.setTimeout(() => style.remove(), 1);

    return () => {
      window.clearTimeout(timeoutId);
      style.remove();
    };
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
