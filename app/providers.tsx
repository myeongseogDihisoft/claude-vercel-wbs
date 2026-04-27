'use client';

import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { ProgressProvider } from '@/components/progress-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ProgressProvider>{children}</ProgressProvider>
    </ChakraProvider>
  );
}
