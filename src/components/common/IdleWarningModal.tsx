import React from 'react';
import { Clock, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface IdleWarningModalProps {
  secondsRemaining: number;
  onExtend: () => void;
}

export const IdleWarningModal: React.FC<IdleWarningModalProps> = ({ secondsRemaining, onExtend }) => {
  const { logout } = useAuthStore();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="idle-title"
        aria-describedby="idle-desc"
        className="w-full max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-white shadow-pop dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="px-5 pb-5 pt-6 text-center">
          <span className="icon-tile mx-auto mb-4 h-11 w-11 bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
            <Clock aria-hidden />
          </span>
          <h2 id="idle-title" className="text-base font-semibold text-slate-900 dark:text-slate-50">
            Your session is about to expire
          </h2>
          <p id="idle-desc" className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
            For your privacy, you'll be signed out automatically after a period of inactivity.
          </p>
          <p className="mt-4 text-3xl font-semibold tabular-nums text-slate-900 dark:text-slate-50" aria-live="polite">
            0:{String(Math.max(0, secondsRemaining)).padStart(2, '0')}
          </p>
          <p className="text-xs text-slate-500">remaining</p>
        </div>
        <div className="flex gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3 dark:border-slate-800 dark:bg-slate-900">
          <button type="button" onClick={() => logout()} className="btn btn-secondary flex-1">
            <LogOut />
            Sign out
          </button>
          <button type="button" onClick={onExtend} className="btn btn-primary flex-1" autoFocus>
            Stay signed in
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdleWarningModal;
