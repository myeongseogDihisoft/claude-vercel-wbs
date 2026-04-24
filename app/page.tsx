'use client';

import { Box, Button, Heading, Stack } from '@chakra-ui/react';

export default function HomePage() {
  return (
    <Box as="main" p={8}>
      <Stack gap={4}>
        <Heading size="lg">WBS — 초기 스캐폴드</Heading>
        <Button colorPalette="blue" alignSelf="flex-start">
          Chakra 동작 확인
        </Button>
      </Stack>
    </Box>
  );
}
