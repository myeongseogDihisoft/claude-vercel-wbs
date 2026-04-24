'use client';

import { Button } from '@chakra-ui/react';

export function CsvExportButton() {
  return (
    <Button size="sm" variant="outline" onClick={() => { window.location.href = '/api/csv/export'; }}>
      CSV 내보내기
    </Button>
  );
}
