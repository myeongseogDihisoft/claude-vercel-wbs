'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { GlobalProgress } from './global-progress';

type Ctx = {
  begin: () => void;
  end: () => void;
};

const ProgressContext = createContext<Ctx | null>(null);

export function useGlobalProgress(): Ctx {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useGlobalProgress must be used inside <ProgressProvider>');
  return ctx;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const begin = useCallback(() => setCount((c) => c + 1), []);
  const end = useCallback(() => setCount((c) => Math.max(0, c - 1)), []);

  const value = useMemo<Ctx>(() => ({ begin, end }), [begin, end]);

  return (
    <ProgressContext.Provider value={value}>
      <GlobalProgress active={count > 0} />
      {children}
    </ProgressContext.Provider>
  );
}
