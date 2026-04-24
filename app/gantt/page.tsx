import { Box, Button, Flex, HStack, Heading, Stack, Text } from '@chakra-ui/react';
import { GanttView } from '@/components/gantt-view';
import { ViewToggle } from '@/components/view-toggle';
import { getTaskTree } from '@/lib/tasks/queries';

// 오늘 세로선을 렌더하므로 빌드 타임 prerender 금지.
export const dynamic = 'force-dynamic';

export default async function GanttPage() {
  const tasks = await getTaskTree();

  return (
    <Box as="main" p={8}>
      <Stack gap={6}>
        <Flex align="center" justify="space-between" wrap="wrap" gap={4}>
          <HStack gap={4}>
            <Heading size="lg">WBS</Heading>
            <ViewToggle active="gantt" />
          </HStack>

          <HStack gap={2}>
            <Button size="sm" colorPalette="blue" aria-disabled>
              + 작업 추가
            </Button>
            <Button size="sm" variant="outline" aria-disabled>
              CSV 내보내기
            </Button>
            <Button size="sm" variant="outline" aria-disabled>
              CSV 불러오기
            </Button>
          </HStack>
        </Flex>

        {tasks.length === 0 ? (
          <Stack align="center" gap={3} py={16}>
            <Text color="gray.600">아직 작업이 없습니다. 첫 작업을 추가해 시작하세요</Text>
          </Stack>
        ) : (
          <GanttView tasks={tasks} />
        )}
      </Stack>
    </Box>
  );
}
