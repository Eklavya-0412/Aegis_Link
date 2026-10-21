import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Download, FileImage, FileText, FolderLock, KeyRound, Loader2, RefreshCw, ScrollText, ShieldCheck, Upload } from 'lucide-react';
import { User } from '../../types';
import { Card, EmptyState, PageHeader } from '../../components/ui';
import { RemoteNotice, SkeletonRows } from '../../components/common/RemoteState';
import {
  ApiErrorInfo,
  describeApiError,
  downloadDocument,
  isLocalSession,
  listDocuments,
  uploadDocument,
  VaultDocument
} from '../../services/governanceService';
import { useToastStore } from '../../store/toastStore';
import { formatDateTime } from '../../utils/format';
import { maskId } from '../../utils/piiMasker';

interface MedicalVaultProps {
  currentUser: User | null;
}

const fileKind = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'heic', 'dcm'].includes(ext)) return { label: 'Image', icon: FileImage };
  if (ext === 'pdf') return { label: 'PDF document', icon: FileText };
  if (['txt', 'csv', 'json', 'xml', 'hl7'].includes(ext)) return { label: 'Data file', icon: ScrollText };
  if (['doc', 'docx', 'rtf', 'odt'].includes(ext)) return { label: 'Document', icon: FileText };
  return { label: ext ? ext.toUpperCase() : 'File', icon: FileText };
};

const SECURITY_POINTS = [
  { icon: KeyRound, title: 'Encrypted at rest', text: 'Files are encrypted on the server with AES-256-GCM before they are stored.' },
  { icon: ShieldCheck, title: 'Consent-gated', text: "Anyone other than you needs your 'documents' consent to list or open a file." },
  { icon: ScrollText, title: 'Downloads are logged', text: 'Every download is recorded in your activity log with who opened it.' }
];

const MedicalVault: React.FC<MedicalVaultProps> = ({ currentUser }) => {
  const [docs, setDocs] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiErrorInfo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const { showToast } = useToastStore();
  const local = isLocalSession();

  const load = useCallback(async () => {
    if (isLocalSession()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await listDocuments();
      setDocs([...list].sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()));
    } catch (err) {
      setError(describeApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      await uploadDocument(file);
      showToast(`"${file.name}" was encrypted and added to your vault.`, 'success');
      await load();
    } catch (err) {
      showToast(describeApiError(err).message, 'error');
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const handleDownload = async (doc: VaultDocument) => {
    setDownloadingId(doc.id);
    try {
      await downloadDocument(doc);
    } catch (err) {
      showToast(describeApiError(err).message, 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="Records & privacy"
        title="Medical vault"
        description="Reports, prescriptions and other documents attached to your health record."
        actions={
          <>
            <button type="button" className="btn btn-secondary" onClick={load} disabled={local || loading}>
              <RefreshCw />
              Refresh
            </button>
            <input
              ref={fileInput}
              type="file"
              className="sr-only"
              id="vault-upload"
              onChange={(e) => handleUpload(e.target.files?.[0])}
              disabled={local || uploading}
            />
            <label
              htmlFor="vault-upload"
              className={`btn btn-primary ${local || uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
              aria-disabled={local || uploading}
            >
              {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
              {uploading ? 'Encrypting…' : 'Upload document'}
            </label>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card title="Documents" subtitle={!local && !loading && !error ? `${docs.length} on file` : undefined} flush>
          {local ? (
            <RemoteNotice variant="local" subject="your documents" />
          ) : loading ? (
            <SkeletonRows />
          ) : error ? (
            <RemoteNotice variant="error" error={error} subject="your documents" onRetry={load} />
          ) : docs.length === 0 ? (
            <EmptyState
              icon={FolderLock}
              title="No documents yet"
              description="Upload lab reports, discharge summaries or prescriptions to keep them with your record."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th className="hidden sm:table-cell">Type</th>
                    <th className="hidden md:table-cell">Uploaded</th>
                    <th className="hidden lg:table-cell">Uploaded by</th>
                    <th className="w-0 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((doc) => {
                    const kind = fileKind(doc.filename);
                    const byYou = doc.uploaded_by === currentUser?.user_id;
                    return (
                      <tr key={doc.id}>
                        <td>
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="icon-tile h-8 w-8 bg-slate-100 text-slate-500 dark:bg-slate-800">
                              <kind.icon aria-hidden />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-slate-900 dark:text-slate-100">{doc.filename}</p>
                              <p className="text-xs text-slate-500 md:hidden">{formatDateTime(doc.uploaded_at)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell">{kind.label}</td>
                        <td className="hidden whitespace-nowrap tabular-nums md:table-cell">{formatDateTime(doc.uploaded_at)}</td>
                        <td className="hidden lg:table-cell">
                          {byYou ? 'You' : <span className="font-mono text-xs">{maskId(doc.uploaded_by)}</span>}
                        </td>
                        <td className="text-right">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleDownload(doc)}
                            disabled={downloadingId === doc.id}
                            aria-label={`Download ${doc.filename}`}
                          >
                            {downloadingId === doc.id ? <Loader2 className="animate-spin" /> : <Download />}
                            <span className="hidden sm:inline">Download</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="How your vault is protected" icon={ShieldCheck}>
          <ul className="space-y-4">
            {SECURITY_POINTS.map((point) => (
              <li key={point.title} className="flex gap-3">
                <point.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" aria-hidden />
                <div>
                  <p className="text-13 font-medium text-slate-900 dark:text-slate-100">{point.title}</p>
                  <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">{point.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default MedicalVault;
