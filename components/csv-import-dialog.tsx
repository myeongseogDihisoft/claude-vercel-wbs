'use client';

import {
  Button,
  CloseButton,
  Dialog,
  Portal,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { ImportRow, ExcludedRow, ImportWarning } from '@/lib/csv/import';

type PreviewData = {
  valid: ImportRow[];
  excluded: ExcludedRow[];
  warnings: ImportWarning[];
};

export function CsvImportDialog() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);

    const fd = new FormData();
    fd.append('file', f);
    fd.append('action', 'preview');

    const res = await fetch('/api/csv/import', { method: 'POST', body: fd });
    const data: PreviewData = await res.json();
    setPreview(data);
    setOpen(true);
  };

  const handleApply = () => {
    if (!file) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('action', 'apply');
      await fetch('/api/csv/import', { method: 'POST', body: fd });
      handleClose();
      router.refresh();
    });
  };

  const handleClose = () => {
    setOpen(false);
    setPreview(null);
    setFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
        CSV 불러오기
      </Button>

      <Dialog.Root
        open={open}
        onOpenChange={(d) => { if (!d.open) handleClose(); }}
        size="md"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>CSV 가져오기 미리보기</Dialog.Title>
              </Dialog.Header>

              <Dialog.Body>
                {preview && (
                  <Stack gap={4}>
                    <Text fontWeight="bold">
                      {preview.valid.length}개 작업을 추가합니다. 제외 {preview.excluded.length}건
                    </Text>

                    {preview.excluded.length > 0 && (
                      <Stack gap={1}>
                        <Text fontSize="sm" fontWeight="semibold" color="red.600">
                          제외 항목
                        </Text>
                        {preview.excluded.map((ex) => (
                          <Text key={ex.lineNumber} fontSize="sm" color="red.500">
                            {ex.lineNumber}행: {ex.reason}
                          </Text>
                        ))}
                      </Stack>
                    )}

                    {preview.warnings.length > 0 && (
                      <Stack gap={1}>
                        <Text fontSize="sm" fontWeight="semibold" color="orange.600">
                          경고
                        </Text>
                        {preview.warnings.map((w, i) => (
                          <Text key={i} fontSize="sm" color="orange.500">
                            &ldquo;{w.title}&rdquo;: {w.message}
                          </Text>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                )}
              </Dialog.Body>

              <Dialog.Footer gap={2}>
                <Button variant="outline" onClick={handleClose} disabled={pending}>
                  취소
                </Button>
                <Button
                  colorPalette="blue"
                  onClick={handleApply}
                  loading={pending}
                  disabled={!preview?.valid.length}
                >
                  적용
                </Button>
              </Dialog.Footer>

              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
