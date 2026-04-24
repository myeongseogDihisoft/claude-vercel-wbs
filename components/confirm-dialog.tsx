'use client';

import { Button, CloseButton, Dialog, Portal, Text } from '@chakra-ui/react';
import { useTransition } from 'react';

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

  const handleConfirm = () => {
    startTransition(async () => {
      await onConfirm();
      onClose();
    });
  };

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
