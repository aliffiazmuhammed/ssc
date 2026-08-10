import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../store/ThemeContext';
import clsx from 'clsx';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={clsx(
        "p-2 rounded-full transition-colors flex items-center justify-center shadow-sm",
        "bg-surface-light dark:bg-surface-dark",
        "border border-divider-light dark:border-divider-dark",
        "text-secondary-light dark:text-secondary-dark hover:text-accent dark:hover:text-accent",
        className
      )}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};

export default ThemeToggle;
