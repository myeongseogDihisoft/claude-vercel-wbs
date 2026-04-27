'use client';

import { Button, CloseButton, Dialog, Portal, Text } from '@chakra-ui/react';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useGlobalProgress } from './progress-provider';

type Props = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = '삭제',
  cancelLabel = '취소',
  onConfirm,
  onClose,
}: Props) {
  const [pending, startTransition] = useTransition();
  // close 를 transition 외부에서 수행해 Chakra Dialog cleanup 과 RSC 커밋의 경합을 막는다 (#43).
  const submittingRef = useRef(false);
  const [confirmError, setConfirmError] = useState(false);
  const progress = useGlobalProgress();

  const handleConfirm = () => {
    setConfirmError(false);
    submittingRef.current = true;
    progress.begin();
    startTransition(async () => {
      try {
        await onConfirm();
      } catch {
        setConfirmError(true);
      }
    });
  };

  useEffect(() => {
    if (pending) return;
    if (!submittingRef.current) return;
    submittingRef.current = false;
    progress.end();
    if (confirmError) return;
    onClose();
  }, [pending, confirmError, onClose, progress]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(d) => {
        if (!d.open) onClose();
      }}
      role="alertdialog"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text>{body}</Text>
            </Dialog.Body>
            <Dialog.Footer gap={2}>
              <Button variant="outline" onClick={onClose} disabled={pending}>
                {cancelLabel}
              </Button>
              <Button colorPalette="red" onClick={handleConfirm} loading={pending}>
                {confirmLabel}
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
