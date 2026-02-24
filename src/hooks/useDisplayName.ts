import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'voice_energy_display_name';

export function useDisplayName() {
  const [displayName, setDisplayNameState] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setDisplayNameState(saved);
    }
  }, []);

  const setDisplayName = (value: string) => {
    setDisplayNameState(value);
    const trimmed = value.trim();

    if (trimmed) {
      localStorage.setItem(STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const clearDisplayName = () => {
    setDisplayNameState('');
    localStorage.removeItem(STORAGE_KEY);
  };

  const hasDisplayName = useMemo(() => displayName.trim().length > 0, [displayName]);

  return {
    displayName,
    setDisplayName,
    clearDisplayName,
    hasDisplayName,
  };
}
