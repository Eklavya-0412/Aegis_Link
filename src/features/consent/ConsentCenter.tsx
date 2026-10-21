import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, CircleSlash, HelpCircle, Info, Loader2, RefreshCw, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { Family, User } from '../../types';
import { Avatar, Card, EmptyState, Field, PageHeader, StatusBadge } from '../../components/ui';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { RemoteNotice } from '../../components/common/RemoteState';
import {
  checkConsent,
  ConsentRecord,
  describeApiError,
  grantConsent,
  isLocalSession,
  revokeConsent
} from '../../services/governanceService';
import { useToastStore } from '../../store/toastStore';
import { formatDate, formatDateTime, roleLabel } from '../../utils/format';

interface ConsentCenterProps {
  currentUser: User | null;
  currentFamily: Family | null;
}

/** Scopes understood by the backend consent service. */
const SCOPES = [
  { key: 'vitals', label: 'Vital signs', description: 'Readings, trends and alerts' },
  { key: 'documents', label: 'Medical vault', description: 'Reports, prescriptions and uploads' },
  { key: 'menstrual_log', label: 'Cycle tracking', description: 'Menstrual health logs' },
  { key: 'all', label: 'Full record', description: 'Every category above' }
] as const;

type ScopeKey = typeof SCOPES[number]['key'];
type CheckState = 'granted' | 'none' | 'unknown' | 'loading';

const scopeLabel = (key: string) => SCOPES.find((s) => s.key === key)?.label || key;

const consentStatus = (c: ConsentRecord): { label: string; severity: 'success' | 'neutral' | 'warning' } => {
  if (c.revoked_at) return { label: 'Revoked', severity: 'neutral' };
  if (c.expires_at && new Date(c.expires_at).getTime() < Date.now()) return { label: 'Expired', severity: 'warning' };
  return { label: 'Active', severity: 'success' };
};

