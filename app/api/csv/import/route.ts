import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { tasks } from '@/lib/db/schema';
import { parseCsv, type ImportWarning } from '@/lib/csv/import';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const action = formData.get('action') as string;
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'no file' }, { status: 400 });
  }

  const text = await file.text();
  const { valid, excluded } = parseCsv(text);

  if (action === 'preview') {
    // 기존 Task 제목 목록으로 parentTitle 매칭 여부 확인
    const existing = await db.select({ title: tasks.title }).from(tasks);
    const existingTitles = new Set(existing.map((t) => t.title));
    const csvTitles = new Set(valid.map((r) => r.title));

    const warnings: ImportWarning[] = [];
    for (const row of valid) {
      if (row.parentTitle && !existingTitles.has(row.parentTitle) && !csvTitles.has(row.parentTitle)) {
        warnings.push({ title: row.title, message: '상위 매칭 실패 → 최상위로 처리' });
      }
    }

    return NextResponse.json({ valid, excluded, warnings });
  }

  if (action === 'apply') {
    const existing = await db.select({ id: tasks.id, title: tasks.title }).from(tasks);
    const titleToId = new Map<string, string>();
    for (const t of existing) {
      if (!titleToId.has(t.title)) titleToId.set(t.title, t.id);
    }

    // 배치 내 순서대로 삽입해 CSV 내부 부모→자식 참조를 해소
    for (const row of valid) {
      let parentId: string | null = null;
      if (row.parentTitle) {
        parentId = titleToId.get(row.parentTitle) ?? null;
      }

      const [inserted] = await db
        .insert(tasks)
        .values({
          title: row.title,
          description: row.description,
          assignee: row.assignee,
          status: row.status,
          progress: row.progress,
          startDate: row.startDate,
          dueDate: row.dueDate,
          parentId,
        })
        .returning({ id: tasks.id });

      if (inserted && !titleToId.has(row.title)) {
        titleToId.set(row.title, inserted.id);
      }
    }

    revalidatePath('/');
    return NextResponse.json({ inserted: valid.length });
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 });
}
