import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { useToastStore, ToastMessage } from '../../store/toastStore';

const TOAST_STYLES: Record<ToastMessage['type'], { icon: typeof Info; color: string; border: string }> = {
  info: { icon: Info, color: 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200', border: 'border-blue-200 dark:border-blue-800' },
  success: { icon: CheckCircle, color: 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200', border: 'border-green-200 dark:border-green-800' },
  warning: { icon: AlertCircle, color: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200', border: 'border-yellow-200 dark:border-yellow-800' },
  error: { icon: XCircle, color: 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200', border: 'border-red-200 dark:border-red-800' }
};

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToastStore();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = TOAST_STYLES[toast.type];
          const Icon = config.icon;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`pointer-events-auto p-4 rounded-2xl shadow-xl border ${config.border} ${config.color} backdrop-blur-md flex items-start space-x-3`}
            >
              <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm font-medium">{toast.message}</div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-current opacity-60 hover:opacity-100 p-1 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;

