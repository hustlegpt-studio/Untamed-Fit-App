import React, { useEffect, createContext, useContext } from 'react';
import { useAuth } from '@/hooks/use-auth';

const AccessibilityContext = createContext<{ speak: (text: string) => void }>({
  speak: () => {},
});

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const { data: user } = useAuth();
  const blindMode = user?.blindMode || false;

  const speak = (text: string) => {
    if (!blindMode) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.2;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!blindMode) {
      window.speechSynthesis.cancel();
      return;
    }

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      const text = target.getAttribute('aria-label') || target.innerText || target.title;
      if (text) speak(text);
    };

    document.addEventListener('focusin', handleFocus);
    return () => document.removeEventListener('focusin', handleFocus);
  }, [blindMode]);

  return (
    <AccessibilityContext.Provider value={{ speak }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => useContext(AccessibilityContext);
