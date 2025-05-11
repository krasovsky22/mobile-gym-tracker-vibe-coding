import { useQuery, useMutation } from 'convex/react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { api } from '../../convex/_generated/api';

type ThemeContextType = {
  isDarkMode: boolean;
  notifications: boolean;
  soundEffects: boolean;
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
  toggleSoundEffects: () => void;
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const userPrefs = useQuery(api.preferences.getUserPreferences);
  const updatePrefs = useMutation(api.preferences.updatePreferences);
  const [isLoading, setIsLoading] = useState(true);

  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  // Initialize preferences from database
  useEffect(() => {
    if (userPrefs) {
      setIsDarkMode(userPrefs.isDarkMode ?? systemColorScheme === 'dark');
      setNotifications(userPrefs.notifications ?? true);
      setSoundEffects(userPrefs.soundEffects ?? true);
      setIsLoading(false);
    }
  }, [userPrefs, systemColorScheme]);

  const toggleDarkMode = async () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    await updatePrefs({
      isDarkMode: newValue,
      notifications,
      soundEffects,
    });
  };

  const toggleNotifications = async () => {
    const newValue = !notifications;
    setNotifications(newValue);
    await updatePrefs({
      isDarkMode,
      notifications: newValue,
      soundEffects,
    });
  };

  const toggleSoundEffects = async () => {
    const newValue = !soundEffects;
    setSoundEffects(newValue);
    await updatePrefs({
      isDarkMode,
      notifications,
      soundEffects: newValue,
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        notifications,
        soundEffects,
        toggleDarkMode,
        toggleNotifications,
        toggleSoundEffects,
        isLoading,
      }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
