'use client';

import {
  Button,
  CloseButton,
  Dialog,
  Field,
  HStack,
  Input,
  NativeSelect,
  Portal,
  Stack,
  Textarea,
} from '@chakra-ui/react';
import { useEffect, useState, useTransition } from 'react';
import { createTask, updateTask, type UpdateTaskPatch } from '@/app/actions/tasks';
import type { Task } from '@/lib/tasks/queries';

export type TaskModalMode =
  | { kind: 'create'; parentId?: string | null; parentTitle?: string | null }
  | { kind: 'edit'; task: Task };

type Props = {
  open: boolean;
  mode: TaskModalMode | null;
  onClose: () => void;
};

type FormState = {
  title: string;
  description: string;
  assignee: string;
  status: 'todo' | 'doing' | 'done';
  progress: string; // input value as string for controlled component
  startDate: string;
  dueDate: string;
};

const EMPTY: FormState = {
  title: '',
  description: '',
  assignee: '',
  status: 'todo',
  progress: '0',
  startDate: '',
  dueDate: '',
};

function fromTask(t: Task): FormState {
  return {
    title: t.title,
    description: t.description ?? '',
    assignee: t.assignee ?? '',
    status: (t.status as FormState['status']) ?? 'todo',
    progress: String(t.progress ?? 0),
    startDate: t.startDate ?? '',
    dueDate: t.dueDate ?? '',
  };
}

type Errors = Partial<Record<'title' | 'progress' | 'dueDate', string>>;

function validate(f: FormState): Errors {
  const errs: Errors = {};
  if (!f.title.trim()) errs.title = '제목은 필수입니다';

  const p = Number(f.progress);
  if (Number.isNaN(p) || p < 0 || p > 100) errs.progress = '진행률은 0~100 사이여야 합니다';

  if (f.startDate && f.dueDate && f.startDate > f.dueDate) {
    errs.dueDate = '목표 기한은 시작일 이후여야 합니다';
  }

  return errs;
}

export function TaskModal({ open, mode, onClose }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // 모드 변경 시 폼 초기화 (모달 열릴 때).
  useEffect(() => {
    if (!open || !mode) return;
    setErrors({});
    setSubmitError(null);
    setForm(mode.kind === 'edit' ? fromTask(mode.task) : EMPTY);
  }, [open, mode]);

  if (!mode) return null;

  const isEdit = mode.kind === 'edit';
  const title = isEdit ? '작업 수정' : mode.parentId ? '하위 작업 추가' : '새 작업';

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((prev) => ({ ...prev, [k]: v }));
  };

  const submit = () => {
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    startTransition(async () => {
      try {
        if (mode.kind === 'create') {
          await createTask({
            title: form.title,
            parentId: mode.parentId ?? null,
            description: form.description || null,
            assignee: form.assignee || null,
            startDate: form.startDate || null,
            dueDate: form.dueDate || null,
          });
        } else {
          const patch: UpdateTaskPatch = {
            title: form.title,
            description: form.description || null,
            assignee: form.assignee || null,
            status: form.status,
            progress: Number(form.progress),
            startDate: form.startDate || null,
            dueDate: form.dueDate || null,
          };
          await updateTask(mode.task.id, patch);
        }
        onClose();
      } catch (e) {
        setSubmitError(e instanceof Error ? e.message : '저장 중 오류가 발생했습니다');
      }
    });
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(d) => {
        if (!d.open) onClose();
      }}
      size="md"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <Stack gap={4}>
                <Field.Root invalid={!!errors.title} required>
                  <Field.Label>
                    제목 <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    autoFocus
                    value={form.title}
                    onChange={(e) => set('title', e.target.value)}
                    placeholder="예: 기획 회의"
                  />
                  {errors.title && <Field.ErrorText>{errors.title}</Field.ErrorText>}
                </Field.Root>

                <Field.Root>
                  <Field.Label>설명</Field.Label>
                  <Textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>담당자</Field.Label>
                  <Input
                    value={form.assignee}
                    onChange={(e) => set('assignee', e.target.value)}
                    placeholder="예: 김PM"
                  />
                </Field.Root>

                <HStack gap={4} align="start">
                  {isEdit && (
                    <Field.Root>
                      <Field.Label>상태</Field.Label>
                      <NativeSelect.Root>
                        <NativeSelect.Field
                          value={form.status}
                          onChange={(e) => set('status', e.target.value as FormState['status'])}
                        >
                          <option value="todo">할 일</option>
                          <option value="doing">진행 중</option>
                          <option value="done">완료</option>
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                      </NativeSelect.Root>
                    </Field.Root>
                  )}

                  {isEdit && (
                    <Field.Root invalid={!!errors.progress}>
                      <Field.Label>진행률 (%)</Field.Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={form.progress}
                        onChange={(e) => set('progress', e.target.value)}
                      />
                      {errors.progress && (
                        <Field.ErrorText>{errors.progress}</Field.ErrorText>
                      )}
                    </Field.Root>
                  )}
                </HStack>

                <HStack gap={4} align="start">
                  <Field.Root>
                    <Field.Label>시작일</Field.Label>
                    <Input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => set('startDate', e.target.value)}
                    />
                  </Field.Root>

                  <Field.Root invalid={!!errors.dueDate}>
                    <Field.Label>목표 기한</Field.Label>
                    <Input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => set('dueDate', e.target.value)}
                    />
                    {errors.dueDate && <Field.ErrorText>{errors.dueDate}</Field.ErrorText>}
                  </Field.Root>
                </HStack>

                {mode.kind === 'create' && mode.parentTitle && (
                  <Field.Root>
                    <Field.Label>상위 작업</Field.Label>
                    <Input value={mode.parentTitle} readOnly />
                  </Field.Root>
                )}

                {submitError && <Field.ErrorText>{submitError}</Field.ErrorText>}
              </Stack>
            </Dialog.Body>

            <Dialog.Footer gap={2}>
              <Button variant="outline" onClick={onClose} disabled={pending}>
                취소
              </Button>
              <Button colorPalette="blue" onClick={submit} loading={pending}>
                저장
              </Button>
            </Dialog.Footer>

            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
