import React from 'react';
import { BarChart3 } from 'lucide-react';

export const CHART_COLORS = {
  brand: '#5F84B3',
  sky: '#6EA3D0',
  violet: '#8873BF',
  amber: '#C98A24',
  emerald: '#629A7D',
  red: '#CF5646',
  slate: '#6E6C6A'
};

export const AXIS_TICK = { fontSize: 11, fill: '#A39D94' };

interface ChartFrameProps {
  title?: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  /** Render the chart without its own card (when embedded inside another card). */
  bare?: boolean;
  isEmpty: boolean;
  emptyMessage?: string;
  height: number;
  /** Let content define its own height (the empty state still uses `height`). */
  autoHeight?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export const ChartFrame: React.FC<ChartFrameProps> = ({
  title,
  subtitle,
  actions,
  bare,
  isEmpty,
  emptyMessage = 'No data recorded yet',
  height,
  autoHeight,
  footer,
  children
}) => {
  const body = (
    <>
      {isEmpty ? (
        <div
          className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 text-center dark:border-slate-800"
          style={{ height }}
        >
          <BarChart3 className="mb-2 h-5 w-5 text-slate-300 dark:text-slate-600" aria-hidden />
          <p className="text-13 text-slate-500 dark:text-slate-400">{emptyMessage}</p>
        </div>
      ) : (
        <div style={autoHeight ? undefined : { height }} className="w-full">
          {children}
        </div>
      )}
      {footer && !isEmpty && <div className="mt-3">{footer}</div>}
    </>
  );

  if (bare) {
    return (
      <div>
        {(title || actions) && (
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              {title && <h3 className="text-13 font-semibold text-slate-800 dark:text-slate-200">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
            </div>
            {actions}
          </div>
        )}
        {body}
      </div>
    );
  }

  return (
    <section className="card">
      {(title || actions) && (
        <header className="card-header">
          <div className="min-w-0">
            {title && <h2 className="card-title truncate">{title}</h2>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="px-4 pb-4 pt-4">{body}</div>
    </section>
  );
};

interface TooltipEntry {
  value?: number | string;
  name?: string;
  color?: string;
  payload?: Record<string, unknown>;
}

export const ChartTooltip: React.FC<{
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  unit?: string;
}> = ({ active, payload, label, unit }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-pop dark:border-slate-700 dark:bg-slate-900">
      {label !== undefined && <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="flex items-center gap-2 text-13 font-semibold tabular-nums text-slate-900 dark:text-slate-100">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} aria-hidden />
          {entry.value}
          {unit && <span className="font-normal text-slate-500">{unit}</span>}
        </p>
      ))}
    </div>
  );
};
