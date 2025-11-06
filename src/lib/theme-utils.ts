/**
 * Centralized theme utilities for dashboard routes
 * Provides consistent colors, backgrounds, and styles for light/dark themes
 */

import { type Theme } from "@/context/ThemeContext";

export const themeColors = {
  // Background Colors
  background: {
    light: "bg-white",
    dark: "bg-neutral-950",
    default: "bg-white dark:bg-neutral-950",
  },
  backgroundSecondary: {
    light: "bg-gray-50",
    dark: "bg-neutral-900",
    default: "bg-gray-50 dark:bg-neutral-900",
  },
  backgroundCard: {
    light: "bg-white",
    dark: "bg-neutral-900/80",
    default: "bg-white dark:bg-neutral-900/80",
  },
  backgroundGlass: {
    light: "bg-white/80 backdrop-blur-md",
    dark: "bg-white/5 backdrop-blur-md",
    default: "bg-white/80 dark:bg-white/5 backdrop-blur-md",
  },

  // Text Colors
  text: {
    light: "text-gray-900",
    dark: "text-white",
    default: "text-gray-900 dark:text-white",
  },
  textSecondary: {
    light: "text-gray-600",
    dark: "text-gray-300",
    default: "text-gray-600 dark:text-gray-300",
  },
  textMuted: {
    light: "text-gray-500",
    dark: "text-gray-400",
    default: "text-gray-500 dark:text-gray-400",
  },
  textDisabled: {
    light: "text-gray-400",
    dark: "text-gray-500",
    default: "text-gray-400 dark:text-gray-500",
  },

  // Border Colors
  border: {
    light: "border-gray-200",
    dark: "border-neutral-800",
    default: "border-gray-200 dark:border-neutral-800",
  },
  borderSecondary: {
    light: "border-gray-300",
    dark: "border-neutral-700",
    default: "border-gray-300 dark:border-neutral-700",
  },

  // Accent Colors (Solana-themed for light, Purple/Indigo for dark)
  accent: {
    light: "text-green-600",
    dark: "text-purple-400",
    default: "text-green-600 dark:text-purple-400",
  },
  accentBg: {
    light: "bg-green-500",
    dark: "bg-purple-500",
    default: "bg-green-500 dark:bg-purple-500",
  },
  accentHover: {
    light: "hover:bg-green-600",
    dark: "hover:bg-purple-600",
    default: "hover:bg-green-600 dark:hover:bg-purple-600",
  },

  // Card Styles
  card: {
    light: "bg-white border-gray-200",
    dark: "bg-neutral-900/80 border-neutral-800",
    default: "bg-white dark:bg-neutral-900/80 border-gray-200 dark:border-neutral-800",
  },
  cardHover: {
    light: "hover:bg-gray-50 hover:border-gray-300",
    dark: "hover:bg-neutral-800/80 hover:border-neutral-700",
    default: "hover:bg-gray-50 dark:hover:bg-neutral-800/80 hover:border-gray-300 dark:hover:border-neutral-700",
  },

  // Input Styles
  input: {
    light: "bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-green-500",
    dark: "bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-purple-500",
    default: "bg-gray-50 dark:bg-white/5 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/50 focus:border-green-500 dark:focus:border-purple-500",
  },

  // Button Styles
  buttonPrimary: {
    light: "bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600",
    dark: "bg-white text-black hover:bg-white/90",
    default: "bg-gradient-to-r from-green-500 to-teal-500 dark:bg-white text-white dark:text-black hover:from-green-600 hover:to-teal-600 dark:hover:bg-white/90",
  },
  buttonSecondary: {
    light: "bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200",
    dark: "bg-white/5 border-white/20 text-white hover:bg-white/10",
    default: "bg-gray-100 dark:bg-white/5 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10",
  },
};

/**
 * Get theme-based class names
 */
export function getThemeClasses(theme: Theme, type: keyof typeof themeColors): string {
  const colorSet = themeColors[type] as { light: string; dark: string; default: string };
  return colorSet[theme] || colorSet.default;
}

/**
 * Get combined theme classes for multiple properties
 */
export function getThemeClassesCombined(
  theme: Theme,
  ...types: Array<keyof typeof themeColors>
): string {
  return types.map((type) => getThemeClasses(theme, type)).join(" ");
}

/**
 * Dashboard-specific theme utilities
 */
export const dashboardTheme = {
  // Main container
  container: "min-h-screen",
  
  // Background gradients
  backgroundGradient: {
    light: "bg-gradient-to-br from-green-50/30 via-white to-teal-50/30",
    dark: "bg-gradient-to-br from-purple-900/20 via-neutral-950 to-indigo-900/20",
    default: "bg-gradient-to-br from-green-50/30 via-white to-teal-50/30 dark:from-purple-900/20 dark:via-neutral-950 dark:to-indigo-900/20",
  },

  // Sidebar
  sidebar: {
    light: "bg-white border-r border-gray-200",
    dark: "bg-neutral-900 border-r border-neutral-800",
    default: "bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800",
  },

  // Main content area
  content: {
    light: "bg-white",
    dark: "bg-neutral-950",
    default: "bg-white dark:bg-neutral-950",
  },

  // Text colors
  text: {
    primary: "text-gray-900 dark:text-white",
    secondary: "text-gray-600 dark:text-gray-300",
    muted: "text-gray-500 dark:text-gray-400",
  },
};

/**
 * React hook for easy theme-based styling
 * Usage: const { bg, text, border } = useThemeClasses();
 */
export function useThemeClasses() {
  // This will be used in components with useTheme hook
  return {
    // Backgrounds
    bg: {
      primary: "bg-white dark:bg-neutral-950",
      secondary: "bg-gray-50 dark:bg-neutral-900",
      card: "bg-white dark:bg-neutral-900/80",
      glass: "bg-white/80 dark:bg-white/5 backdrop-blur-md",
    },
    // Text
    text: {
      primary: "text-gray-900 dark:text-white",
      secondary: "text-gray-600 dark:text-gray-300",
      muted: "text-gray-500 dark:text-gray-400",
      disabled: "text-gray-400 dark:text-gray-500",
    },
    // Borders
    border: {
      primary: "border-gray-200 dark:border-neutral-800",
      secondary: "border-gray-300 dark:border-neutral-700",
    },
    // Cards
    card: "bg-white dark:bg-neutral-900/80 border-gray-200 dark:border-neutral-800",
    cardHover: "hover:bg-gray-50 dark:hover:bg-neutral-800/80",
    // Inputs
    input: "bg-gray-50 dark:bg-white/5 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/50 focus:border-green-500 dark:focus:border-purple-500",
    // Buttons
    buttonPrimary: "bg-gradient-to-r from-green-500 to-teal-500 dark:bg-white text-white dark:text-black hover:from-green-600 hover:to-teal-600 dark:hover:bg-white/90",
    buttonSecondary: "bg-gray-100 dark:bg-white/5 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10",
  };
}

