'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDarkMode } from '@/hooks/useDarkMode';

export function ThemeToggle() {
  const { isDarkMode, toggleTheme, mounted } = useDarkMode();

  // Prevenir desajuste de hidratación manteniendo la estructura pero ocultando el contenido visualmente
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9 opacity-0">
        <span className="sr-only">Cargando tema</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-9 h-9 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5 transition-all" />
      ) : (
        <Moon className="h-5 w-5 transition-all" />
      )}
      <span className="sr-only">Cambiar tema</span>
    </Button>
  );
}
