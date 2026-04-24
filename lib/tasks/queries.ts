import 'server-only';
import { asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tasks } from '@/lib/db/schema';

export type Task = typeof tasks.$inferSelect;
export type TaskNode = Task & { children: TaskNode[] };

export async function getTaskTree(): Promise<TaskNode[]> {
  const rows = await db.select().from(tasks).orderBy(asc(tasks.createdAt));

  const byId = new Map<string, TaskNode>();
  for (const row of rows) {
    byId.set(row.id, { ...row, children: [] });
  }

  const roots: TaskNode[] = [];
  for (const node of byId.values()) {
    // parentId 가 있어도 실제 부모 레코드가 없으면(고아) 루트로 올린다.
    const parent = node.parentId ? byId.get(node.parentId) : undefined;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
