"use client";

import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      ) : (
        <SunIcon className="w-5 h-5 text-gray-400 dark:text-gray-300" />
      )}
    </button>
  );
} 