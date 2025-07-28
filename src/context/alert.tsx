import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Alert as RNAlert, AlertButton, Platform } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

type AlertContextType = {
  alert: (title: string, message?: string, buttons?: AlertButton[]) => void;
  confirm: (title: string, message: string, onConfirm: () => void) => void;
  error: (message: string, title?: string) => void;
  success: (message: string, title?: string) => void;
  fireworks: (message: string, title?: string) => void;
  triggerFireworks: () => void;
};

const AlertContext = createContext<AlertContextType | null>(null);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const confettiRef = useRef<ConfettiCannon>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const triggerFireworks = useCallback(() => {
    setShowConfetti(true);
    console.log('asdasdasda');
    if (confettiRef.current) {
      confettiRef.current.start();
    }
    // Auto-hide confetti after animation
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  }, []);
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

  const fireworks = useCallback(
    (message: string, title: string = '🎉 Celebration 🎉') => {
      const fireworksMessage = `🎆 ${message} 🎆\n\n✨ Amazing work! ✨`;

      // Trigger the confetti animation
      triggerFireworks();

      if (Platform.OS === 'web') {
        window.alert([title, fireworksMessage].filter(Boolean).join('\n'));
      } else {
        RNAlert.alert(title, fireworksMessage, [{ text: '🎉 Awesome!' }]);
      }
    },
    [triggerFireworks]
  );

  return (
    <AlertContext.Provider value={{ alert, confirm, error, success, fireworks, triggerFireworks }}>
      {children}
      {/* Confetti cannon for fireworks effect */}
      {showConfetti && (
        <ConfettiCannon
          ref={confettiRef}
          count={200}
          origin={{ x: -10, y: 0 }}
          autoStart={false}
          fadeOut
          explosionSpeed={350}
          fallSpeed={3000}
          colors={['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7dc6f', '#bb8fce', '#85c1e9']}
        />
      )}
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
