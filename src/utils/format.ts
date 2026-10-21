/** Shared date / time formatting so every screen renders timestamps the same way. */

const toDate = (value: string | number | Date) => (value instanceof Date ? value : new Date(value));

const isValid = (d: Date) => !Number.isNaN(d.getTime());

export const formatDate = (value?: string | number | Date | null) => {
  if (!value) return '—';
  const d = toDate(value);
  return isValid(d) ? d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
};

export const formatShortDate = (value?: string | number | Date | null) => {
  if (!value) return '—';
  const d = toDate(value);
  return isValid(d) ? d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : '—';
};

export const formatTime = (value?: string | number | Date | null) => {
  if (!value) return '—';
  const d = toDate(value);
  return isValid(d) ? d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '—';
};

export const formatDateTime = (value?: string | number | Date | null) => {
  if (!value) return '—';
  const d = toDate(value);
  return isValid(d)
    ? d.toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';
};

export const formatRelative = (value?: string | number | Date | null, now: number = Date.now()) => {
  if (!value) return '—';
  const d = toDate(value);
  if (!isValid(d)) return '—';
  const diff = d.getTime() - now;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (abs < minute) return diff <= 0 ? 'just now' : 'in under a minute';
  if (abs < hour) return rtf.format(Math.round(diff / minute), 'minute');
  if (abs < day) return rtf.format(Math.round(diff / hour), 'hour');
  if (abs < 30 * day) return rtf.format(Math.round(diff / day), 'day');
  return formatDate(d);
};

/** Chart axis labels: time of day when the series spans under two days, otherwise short dates. */
export const axisLabels = (values: (string | number | Date)[]) => {
  if (values.length === 0) return [];
  const times = values.map((v) => toDate(v).getTime());
  const span = Math.max(...times) - Math.min(...times);
  return span < 2 * 24 * 60 * 60 * 1000 ? values.map((v) => formatTime(v)) : values.map((v) => formatShortDate(v));
};

export const titleCase =(value?: string) =>
  (value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

export const ROLE_LABELS: Record<string, string> = {
  patient: 'Patient',
  doctor: 'Physician',
  caregiver: 'Professional caregiver',
  family_member: 'Family member'
};

export const roleLabel = (role?: string) => ROLE_LABELS[role || ''] || titleCase(role);
