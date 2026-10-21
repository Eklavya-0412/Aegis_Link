import React from 'react';
import { CloudOff, Lock, RefreshCw, ServerCrash } from 'lucide-react';
import { ApiErrorInfo } from '../../services/governanceService';

/** Loading skeleton rows for tables and lists that load from the server. */
export const SkeletonRows: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="divide-list" aria-busy="true" aria-label="Loading">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-5 py-3.5">
        <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          <div className="h-2.5 w-1/5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="h-3 w-20 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
      </div>
    ))}
  </div>
);

interface RemoteNoticeProps {
  /** `local` = offline demo session; otherwise an API error. */
  variant: 'local' | 'error';
  error?: ApiErrorInfo | null;
  /** What the screen shows, e.g. "your documents". */
  subject: string;
  onRetry?: () => void;
}

export const RemoteNotice: React.FC<RemoteNoticeProps> = ({ variant, error, subject, onRetry }) => {
  if (variant === 'local') {
    return (
      <div className="flex flex-col items-center px-6 py-10 text-center">
        <span className="icon-tile mb-3 h-10 w-10 bg-slate-100 text-slate-500 dark:bg-slate-800">
          <CloudOff aria-hidden />
        </span>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Server connection required</p>
        <p className="mt-1 max-w-md text-13 text-slate-500 dark:text-slate-400">
          You're signed in with an offline session, so {subject} can't be loaded. Sign in while the Aegis Link server is
          running to use this feature — nothing is shown here unless it comes from the server.
        </p>
      </div>
    );
  }

  const Icon = error?.kind === 'forbidden' ? Lock : error?.kind === 'offline' ? CloudOff : ServerCrash;
  const title =
    error?.kind === 'forbidden'
      ? 'Access not permitted'
      : error?.kind === 'offline'
      ? 'Server unavailable'
      : `Couldn't load ${subject}`;

  return (
    <div className="flex flex-col items-center px-6 py-10 text-center" role="alert">
      <span
        className={`icon-tile mb-3 h-10 w-10 ${
          error?.kind === 'forbidden'
            ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60'
            : 'bg-red-50 text-red-600 dark:bg-red-950/60'
        }`}
      >
        <Icon aria-hidden />
      </span>
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{title}</p>
      <p className="mt-1 max-w-md text-13 text-slate-500 dark:text-slate-400">{error?.message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-secondary btn-sm mt-4">
          <RefreshCw />
          Try again
        </button>
      )}
    </div>
  );
};
