import { NextResponse } from 'next/server';
import { buildCsvContent } from '@/lib/csv/export';

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
