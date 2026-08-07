'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * Hook modularizado para el manejo del modo oscuro.
 * Encapsula la lógica de next-themes (que guarda nativamente en localStorage)
 * y previene problemas de hidratación en React.
 */
export function useDarkMode() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Asegurar que el componente cliente esté montado para leer localStorage
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && (theme === 'dark' || (theme === 'system' && systemTheme === 'dark'));

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  const setExplicitTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  return {
    isDarkMode,
    theme: mounted ? theme : 'system',
    toggleTheme,
    setTheme: setExplicitTheme,
    mounted,
  };
}
