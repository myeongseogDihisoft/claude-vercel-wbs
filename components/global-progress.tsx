'use client';

import { Box, Progress } from '@chakra-ui/react';

type Props = {
  active: boolean;
};

export function GlobalProgress({ active }: Props) {
  if (!active) return null;
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={9999}
      pointerEvents="none"
      aria-hidden="true"
    >
      <Progress.Root value={null} size="xs" colorPalette="blue">
        <Progress.Track borderRadius={0}>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
    </Box>
  );
}
