import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = ({ size = 18 }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-btn"
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? <Moon size={size} /> : <Sun size={size} />}
    </button>
  );
};
