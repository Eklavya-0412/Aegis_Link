import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useToastStore, ToastMessage } from '../../store/toastStore';

const TOAST_STYLES: Record<ToastMessage['type'], { icon: typeof Info; accent: string; label: string }> = {
  info: { icon: Info, accent: 'text-sky-600 dark:text-sky-400', label: 'Info' },
  success: { icon: CheckCircle2, accent: 'text-emerald-600 dark:text-emerald-400', label: 'Success' },
  warning: { icon: AlertTriangle, accent: 'text-amber-600 dark:text-amber-400', label: 'Warning' },
  error: { icon: XCircle, accent: 'text-red-600 dark:text-red-400', label: 'Alert' }
};

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToastStore();

  return (
    <div
      className="pointer-events-none fixed inset-x-4 top-16 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-5 sm:w-[380px]"
      aria-live="polite"
      role="status"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = TOAST_STYLES[toast.type];
          const Icon = config.icon;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              className="pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-pop dark:border-slate-700 dark:bg-slate-900"
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.accent}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="sr-only">{config.label}</p>
                <p className="text-13 leading-5 text-slate-800 dark:text-slate-200">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="-m-1 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
