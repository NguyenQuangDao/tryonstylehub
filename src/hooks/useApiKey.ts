import { useCallback, useEffect, useState } from 'react';

export interface UseApiKeyReturn {
  apiKey: string;
  setApiKey: (key: string) => void;
  saveApiKey: (key: string) => void;
  clearApiKey: () => void;
}

export const useApiKey = (): UseApiKeyReturn => {
  const [apiKey, setApiKeyState] = useState<string>('');

  useEffect(() => {
    const savedApiKey = localStorage.getItem('fashn_api_key');
    if (savedApiKey) {
      setApiKeyState(savedApiKey);
    }
  }, []);

  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key);
  }, []);

  const saveApiKey = useCallback((key: string) => {
    setApiKeyState(key);
    localStorage.setItem('fashn_api_key', key);
  }, []);

  const clearApiKey = useCallback(() => {
    setApiKeyState('');
    localStorage.removeItem('fashn_api_key');
  }, []);

  return {
    apiKey,
    setApiKey,
    saveApiKey,
    clearApiKey,
  };
};
