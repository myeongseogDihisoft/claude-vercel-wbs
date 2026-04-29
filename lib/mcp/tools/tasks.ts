// MCP tool 핸들러 — 5개 Task CRUD.
// 비즈니스 규칙은 SPEC.md §2-B2 / §3-C2 단일 진실 원천을 따른다.
// Server Action(`app/actions/tasks.ts`)을 import 하지 않는다 — 'use server' 부수효과를
// MCP 컨텍스트에서 분리하기 위해 동일 Drizzle 패턴을 직접 사용.
//
// 입력 키는 SPEC.md / 이슈 #48 에 맞춘 snake_case (parent_id, start_date, due_date).
// Drizzle 컬럼은 camelCase (parentId, startDate, dueDate) 이므로 매핑한다.
//
// 참고: mcp-handler `inputSchema` 는 raw shape 객체를 받는다(z.object 래핑 X).
// https://github.com/vercel/mcp-handler README, MCP TypeScript SDK registerTool docs.

import { asc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { tasks } from '@/lib/db/schema';

const statusEnum = z.enum(['todo', 'doing', 'done']);
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD')
  .nullable();

// SPEC.md §2-B2 — create_task 입력 (snake_case)
export const createTaskInputShape = {
  title: z.string().min(1, 'title is required'),
  parent_id: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
  assignee: z.string().nullable().optional(),
  status: statusEnum.optional(),
  progress: z.number().int().min(0).max(100).optional(),
  start_date: isoDate.optional(),
  due_date: isoDate.optional(),
};

// SPEC.md §2-B2 — update_task 입력 (id + 부분 patch)
const patchObject = z.object({
  title: z.string().min(1).optional(),
  parent_id: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
  assignee: z.string().nullable().optional(),
  status: statusEnum.optional(),
  progress: z.number().int().min(0).max(100).optional(),
  start_date: isoDate.optional(),
  due_date: isoDate.optional(),
});

export const updateTaskInputShape = {
  id: z.string().uuid(),
  patch: patchObject,
};

export const getTaskInputShape = { id: z.string().uuid() };
export const deleteTaskInputShape = { id: z.string().uuid() };
export const listTasksInputShape = {};

type ToolResult = {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
};

const ok = (payload: unknown): ToolResult => ({
  content: [{ type: 'text', text: JSON.stringify(payload) }],
});

const fail = (message: string): ToolResult => ({
  content: [{ type: 'text', text: message }],
  isError: true,
});

// SPEC.md §2-B2 마지막 줄: 시작일 ≤ 목표 기한.
// mcp-handler raw shape 에는 cross-field refine 을 직접 걸 수 없으므로 핸들러 본문에서 검사.
function dateRangeError(start?: string | null, due?: string | null): string | null {
  if (!start || !due) return null;
  return new Date(start).getTime() > new Date(due).getTime()
    ? 'start_date must be on or before due_date'
    : null;
}

const trimToNull = (v: string | null | undefined): string | null => {
  if (v === undefined || v === null) return null;
  const t = v.trim();
  return t.length === 0 ? null : t;
};

export const listTasksHandler = async (): Promise<ToolResult> => {
  const rows = await db.select().from(tasks).orderBy(asc(tasks.createdAt));
  return ok(rows);
};

export const getTaskHandler = async ({ id }: { id: string }): Promise<ToolResult> => {
  const rows = await db.select().from(tasks).where(eq(tasks.id, id));
  if (rows.length === 0) return fail(`task ${id} not found`);
  return ok(rows[0]);
};

type CreateInput = {
  title: string;
  parent_id?: string | null;
  description?: string | null;
  assignee?: string | null;
  status?: 'todo' | 'doing' | 'done';
  progress?: number;
  start_date?: string | null;
  due_date?: string | null;
};

export const createTaskHandler = async (input: CreateInput): Promise<ToolResult> => {
  const dateErr = dateRangeError(input.start_date, input.due_date);
  if (dateErr) return fail(dateErr);

  const insertValues: typeof tasks.$inferInsert = {
    title: input.title.trim(),
    parentId: trimToNull(input.parent_id),
    description: trimToNull(input.description),
    assignee: trimToNull(input.assignee),
    startDate: trimToNull(input.start_date),
    dueDate: trimToNull(input.due_date),
  };
  if (input.status !== undefined) insertValues.status = input.status;
  if (input.progress !== undefined) insertValues.progress = input.progress;

  // SPEC.md §3-C2: progress=100 으로 생성하면 status='done' 으로 동기화 (서버사이드 강제).
  if (input.progress === 100) insertValues.status = 'done';

  const [row] = await db.insert(tasks).values(insertValues).returning();
  revalidatePath('/');
  return ok(row);
};

type UpdatePatch = z.infer<typeof patchObject>;

export const updateTaskHandler = async ({
  id,
  patch,
}: {
  id: string;
  patch: UpdatePatch;
}): Promise<ToolResult> => {
  const dateErr = dateRangeError(patch.start_date, patch.due_date);
  if (dateErr) return fail(dateErr);

  const next: Partial<typeof tasks.$inferInsert> = { updatedAt: new Date() };

  if (patch.title !== undefined) {
    const t = patch.title.trim();
    if (!t) return fail('title cannot be empty');
    next.title = t;
  }
  if ('parent_id' in patch) next.parentId = trimToNull(patch.parent_id);
  if ('description' in patch) next.description = trimToNull(patch.description);
  if ('assignee' in patch) next.assignee = trimToNull(patch.assignee);
  if (patch.status !== undefined) next.status = patch.status;
  if (patch.progress !== undefined) next.progress = patch.progress;
  if ('start_date' in patch) next.startDate = trimToNull(patch.start_date);
  if ('due_date' in patch) next.dueDate = trimToNull(patch.due_date);

  // SPEC.md §3-C2: progress=100 → status='done' 자동(편의). 역방향 동기화 없음.
  if (patch.progress === 100) next.status = 'done';

  const [row] = await db.update(tasks).set(next).where(eq(tasks.id, id)).returning();
  if (!row) return fail(`task ${id} not found`);
  revalidatePath('/');
  return ok(row);
};

export const deleteTaskHandler = async ({ id }: { id: string }): Promise<ToolResult> => {
  // FK ON DELETE CASCADE 가 자식 행을 함께 제거 (lib/db/schema.ts:8).
  const removed = await db
    .delete(tasks)
    .where(eq(tasks.id, id))
    .returning({ id: tasks.id });
  if (removed.length === 0) return fail(`task ${id} not found`);
  revalidatePath('/');
  return ok({ deleted: id });
};
