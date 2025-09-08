import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useApp } from '../../context/AppContext';

interface ThemeContextType {
  updateThemeVariables: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { settings } = useApp();

  const updateThemeVariables = () => {
    const root = document.documentElement;
    const theme = settings.theme;

    // Update CSS variables
    root.style.setProperty('--brand-1', theme.primary);
    root.style.setProperty('--brand-2', theme.secondary);
    root.style.setProperty('--brand-3', theme.accentGold);
    root.style.setProperty('--brand-4', theme.accentOrange);
    root.style.setProperty('--brand-grad', 
      `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 35%, ${theme.accentGold} 70%, ${theme.accentOrange} 100%)`
    );

    // Update ring color for focus states
    root.style.setProperty('--ring', `color-mix(in oklab, ${theme.primary} 35%, transparent)`);
  };

  useEffect(() => {
    updateThemeVariables();
  }, [settings.theme]);

  useEffect(() => {
    // Set RTL direction based on language
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
  }, [settings.language]);

  return (
    <ThemeContext.Provider value={{ updateThemeVariables }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};