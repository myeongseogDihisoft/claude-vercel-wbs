'use client';

import { Badge } from '@chakra-ui/react';
import { useTransition, type KeyboardEvent, type MouseEvent } from 'react';
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
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];

  const advance = () => {
    if (pending) return;
    startTransition(() => {
      void updateTask(taskId, { status: next });
    });
  };

  const onClick = (e: MouseEvent) => {
    // 행 클릭(편집 모달)으로 버블링되지 않도록 차단.
    e.stopPropagation();
    advance();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      advance();
    }
  };

  return (
    <Badge
      role="button"
      tabIndex={0}
      colorPalette={PALETTE[current]}
      cursor="pointer"
      opacity={pending ? 0.6 : 1}
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-label={`상태 변경: 다음은 ${LABEL[next]}`}
    >
      {LABEL[current]}
    </Badge>
  );
}
