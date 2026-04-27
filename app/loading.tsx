import { Box, Progress } from '@chakra-ui/react';

export default function Loading() {
  return (
    <Box position="fixed" top={0} left={0} right={0} zIndex={9999}>
      <Progress.Root value={null} size="xs" colorPalette="blue">
        <Progress.Track borderRadius={0}>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
    </Box>
  );
}
