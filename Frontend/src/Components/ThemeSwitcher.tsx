import { useTheme } from "@heroui/use-theme";
import { Switch } from "@heroui/react";
import { useEffect } from "react";

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme);
    }
  }, [setTheme]);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    if (theme) {
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const handleThemeChange = (isDark: boolean) => {
    const newTheme = isDark ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <Switch
      isSelected={theme === 'dark'}
      onValueChange={handleThemeChange}
      size="lg"
      color={theme === 'dark' ? 'default' : 'secondary'}
      thumbIcon={({ isSelected, className }) =>
        isSelected ? (
          <span className={className}>🌙</span>
        ) : (
          <span className={className}>☀️</span>
        )
      }
    >
 
    </Switch>
  );
};