import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, Info } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const Icon = isDestructive ? AlertTriangle : Info;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal-panel max-w-md">
          <div className="flex items-start gap-3.5 px-5 pb-4 pt-5">
            <span
              className={`icon-tile ${
                isDestructive
                  ? 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400'
                  : 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
              }`}
            >
              <Icon aria-hidden />
            </span>
            <div className="min-w-0">
              <Dialog.Title className="text-base font-semibold text-slate-900 dark:text-slate-50">{title}</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {message}
              </Dialog.Description>
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3 dark:border-slate-800 dark:bg-slate-900">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              {cancelText}
            </button>
            <button type="button" onClick={handleConfirm} className={`btn ${isDestructive ? 'btn-danger' : 'btn-primary'}`}>
              {confirmText}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ConfirmDialog;
