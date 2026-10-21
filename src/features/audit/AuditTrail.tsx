import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, FileText, History, Lock, Pill, RefreshCw, Search, ShieldCheck, ShieldOff, Activity } from 'lucide-react';
import { User } from '../../types';
import { Card, EmptyState, PageHeader } from '../../components/ui';
import { RemoteNotice, SkeletonRows } from '../../components/common/RemoteState';
import { ApiErrorInfo, AuditEntry, describeApiError, getAuditLogs, isLocalSession } from '../../services/governanceService';
import { formatDate, formatTime, titleCase } from '../../utils/format';
import { maskId } from '../../utils/piiMasker';

interface AuditTrailProps {
  currentUser: User | null;
}

type Category = 'all' | 'consent' | 'documents' | 'other';

const ACTION_META: Record<string, { label: string; icon: typeof Activity; badge: string; category: Category }> = {
  GRANT_CONSENT: { label: 'Granted consent', icon: ShieldCheck, badge: 'badge-success', category: 'consent' },
  REVOKE_CONSENT: { label: 'Revoked consent', icon: ShieldOff, badge: 'badge-warning', category: 'consent' },
  DOWNLOAD_DOCUMENT: { label: 'Downloaded document', icon: Download, badge: 'badge-info', category: 'documents' },
  UPLOAD_DOCUMENT: { label: 'Uploaded document', icon: FileText, badge: 'badge-info', category: 'documents' },
  PRESCRIBE_MEDICATION: { label: 'Prescribed medication', icon: Pill, badge: 'badge-brand', category: 'other' },
  MEDICATION_DOSAGE_UPDATE: { label: 'Changed medication dose', icon: Pill, badge: 'badge-warning', category: 'other' },
  CREATE_MENSTRUAL_LOG: { label: 'Logged cycle data', icon: FileText, badge: 'badge-neutral', category: 'other' }
};

const metaFor = (action: string) =>
  ACTION_META[action] || {
    label: titleCase(action.toLowerCase()),
    icon: Activity,
    badge: 'badge-neutral',
    category: (action.includes('DOCUMENT') ? 'documents' : action.includes('CONSENT') ? 'consent' : 'other') as Category
  };

const SCOPE_LABELS: Record<string, string> = {
  vitals: 'Vital signs',
  documents: 'Medical vault',
  menstrual_log: 'Cycle tracking',
  all: 'Full record'
};

const AuditTrail: React.FC<AuditTrailProps> = ({ currentUser }) => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiErrorInfo | null>(null);
  const [category, setCategory] = useState<Category>('all');
  const [query, setQuery] = useState('');
  const local = isLocalSession();

  const load = useCallback(async () => {
    if (isLocalSession()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setEntries(await getAuditLogs(200));
    } catch (err) {
      setError(describeApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const actorLabel = (id: string) => (id === currentUser?.user_id ? 'You' : maskId(id));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      const meta = metaFor(e.action);
      if (category !== 'all' && meta.category !== category) return false;
      if (!q) return true;
      return [meta.label, e.target_type, JSON.stringify(e.metadata || {})].join(' ').toLowerCase().includes(q);
    });
  }, [entries, category, query]);

  const describeMetadata = (e: AuditEntry) => {
    const m = e.metadata || {};
    const parts: string[] = [];
    if (typeof m.scope === 'string') parts.push(`Scope: ${SCOPE_LABELS[m.scope] || m.scope}`);
    if (typeof m.grantee_id === 'string') parts.push(`Recipient: ${actorLabel(m.grantee_id)}`);
    if (typeof m.filename === 'string') parts.push(m.filename);
    if (typeof m.medication_name === 'string') parts.push(m.medication_name);
    if (typeof m.dosage === 'string') parts.push(`Dose: ${m.dosage}`);
    return parts.join(' · ');
  };

  const counts = useMemo(() => {
    const c: Record<Category, number> = { all: entries.length, consent: 0, documents: 0, other: 0 };
    entries.forEach((e) => {
      c[metaFor(e.action).category] += 1;
    });
    return c;
  }, [entries]);

  const tabs: { key: Category; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'consent', label: 'Consent' },
    { key: 'documents', label: 'Documents' },
    { key: 'other', label: 'Other' }
  ];

  return (
    <div className="page">
      <PageHeader
        eyebrow="Records"
        title="Activity log"
        description="A chronological record of sensitive actions involving your account — who did what, to which record, and when."
        actions={
          <button type="button" className="btn btn-secondary" onClick={load} disabled={local || loading}>
            <RefreshCw />
            Refresh
          </button>
        }
      />

      <div className="callout callout-neutral">
        <Lock aria-hidden />
        <p>
          Entries are written by the server when an action happens. This view is read-only: there are no controls to edit or
          delete entries.
        </p>
      </div>

      <Card flush>
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="segmented no-scrollbar max-w-full overflow-x-auto" role="tablist" aria-label="Filter by category">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={category === t.key}
                onClick={() => setCategory(t.key)}
                className={`segmented-item ${category === t.key ? 'segmented-item-active' : ''}`}
              >
                {t.label}
                {!local && <span className="tabular-nums text-slate-400">{counts[t.key]}</span>}
              </button>
            ))}
          </div>
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="search"
              className="input input-sm pl-9"
              placeholder="Search activity"
              aria-label="Search activity"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {local ? (
          <RemoteNotice variant="local" subject="your activity log" />
        ) : loading ? (
          <SkeletonRows rows={5} />
        ) : error ? (
          <RemoteNotice variant="error" error={error} subject="your activity log" onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={History}
            title={entries.length === 0 ? 'No activity recorded yet' : 'No entries match your filters'}
            description={
              entries.length === 0
                ? 'Consent changes and document downloads will appear here as they happen.'
                : 'Try a different category or search term.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-36">When</th>
                  <th>Action</th>
                  <th>Actor</th>
                  <th className="hidden md:table-cell">Record</th>
                  <th className="hidden lg:table-cell">Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const meta = metaFor(e.action);
                  return (
                    <tr key={e.id}>
                      <td className="whitespace-nowrap">
                        <p className="tabular-nums text-slate-900 dark:text-slate-100">{formatDate(e.created_at)}</p>
                        <p className="text-xs tabular-nums text-slate-500">{formatTime(e.created_at)}</p>
                      </td>
                      <td>
                        <span className={`badge ${meta.badge}`}>
                          <meta.icon aria-hidden />
                          {meta.label}
                        </span>
                      </td>
                      <td className={e.actor_id === currentUser?.user_id ? 'font-medium' : 'font-mono text-xs'}>
                        {actorLabel(e.actor_id)}
                      </td>
                      <td className="hidden md:table-cell">
                        <span className="text-slate-700 dark:text-slate-300">{titleCase(e.target_type)}</span>
                        <span className="ml-1.5 font-mono text-xs text-slate-400">{maskId(e.target_id)}</span>
                      </td>
                      <td className="hidden max-w-xs truncate text-slate-500 lg:table-cell">{describeMetadata(e) || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AuditTrail;
