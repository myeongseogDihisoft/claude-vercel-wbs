'use client';

import { Button, type ButtonProps } from '@chakra-ui/react';
import { useTaskActions } from './task-actions-provider';

export function AddTaskButton(props: ButtonProps) {
  const { openCreateRoot } = useTaskActions();
  return (
    <Button colorPalette="blue" {...props} onClick={openCreateRoot}>
      + 작업 추가
    </Button>
  );
}
