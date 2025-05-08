import React, { createContext, useCallback, useContext } from 'react';
import { Alert as RNAlert, AlertButton, Platform } from 'react-native';

type AlertContextType = {
  alert: (title: string, message?: string, buttons?: AlertButton[]) => void;
  confirm: (title: string, message: string, onConfirm: () => void) => void;
  error: (message: string, title?: string) => void;
  success: (message: string, title?: string) => void;
};

const AlertContext = createContext<AlertContextType | null>(null);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const alert = useCallback((title: string, message?: string, buttons?: AlertButton[]) => {
    if (Platform.OS === 'web') {
      window.confirm([title, message].filter(Boolean).join('\n'));
    } else {
      RNAlert.alert(title, message, buttons);
    }
  }, []);

  const confirm = useCallback((title: string, message: string, onConfirm: () => void) => {
    if (Platform.OS === 'web') {
      const isConfirmed = window.confirm([title, message].filter(Boolean).join('\n'));
      if (isConfirmed) {
        return onConfirm();
      }
    } else {
      RNAlert.alert(title, message, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', style: 'destructive', onPress: onConfirm },
      ]);
    }
  }, []);

  const error = useCallback((message: string, title: string = 'Error') => {
    RNAlert.alert(title, message, [{ text: 'OK' }]);
  }, []);

  const success = useCallback((message: string, title: string = 'Success') => {
    RNAlert.alert(title, message, [{ text: 'OK' }]);
  }, []);

  return (
    <AlertContext.Provider value={{ alert, confirm, error, success }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
