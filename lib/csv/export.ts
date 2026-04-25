import 'server-only';
import { asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tasks } from '@/lib/db/schema';

const STATUS_LABEL: Record<string, string> = {
  todo: '할 일',
  doing: '진행 중',
  done: '완료',
};

export const CSV_HEADERS = ['제목', '설명', '담당자', '상태', '진행률', '시작일', '목표 기한', '상위 작업 제목'];

function escapeCsv(value: string | null | undefined): string {
  const v = value ?? '';
  if (v.includes(',') || v.includes('"') || v.includes('\n') || v.includes('\r')) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export async function buildCsvContent(): Promise<string> {
  const rows = await db.select().from(tasks).orderBy(asc(tasks.createdAt));

  const titleById = new Map<string, string>();
  for (const row of rows) {
    titleById.set(row.id, row.title);
  }

  const lines: string[] = [CSV_HEADERS.join(',')];

  for (const row of rows) {
    const parentTitle = row.parentId ? (titleById.get(row.parentId) ?? '') : '';
    lines.push(
      [
        escapeCsv(row.title),
        escapeCsv(row.description),
        escapeCsv(row.assignee),
        escapeCsv(STATUS_LABEL[row.status] ?? row.status),
        String(row.progress),
        escapeCsv(row.startDate),
        escapeCsv(row.dueDate),
        escapeCsv(parentTitle),
      ].join(','),
    );
  }

  return lines.join('\n');
}
