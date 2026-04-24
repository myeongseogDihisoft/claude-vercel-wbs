'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { tasks } from '@/lib/db/schema';

export type CreateTaskInput = {
  title: string;
  parentId?: string | null;
  description?: string | null;
  assignee?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
};

export type UpdateTaskPatch = Partial<{
  title: string;
  description: string | null;
  assignee: string | null;
  status: 'todo' | 'doing' | 'done';
  progress: number;
  startDate: string | null;
  dueDate: string | null;
  parentId: string | null;
}>;

function emptyToNull<T extends string | null | undefined>(v: T): string | null {
  if (v === undefined || v === null) return null;
  const trimmed = v.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export async function createTask(input: CreateTaskInput): Promise<void> {
  const title = input.title.trim();
  if (!title) throw new Error('title is required');

  await db.insert(tasks).values({
    title,
    parentId: emptyToNull(input.parentId ?? null),
    description: emptyToNull(input.description),
    assignee: emptyToNull(input.assignee),
    startDate: emptyToNull(input.startDate),
    dueDate: emptyToNull(input.dueDate),
  });

  revalidatePath('/');
}

export async function updateTask(id: string, patch: UpdateTaskPatch): Promise<void> {
  // SPEC §3-2: 진행률 100 → 상태 자동 'done' (편의). 역방향(상태 → 진행률) 자동 동기화는 없다.
  const next: Record<string, unknown> = { ...patch, updatedAt: new Date() };

  if (patch.progress === 100) {
    next.status = 'done';
  }

  if ('parentId' in patch) {
    next.parentId = emptyToNull(patch.parentId ?? null);
  }
  if ('description' in patch) next.description = emptyToNull(patch.description);
  if ('assignee' in patch) next.assignee = emptyToNull(patch.assignee);
  if ('startDate' in patch) next.startDate = emptyToNull(patch.startDate);
  if ('dueDate' in patch) next.dueDate = emptyToNull(patch.dueDate);
  if (patch.title !== undefined) {
    const t = patch.title.trim();
    if (!t) throw new Error('title cannot be empty');
    next.title = t;
  }

  await db.update(tasks).set(next).where(eq(tasks.id, id));
  revalidatePath('/');
}

export async function deleteTask(id: string): Promise<void> {
  // FK ON DELETE CASCADE 가 자식 레코드까지 함께 제거한다 (lib/db/schema.ts).
  await db.delete(tasks).where(eq(tasks.id, id));
  revalidatePath('/');
}
