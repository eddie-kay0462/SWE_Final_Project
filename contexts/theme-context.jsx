/**
 * Theme context provider and hook for managing application-wide theme state
 * Uses next-themes under the hood for better Next.js integration
 */

"use client";

import React from "react";
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";

/**
 * Theme provider component that wraps the application
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function ThemeProvider({ children }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

/**
 * Custom hook to access and manage theme state
 * @returns {Object} Theme state and functions
 */
export function useTheme() {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme, systemTheme } = useNextTheme();

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return {
      darkMode: false,
      toggleDarkMode: () => null,
    };
  }

  const darkMode = theme === "dark";

  return {
    darkMode,
    toggleDarkMode: () => setTheme(darkMode ? "light" : "dark"),
  };
} 