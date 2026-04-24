import { Box, Button, Flex, HStack, Heading, Stack, Text } from '@chakra-ui/react';
import { AddTaskButton } from '@/components/add-task-button';
import { TaskActionsProvider } from '@/components/task-actions-provider';
import { TaskTree } from '@/components/task-tree';
import { getTaskTree } from '@/lib/tasks/queries';

// 목록은 항상 현재 DB 상태를 읽는다 — 빌드 타임 prerender 금지.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const tasks = await getTaskTree();

  return (
    <TaskActionsProvider>
      <Box as="main" p={8}>
        <Stack gap={6}>
          <Flex align="center" justify="space-between" wrap="wrap" gap={4}>
            <HStack gap={4}>
              <Heading size="lg">WBS</Heading>
              <HStack
                gap={0}
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="md"
                overflow="hidden"
              >
                <Button size="sm" variant="solid" colorPalette="blue" borderRadius={0}>
                  목록
                </Button>
                <Button size="sm" variant="ghost" borderRadius={0} aria-disabled>
                  간트
                </Button>
              </HStack>
            </HStack>

            <HStack gap={2}>
              <AddTaskButton size="sm" />
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
              <AddTaskButton />
            </Stack>
          ) : (
            <TaskTree tasks={tasks} />
          )}
        </Stack>
      </Box>
    </TaskActionsProvider>
  );
}
