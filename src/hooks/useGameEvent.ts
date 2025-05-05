import { useState, useEffect } from 'react';

interface UseGameEventResult<T> {
  value: T | null;
  setValue: (value: T | null) => void;
}

export function useGameEvent<T>(eventName: string, initialValue: T | null): UseGameEventResult<T> {
  const [value, setValue] = useState<T | null>(initialValue);

  // This hook is a simplified version just to make the MouseToolTip work
  // In a real implementation, this would listen to actual game events
  
  return {
    value,
    setValue
  };
} 