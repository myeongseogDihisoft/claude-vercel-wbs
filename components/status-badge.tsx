'use client';

import { Badge, Menu, Portal } from '@chakra-ui/react';
import { useTransition } from 'react';
import { updateTask } from '@/app/actions/tasks';

type StatusKey = 'todo' | 'doing' | 'done';

const LABEL: Record<StatusKey, string> = {
  todo: '할 일',
  doing: '진행 중',
  done: '완료',
};

const PALETTE: Record<StatusKey, string> = {
  todo: 'gray',
  doing: 'blue',
  done: 'green',
};

const ORDER: StatusKey[] = ['todo', 'doing', 'done'];

type Props = {
  taskId: string;
  status: string;
};

export function StatusBadge({ taskId, status }: Props) {
  const [pending, startTransition] = useTransition();
  const current: StatusKey = (LABEL as Record<string, string>)[status] ? (status as StatusKey) : 'todo';

  const choose = (next: StatusKey) => {
    if (next === current) return;
    startTransition(() => {
      void updateTask(taskId, { status: next });
    });
  };

  return (
    <Menu.Root
      positioning={{ placement: 'bottom-start' }}
      onSelect={(d) => choose(d.value as StatusKey)}
    >
      <Menu.Trigger
        asChild
        onClick={(e) => {
          // 행 클릭(편집 모달 오픈)으로 버블링되지 않도록 차단.
          e.stopPropagation();
        }}
      >
        <Badge
          colorPalette={PALETTE[current]}
          cursor="pointer"
          opacity={pending ? 0.6 : 1}
          aria-label={`상태 변경: ${LABEL[current]}`}
        >
          {LABEL[current]}
        </Badge>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content onClick={(e) => e.stopPropagation()}>
            {ORDER.map((s) => (
              <Menu.Item key={s} value={s}>
                {LABEL[s]}
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
