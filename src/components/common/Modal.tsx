import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { LucideIcon, X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  /** Tailwind max-width class, e.g. `max-w-lg`. */
  maxWidth?: string;
  icon?: LucideIcon;
  /** Tailwind classes for the icon tile (background + text colour). */
  iconClassName?: string;
  /** Extra content rendered at the right of the header, before the close button. */
  headerExtra?: React.ReactNode;
  footer?: React.ReactNode;
  /** Remove body padding (for full-bleed content such as tables). */
  flush?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-2xl',
  icon: Icon,
  iconClassName = 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
  headerExtra,
  footer,
  flush
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className={`modal-panel ${maxWidth}`}>
          <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            {Icon && (
              <span className={`icon-tile ${iconClassName}`}>
                <Icon aria-hidden />
              </span>
            )}
            <div className="min-w-0 flex-1">
              {title ? (
                <Dialog.Title className="text-base font-semibold leading-6 text-slate-900 dark:text-slate-50">{title}</Dialog.Title>
              ) : (
                <Dialog.Title className="sr-only">Dialog</Dialog.Title>
              )}
              {description ? (
                <Dialog.Description className="mt-0.5 text-13 text-slate-500 dark:text-slate-400">{description}</Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">{typeof title === 'string' ? title : 'Dialog'}</Dialog.Description>
              )}
            </div>
            {headerExtra}
            <Dialog.Close asChild>
              <button type="button" aria-label="Close dialog" className="btn btn-ghost btn-icon btn-sm -mr-1.5 -mt-0.5">
                <X />
              </button>
            </Dialog.Close>
          </div>
          <div className={`min-h-0 flex-1 overflow-y-auto ${flush ? '' : 'px-5 py-5'}`}>{children}</div>
          {footer && (
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3 dark:border-slate-800 dark:bg-slate-900">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Modal;