const ConsentCenter: React.FC<ConsentCenterProps> = ({ currentUser, currentFamily }) => {
  const { showToast } = useToastStore();
  const local = isLocalSession();
  const people = useMemo(
    () => (currentFamily?.members || []).filter((m) => m.user_id !== currentUser?.user_id),
    [currentFamily?.members, currentUser?.user_id]
  );

  const [matrix, setMatrix] = useState<Record<string, Record<string, CheckState>>>({});
  const [checkError, setCheckError] = useState<ReturnType<typeof describeApiError> | null>(null);
  const [sessionGrants, setSessionGrants] = useState<ConsentRecord[]>([]);

  const [grantFor, setGrantFor] = useState<User | null>(null);
  const [grantScope, setGrantScope] = useState<ScopeKey>('vitals');
  const [grantExpiry, setGrantExpiry] = useState('');
  const [grantAcknowledged, setGrantAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<ConsentRecord | null>(null);

  const refreshMatrix = useCallback(async () => {
    if (!currentUser || isLocalSession() || people.length === 0) return;
    setCheckError(null);
    setMatrix(Object.fromEntries(people.map((p) => [p.user_id, Object.fromEntries(SCOPES.map((s) => [s.key, 'loading']))])));
    let firstError: ReturnType<typeof describeApiError> | null = null;
    const next: Record<string, Record<string, CheckState>> = {};
    await Promise.all(
      people.map(async (person) => {
        next[person.user_id] = {};
        await Promise.all(
          SCOPES.map(async (scope) => {
            try {
              const allowed = await checkConsent(currentUser.user_id, person.user_id, scope.key);
              next[person.user_id][scope.key] = allowed ? 'granted' : 'none';
            } catch (err) {
              firstError = firstError || describeApiError(err);
              next[person.user_id][scope.key] = 'unknown';
            }
          })
        );
      })
    );
    setMatrix(next);
    setCheckError(firstError);
  }, [currentUser, people]);

  useEffect(() => {
    refreshMatrix();
  }, [refreshMatrix]);

  const openGrant = (person: User) => {
    setGrantFor(person);
    setGrantScope('vitals');
    setGrantExpiry('');
    setGrantAcknowledged(false);
  };

  const submitGrant = async () => {
    if (!currentUser || !grantFor) return;
    setSubmitting(true);
    try {
      const record = await grantConsent({
        patient_id: currentUser.user_id,
        grantee_id: grantFor.user_id,
        scope: grantScope,
        expires_at: grantExpiry ? new Date(`${grantExpiry}T23:59:59`).toISOString() : null
      });
      setSessionGrants((prev) => [record, ...prev]);
      showToast(`${grantFor.name} can now access ${scopeLabel(grantScope).toLowerCase()}.`, 'success');
      setGrantFor(null);
      refreshMatrix();
    } catch (err) {
      showToast(describeApiError(err).message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmRevoke = async () => {
    if (!revokeTarget) return;
    try {
      const updated = await revokeConsent(revokeTarget.id);
      setSessionGrants((prev) =>
        prev.map((c) => (c.id === revokeTarget.id ? { ...c, revoked_at: updated?.revoked_at || new Date().toISOString() } : c))
      );
      showToast('Access revoked. The change is recorded in your activity log.', 'info');
      refreshMatrix();
    } catch (err) {
      showToast(describeApiError(err).message, 'error');
    }
  };

  const personName = (id: string) => people.find((p) => p.user_id === id)?.name || 'Unknown recipient';

  const renderCell = (state: CheckState | undefined) => {
    if (local || state === undefined || state === 'unknown') {
      return (
        <span className="badge badge-neutral" title="Status unavailable">
          <HelpCircle aria-hidden />
          Unknown
        </span>
      );
    }
    if (state === 'loading') {
      return <span className="inline-block h-6 w-20 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" aria-label="Checking" />;
    }
    return state === 'granted' ? (
      <StatusBadge severity="success" icon={CheckCircle2}>
        Granted
      </StatusBadge>
    ) : (
      <span className="badge badge-neutral">
        <CircleSlash aria-hidden />
        No access
      </span>
    );
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="Records & privacy"
        title="Consent & access"
        description="Decide who can see each part of your health record. The server checks consent every time information is requested."
        actions={
          <button type="button" className="btn btn-secondary" onClick={refreshMatrix} disabled={local || people.length === 0}>
            <RefreshCw />
            Refresh status
          </button>
        }
      />

      <div className="callout callout-info">
        <Info aria-hidden />
        <div>
          <p className="font-medium">How consent works</p>
          <p className="mt-0.5 text-sky-800 dark:text-sky-300">
            You can only grant access to your own records. Grants can be time-limited, and every grant or revocation is
            written to your activity log.
          </p>
        </div>
      </div>

      <Card
        title="Who can access your record"
        subtitle="Current status for each person connected to your care circle"
        icon={Users}
        flush
      >
        {local ? (
          <RemoteNotice variant="local" subject="consent status" />
        ) : people.length === 0 ? (
          <EmptyState icon={Users} title="No one else is connected yet" description="Family members, caregivers and physicians you're linked with will appear here." />
        ) : (
          <>
            {checkError && (
              <div className="border-b border-slate-100 px-5 py-3 dark:border-slate-800">
                <div className="callout callout-warning">
                  <Info aria-hidden />
                  <span>Some statuses couldn't be confirmed: {checkError.message}</span>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Person</th>
                    {SCOPES.map((s) => (
                      <th key={s.key} title={s.description}>
                        {s.label}
                      </th>
                    ))}
                    <th className="w-0 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {people.map((person) => (
                    <tr key={person.user_id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={person.name} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900 dark:text-slate-100">{person.name}</p>
                            <p className="text-xs text-slate-500">{roleLabel(person.role)}</p>
                          </div>
                        </div>
                      </td>
                      {SCOPES.map((s) => (
                        <td key={s.key}>{renderCell(matrix[person.user_id]?.[s.key])}</td>
                      ))}
                      <td className="text-right">
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => openGrant(person)}>
                          <UserPlus />
                          Grant access
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      <Card title="Grants made in this session" subtitle="Revoke access you've granted here at any time" icon={ShieldCheck} flush>
        {sessionGrants.length === 0 ? (
          <EmptyState
            compact
            icon={ShieldCheck}
            title="No grants made in this session"
            description="Grants from earlier sessions are listed in your activity log."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Recipient</th>
                  <th>Scope</th>
                  <th>Granted</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th className="w-0 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sessionGrants.map((c) => {
                  const status = consentStatus(c);
                  return (
                    <tr key={c.id}>
                      <td className="font-medium text-slate-900 dark:text-slate-100">{personName(c.grantee_id)}</td>
                      <td>{scopeLabel(c.scope)}</td>
                      <td className="whitespace-nowrap tabular-nums">{formatDateTime(c.granted_at)}</td>
                      <td className="whitespace-nowrap tabular-nums">{c.expires_at ? formatDate(c.expires_at) : 'No expiry'}</td>
                      <td>
                        <StatusBadge severity={status.severity}>{status.label}</StatusBadge>
                      </td>
                      <td className="text-right">
                        {status.label === 'Active' && (
                          <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => setRevokeTarget(c)}>
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={!!grantFor}
        onClose={() => setGrantFor(null)}
        title={`Grant access to ${grantFor?.name || ''}`}
        description={grantFor ? roleLabel(grantFor.role) : undefined}
        icon={ShieldCheck}
        maxWidth="max-w-lg"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setGrantFor(null)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={submitGrant} disabled={!grantAcknowledged || submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              Grant access
            </button>
          </>
        }
      >
        <fieldset>
          <legend className="label">What can they see?</legend>
          <div className="space-y-2">
            {SCOPES.map((s) => (
              <label
                key={s.key}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                  grantScope === s.key
                    ? 'border-brand-500 bg-brand-50/60 dark:border-brand-600 dark:bg-brand-950/40'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="scope"
                  className="mt-1"
                  checked={grantScope === s.key}
                  onChange={() => setGrantScope(s.key)}
                />
                <span>
                  <span className="block text-13 font-medium text-slate-900 dark:text-slate-100">{s.label}</span>
                  <span className="block text-xs text-slate-500">{s.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <Field label="Access ends on" htmlFor="consent-expiry" helper="Leave empty to keep access until you revoke it." className="mt-5">
          <div className="relative">
            <CalendarClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              id="consent-expiry"
              type="date"
              className="input pl-9"
              min={new Date().toISOString().slice(0, 10)}
              value={grantExpiry}
              onChange={(e) => setGrantExpiry(e.target.value)}
            />
          </div>
        </Field>

        <label className="mt-5 flex items-start gap-2.5 text-13 text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={grantAcknowledged}
            onChange={(e) => setGrantAcknowledged(e.target.checked)}
          />
          <span>
            I understand {grantFor?.name || 'this person'} will be able to view my{' '}
            <strong className="font-medium">{scopeLabel(grantScope).toLowerCase()}</strong>
            {grantExpiry ? ` until ${formatDate(`${grantExpiry}T12:00:00`)}` : ' until I revoke access'}.
          </span>
        </label>
      </Modal>

      <ConfirmDialog
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={confirmRevoke}
        title="Revoke access?"
        message={
          revokeTarget
            ? `${personName(revokeTarget.grantee_id)} will immediately lose access to your ${scopeLabel(revokeTarget.scope).toLowerCase()}.`
            : ''
        }
        confirmText="Revoke access"
        isDestructive
      />
    </div>
  );
};

export default ConsentCenter;
