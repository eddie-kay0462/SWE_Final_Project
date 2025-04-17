"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { useSidebar } from "@/components/ui/sidebar";

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { open } = useSidebar();

  return (
    <button
      onClick={toggleDarkMode}
      className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-neutral-200/50 dark:hover:bg-[#262626] hover:shadow-sm"
    >
      {darkMode ? (
        <>
          <Sun className="h-6 w-6 text-neutral-700 dark:text-neutral-100" />
          {open && <span className="text-neutral-700 dark:text-neutral-100">Light Mode</span>}
        </>
      ) : (
        <>
          <Moon className="h-6 w-6 text-neutral-700 dark:text-neutral-100" />
          {open && <span className="text-neutral-700 dark:text-neutral-100">Dark Mode</span>}
        </>
      )}
    </button>
  );
};

export default ThemeToggle; 