import { Badge, Box, Flex, IconButton, Progress, Text } from '@chakra-ui/react';
import type { TaskNode } from '@/lib/tasks/queries';

type Props = {
  task: TaskNode;
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
  onToggle: () => void;
};

const STATUS_LABEL: Record<string, string> = {
  todo: '할 일',
  doing: '진행 중',
  done: '완료',
};

const STATUS_PALETTE: Record<string, string> = {
  todo: 'gray',
  doing: 'blue',
  done: 'green',
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
  const statusKey = STATUS_LABEL[task.status] ? task.status : 'todo';

  return (
    <Flex
      align="center"
      gap={3}
      px={2}
      py={2}
      borderBottomWidth="1px"
      borderColor="gray.200"
      _hover={{ bg: 'gray.50' }}
    >
      <Box width="1.75rem" display="flex" justifyContent="center" flexShrink={0}>
        {hasChildren ? (
          <IconButton
            aria-label={expanded ? '접기' : '펼치기'}
            aria-expanded={expanded}
            size="2xs"
            variant="ghost"
            onClick={onToggle}
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
        <Badge colorPalette={STATUS_PALETTE[statusKey]}>{STATUS_LABEL[statusKey]}</Badge>
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
    </Flex>
  );
}
