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
  const [deleteOpen, setDeleteOpen] = useState(false);

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
    setDeleteOpen(true);
  }, []);

  const value = useMemo<Ctx>(
    () => ({ openCreateRoot, openCreateChild, openEdit, openDelete }),
    [openCreateRoot, openCreateChild, openEdit, openDelete],
  );

  // close 후 mode/state 클리어를 Dialog 의 close 애니메이션이 끝난 뒤로 미룬다.
  // 즉시 클리어하면 Chakra Dialog 가 언마운트 도중 stale mode 를 다시 그리려 시도해
  // inert/aria-hidden 정리가 어긋나는 경우가 있다 (#43).
  const closeModal = useCallback(() => {
    setModalOpen(false);
    window.setTimeout(() => setModalMode(null), 300);
  }, []);
  const closeDelete = useCallback(() => {
    setDeleteOpen(false);
    window.setTimeout(() => setDeleteState(null), 300);
  }, []);

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
        open={deleteOpen}
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
