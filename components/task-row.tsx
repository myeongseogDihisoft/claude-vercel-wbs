'use client';

import { Box, Flex, IconButton, Menu, Portal, Progress, Text } from '@chakra-ui/react';
import type { TaskNode } from '@/lib/tasks/queries';
import { StatusBadge } from './status-badge';
import { useTaskActions } from './task-actions-provider';

type Props = {
  task: TaskNode;
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
  onToggle: () => void;
};

function formatDate(iso: string): string {
  // 'YYYY-MM-DD' → 'M/D'
  const [, m, d] = iso.split('-');
  return `${Number(m)}/${Number(d)}`;
}

function formatDateRange(start: string | null, due: string | null): string {
  if (!start && !due) return '—';
  if (start && due) return `${formatDate(start)} ~ ${formatDate(due)}`;
  if (start) return `${formatDate(start)} ~`;
  return `~ ${formatDate(due as string)}`;
}

export function TaskRow({ task, depth, hasChildren, expanded, onToggle }: Props) {
  const { openCreateChild, openEdit, openDelete } = useTaskActions();

  return (
    <Flex
      align="center"
      gap={3}
      px={2}
      py={2}
      borderBottomWidth="1px"
      borderColor="gray.200"
      _hover={{ bg: 'gray.50' }}
      cursor="pointer"
      onClick={() => openEdit(task)}
    >
      <Box width="1.75rem" display="flex" justifyContent="center" flexShrink={0}>
        {hasChildren ? (
          <IconButton
            aria-label={expanded ? '접기' : '펼치기'}
            aria-expanded={expanded}
            size="2xs"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {expanded ? '▼' : '▶'}
          </IconButton>
        ) : null}
      </Box>

      <Box flex="1" minW={0} pl={`${depth * 1.5}rem`}>
        <Text truncate>{task.title}</Text>
      </Box>

      <Box width="6rem" flexShrink={0}>
        {task.assignee ? (
          <Text>{task.assignee}</Text>
        ) : (
          <Text color="gray.500">—</Text>
        )}
      </Box>

      <Box width="5rem" flexShrink={0}>
        <StatusBadge taskId={task.id} status={task.status} />
      </Box>

      <Flex width="8rem" flexShrink={0} align="center" gap={2}>
        <Text fontSize="sm" width="2.75rem" textAlign="right">
          {task.progress}%
        </Text>
        <Progress.Root value={task.progress} size="xs" flex="1">
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
      </Flex>

      <Box width="9rem" flexShrink={0}>
        <Text
          fontSize="sm"
          color={task.startDate || task.dueDate ? undefined : 'gray.500'}
        >
          {formatDateRange(task.startDate, task.dueDate)}
        </Text>
      </Box>

      <Box flexShrink={0}>
        <Menu.Root
          positioning={{ placement: 'bottom-end' }}
          onSelect={(d) => {
            if (d.value === 'edit') openEdit(task);
            else if (d.value === 'add-child') openCreateChild(task);
            else if (d.value === 'delete') openDelete(task);
          }}
        >
          <Menu.Trigger asChild onClick={(e) => e.stopPropagation()}>
            <IconButton
              aria-label="작업 메뉴"
              size="xs"
              variant="ghost"
            >
              ⋯
            </IconButton>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content onClick={(e) => e.stopPropagation()}>
                <Menu.Item value="edit">수정</Menu.Item>
                <Menu.Item value="add-child">하위 작업 추가</Menu.Item>
                <Menu.Item value="delete" color="red.600">
                  삭제
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </Box>
    </Flex>
  );
}
