"use client";

import type React from "react";
import { createContext, useContext, useCallback } from "react";
import { useAppearance } from "./AppearanceContext";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Sync with AppearanceContext
  const { appearance, updateAppearance } = useAppearance();

  const theme: Theme = appearance.mode;

  const toggleTheme = useCallback(() => {
    updateAppearance('mode', appearance.mode === 'light' ? 'dark' : 'light');
  }, [appearance.mode, updateAppearance]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
