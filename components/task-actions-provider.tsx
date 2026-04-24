'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { deleteTask } from '@/app/actions/tasks';
import type { Task, TaskNode } from '@/lib/tasks/queries';
import { ConfirmDialog } from './confirm-dialog';
import { TaskModal, type TaskModalMode } from './task-modal';

type Ctx = {
  openCreateRoot: () => void;
  openCreateChild: (parent: Task) => void;
  openEdit: (task: Task) => void;
  openDelete: (task: TaskNode) => void;
};

const TaskActionsContext = createContext<Ctx | null>(null);

export function useTaskActions(): Ctx {
  const ctx = useContext(TaskActionsContext);
  if (!ctx) throw new Error('useTaskActions must be used inside <TaskActionsProvider>');
  return ctx;
}

function countDescendants(node: TaskNode): number {
  let n = 0;
  for (const child of node.children) {
    n += 1 + countDescendants(child);
  }
  return n;
}

type DeleteState = { task: TaskNode; descendants: number } | null;

export function TaskActionsProvider({ children }: { children: ReactNode }) {
  const [modalMode, setModalMode] = useState<TaskModalMode | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteState, setDeleteState] = useState<DeleteState>(null);

  const openCreateRoot = useCallback(() => {
    setModalMode({ kind: 'create' });
    setModalOpen(true);
  }, []);

  const openCreateChild = useCallback((parent: Task) => {
    setModalMode({ kind: 'create', parentId: parent.id, parentTitle: parent.title });
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((task: Task) => {
    setModalMode({ kind: 'edit', task });
    setModalOpen(true);
  }, []);

  const openDelete = useCallback((task: TaskNode) => {
    setDeleteState({ task, descendants: countDescendants(task) });
  }, []);

  const value = useMemo<Ctx>(
    () => ({ openCreateRoot, openCreateChild, openEdit, openDelete }),
    [openCreateRoot, openCreateChild, openEdit, openDelete],
  );

  const closeModal = () => setModalOpen(false);
  const closeDelete = () => setDeleteState(null);

  const deleteBody = deleteState
    ? deleteState.descendants > 0
      ? `이 작업과 하위 작업 ${deleteState.descendants}개가 모두 삭제됩니다. 계속할까요?`
      : '이 작업을 삭제합니다. 계속할까요?'
    : '';

  return (
    <TaskActionsContext.Provider value={value}>
      {children}
      <TaskModal open={modalOpen} mode={modalMode} onClose={closeModal} />
      <ConfirmDialog
        open={!!deleteState}
        title="작업 삭제"
        body={deleteBody}
        confirmLabel="삭제"
        onConfirm={async () => {
          if (deleteState) await deleteTask(deleteState.task.id);
        }}
        onClose={closeDelete}
      />
    </TaskActionsContext.Provider>
  );
}
