import { NextResponse } from 'next/server';
import { buildCsvContent } from '@/lib/csv/export';

// 빌드 타임 prerender 시 DB 쿼리가 실행되는 것을 막는다.
// Preview 환경엔 DATABASE_URL이 없으므로 prerender 단계에서 실패한다.
export const dynamic = 'force-dynamic';

export async function GET() {
  const csv = await buildCsvContent();
  const today = new Date().toISOString().split('T')[0];

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="wbs-${today}.csv"`,
    },
  });
}
