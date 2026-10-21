import React from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle2, Info, LucideIcon } from 'lucide-react';

/* ── Page header ─────────────────────────────────────────────── */

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, eyebrow, actions }) => (
  <div className="page-header">
    <div className="min-w-0">
      {eyebrow && <p className="page-eyebrow mb-1">{eyebrow}</p>}
      <h1 className="page-title">{title}</h1>
      {description && <p className="page-subtitle">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:flex-nowrap">{actions}</div>}
  </div>
);

/* ── Card ────────────────────────────────────────────────────── */

interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Render children without the default body padding (tables, lists). */
  flush?: boolean;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  icon: Icon,
  actions,
  children,
  className = '',
  bodyClassName = '',
  flush = false,
  footer
}) => (
  <section className={`card ${className}`}>
    {(title || actions) && (
      <header className="card-header">
        <div className="flex min-w-0 items-center gap-2.5">
          {Icon && <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />}
          <div className="min-w-0">
            {title && <h2 className="card-title truncate">{title}</h2>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
    )}
    <div className={`${flush ? '' : 'card-body'} ${bodyClassName}`}>{children}</div>
    {footer && <footer className="card-footer">{footer}</footer>}
  </section>
);

/* ── Stat tile ───────────────────────────────────────────────── */

type Tone = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'ai';

const TONE_ICON: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  danger: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300',
  info: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
  neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  ai: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300'
};

export const toneIconClass = (tone: Tone) => TONE_ICON[tone];

interface StatTileProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  meta?: React.ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
  onClick?: () => void;
}

export const StatTile: React.FC<StatTileProps> = ({ label, value, unit, meta, icon: Icon, tone = 'brand', onClick }) => {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="stat-label">{label}</p>
        {Icon && (
          <span className={`icon-tile h-8 w-8 ${TONE_ICON[tone]}`}>
            <Icon aria-hidden />
          </span>
        )}
      </div>
      <p className="mt-1 flex items-baseline gap-1">
        <span className="stat-value truncate">{value}</span>
        {unit && <span className="text-13 font-medium text-slate-500">{unit}</span>}
      </p>
      {meta && <div className="stat-meta mt-1">{meta}</div>}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="card flex flex-col justify-start p-4 text-left transition-colors hover:border-slate-300 dark:hover:border-slate-700"
      >
        {content}
      </button>
    );
  }
  return <div className="card p-4">{content}</div>;
};

/* ── Empty state ─────────────────────────────────────────────── */

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action, compact }) => (
  <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-6' : 'py-10'}`}>
    {Icon && (
      <span className="icon-tile mb-3 h-10 w-10 bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <Icon aria-hidden />
      </span>
    )}
    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</p>
    {description && <p className="mt-1 max-w-sm text-13 text-slate-500 dark:text-slate-400">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

/* ── Status badge ────────────────────────────────────────────── */

export type Severity = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const SEVERITY_ICON: Record<Severity, LucideIcon> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertOctagon,
  info: Info,
  neutral: Info
};

const SEVERITY_BADGE: Record<Severity, string> = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  neutral: 'badge-neutral'
};

interface StatusBadgeProps {
  severity: Severity;
  children: React.ReactNode;
  /** Icons are on by default so status is never conveyed by colour alone. */
  icon?: boolean | LucideIcon;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ severity, children, icon = true, className = '' }) => {
  const Icon = typeof icon === 'function' || typeof icon === 'object' ? (icon as LucideIcon) : SEVERITY_ICON[severity];
  return (
    <span className={`badge ${SEVERITY_BADGE[severity]} ${className}`}>
      {icon && <Icon aria-hidden />}
      {children}
    </span>
  );
};

/* ── Form field ──────────────────────────────────────────────── */

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  helper?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Field: React.FC<FieldProps> = ({ label, htmlFor, error, helper, required, children, className = '' }) => (
  <div className={className}>
    <label htmlFor={htmlFor} className="label">
      {label}
      {required && <span className="ml-0.5 text-red-600" aria-hidden>*</span>}
    </label>
    {children}
    {error ? <p className="field-error" role="alert">{error}</p> : helper ? <p className="helper">{helper}</p> : null}
  </div>
);

/* ── Avatar ──────────────────────────────────────────────────── */

export const initialsOf = (name?: string) =>
  (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

export const Avatar: React.FC<{ name?: string; size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  name,
  size = 'md',
  className = ''
}) => {
  const sizeClass = size === 'sm' ? 'h-7 w-7 text-2xs' : size === 'lg' ? 'h-11 w-11 text-sm' : 'h-9 w-9 text-xs';
  return (
    <span className={`avatar ${sizeClass} ${className}`} aria-hidden>
      {initialsOf(name)}
    </span>
  );
};

/* ── Progress bar ────────────────────────────────────────────── */

export const ProgressBar: React.FC<{ value: number; tone?: 'brand' | 'success' | 'warning'; label?: string }> = ({
  value,
  tone = 'brand',
  label
}) => {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const color = tone === 'success' ? 'bg-emerald-500' : tone === 'warning' ? 'bg-amber-500' : 'bg-brand-600';
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={`h-full rounded-full ${color} transition-[width] duration-300`} style={{ width: `${pct}%` }} />
    </div>
  );
};

/* ── Key/value row ───────────────────────────────────────────── */

export const KeyValue: React.FC<{ label: string; children: React.ReactNode; mono?: boolean }> = ({ label, children, mono }) => (
  <div className="flex items-center justify-between gap-4 py-2 text-13">
    <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
    <dd className={`truncate text-right font-medium text-slate-800 dark:text-slate-200 ${mono ? 'font-mono text-xs' : ''}`}>
      {children}
    </dd>
  </div>
);
