import React from 'react';
import { AlertTriangle, Clock, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface IdleWarningModalProps {
  secondsRemaining: number;
  onExtend: () => void;
}

export const IdleWarningModal: React.FC<IdleWarningModalProps> = ({ secondsRemaining, onExtend }) => {
  const { logout } = useAuthStore();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-yellow-200 dark:border-yellow-900 text-center animate-in fade-in zoom-in duration-200">
        <div className="h-16 w-16 bg-amber-100 dark:bg-amber-950/80 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-10 w-10 text-amber-600 dark:text-amber-400 animate-pulse" />
        </div>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Session Expiring Soon
        </h3>

        <p className="text-base text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          You have been inactive for a while. For your security and privacy, you will be automatically logged out in:
        </p>

        <div className="inline-flex items-center justify-center space-x-2 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 px-6 py-3 rounded-2xl border border-amber-200 dark:border-amber-800 mb-8">
          <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          <span className="text-3xl font-extrabold tracking-wider">{secondsRemaining}s</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onExtend}
            className="flex-1 min-h-[48px] px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base rounded-xl shadow-lg transition-all transform active:scale-95 focus:ring-4 focus:ring-blue-300"
          >
            Stay Logged In
          </button>
          <button
            onClick={() => logout()}
            className="min-h-[48px] px-5 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold text-base rounded-xl transition-all flex items-center justify-center space-x-2"
          >
            <LogOut className="h-5 w-5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdleWarningModal;
