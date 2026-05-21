'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface VibeContextType {
  isBurntOut: boolean;
  toggleBurnout: () => void;
}

const VibeContext = createContext<VibeContextType | undefined>(undefined);

export function VibeProvider({ children }: { children: ReactNode }) {
  const [isBurntOut, setIsBurntOut] = useState(false);

  const toggleBurnout = () => {
    setIsBurntOut((prev) => !prev);
  };

  return (
    <VibeContext.Provider value={{ isBurntOut, toggleBurnout }}>
      {children}
    </VibeContext.Provider>
  );
}

export function useVibe() {
  const context = useContext(VibeContext);
  if (context === undefined) {
    throw new Error('useVibe must be used within a VibeProvider');
  }
  return context;
}
