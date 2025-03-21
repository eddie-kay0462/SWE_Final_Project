"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children, attribute = "class", defaultTheme = "light", enableSystem = false, disableTransitionOnChange = false }) => {
  const [theme, setTheme] = useState(defaultTheme);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme} data-theme={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};

