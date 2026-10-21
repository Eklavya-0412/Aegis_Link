import { apiClient } from './apiClient';
import { useAuthStore } from '../store/authStore';

/* Thin wrappers over the backend's document vault, consent and audit APIs. */

export interface VaultDocument {
  id: string;
  patient_id: string;
  filename: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface ConsentRecord {
  id: string;
  patient_id: string;
  grantee_id: string;
  scope: string;
  granted_at: string;
  expires_at?: string | null;
  revoked_at?: string | null;
}

export interface AuditEntry {
  id: string;
  actor_id: string;
  action: string;
  target_type: string;
  target_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type ApiErrorKind = 'offline' | 'forbidden' | 'unauthorized' | 'invalid' | 'error';

export interface ApiErrorInfo {
  kind: ApiErrorKind;
  message: string;
}

/** The auth store issues this token when the backend is unreachable at sign-in. */
const LOCAL_SESSION_TOKEN = 'demo-local-jwt-token';

export const isLocalSession = () => {
  const token = useAuthStore.getState().accessToken;
  return !token || token === LOCAL_SESSION_TOKEN;
};

export const describeApiError = (error: any): ApiErrorInfo => {
  const status = error?.response?.status;
  const detail = error?.response?.data?.detail;
  const detailText = typeof detail === 'string' ? detail : Array.isArray(detail) ? detail[0]?.msg : undefined;
  if (!error?.response) {
    return { kind: 'offline', message: 'The Aegis Link server did not respond or rejected the request. Please try again shortly.' };
  }
  if (status === 403) return { kind: 'forbidden', message: detailText || 'You do not have consent to access this information.' };
  if (status === 401) return { kind: 'unauthorized', message: 'Your session has expired. Please sign in again.' };
  if (status === 422 || status === 400) return { kind: 'invalid', message: detailText || 'The request was not accepted by the server.' };
  return { kind: 'error', message: detailText || 'Something went wrong while contacting the server.' };
};

/* ── Documents ─────────────────────────────────────────────── */

export const listDocuments = async (patientId?: string): Promise<VaultDocument[]> => {
  const res = await apiClient.get('/documents/', { params: patientId ? { patient_id: patientId } : undefined });
  return Array.isArray(res.data) ? res.data : [];
};

export const uploadDocument = async (file: File, patientId?: string) => {
  const body = new FormData();
  body.append('file', file);
  if (patientId) body.append('patient_id', patientId);
  const res = await apiClient.post('/documents/upload', body, { headers: { 'Content-Type': 'multipart/form-data' } });
  return res.data as { document_id: string; filename: string; uploaded_at: string };
};

export const downloadDocument = async (doc: Pick<VaultDocument, 'id' | 'filename'>) => {
  const res = await apiClient.get(`/documents/${doc.id}`, { responseType: 'blob' });
  const url = URL.createObjectURL(res.data as Blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = doc.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/* ── Consent ───────────────────────────────────────────────── */

export const grantConsent = async (payload: {
  patient_id: string;
  grantee_id: string;
  scope: string;
  expires_at?: string | null;
}): Promise<ConsentRecord> => {
  const res = await apiClient.post('/consent/grant', payload);
  return res.data;
};

export const revokeConsent = async (consentId: string): Promise<ConsentRecord> => {
  const res = await apiClient.post('/consent/revoke', { consent_id: consentId });
  return res.data;
};

export const checkConsent = async (patientId: string, granteeId: string, scope: string): Promise<boolean> => {
  const res = await apiClient.get('/consent/check', {
    params: { patient_id: patientId, grantee_id: granteeId, scope }
  });
  return Boolean(res.data?.allowed);
};

/* ── Audit ─────────────────────────────────────────────────── */

export const getAuditLogs = async (limit = 100): Promise<AuditEntry[]> => {
  const res = await apiClient.get('/audit', { params: { limit } });
  return Array.isArray(res.data?.items) ? res.data.items : [];
};
