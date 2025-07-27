import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

/**
 * Theme context interface
 */
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

/**
 * Theme context with default values
 */
const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

/**
 * Theme provider props interface
 */
interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme provider component that manages dark/light mode state
 * @param children - React children components
 * @returns Theme context provider
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  /**
   * Toggle between light and dark themes
   */
  const toggleTheme = (): void => {
    setIsDark(!isDark);
  };

  /**
   * Set specific theme
   * @param theme - Theme to set ('light' or 'dark')
   */
  const setTheme = (theme: 'light' | 'dark'): void => {
    setIsDark(theme === 'dark');
  };

  useEffect(() => {
    // Update document class and localStorage when theme changes
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const value: ThemeContextType = {
    isDark,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to use theme context
 * @returns Theme context values
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 