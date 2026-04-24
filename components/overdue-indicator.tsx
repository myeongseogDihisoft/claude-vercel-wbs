'use client';

import { Badge } from '@chakra-ui/react';

export function OverdueIndicator() {
  return (
    <Badge colorPalette="red" size="sm" variant="solid">
      지남
    </Badge>
  );
}
