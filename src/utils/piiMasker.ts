/**
 * PII and ID Masking Utilities for non-owning roles (Caregivers, Family Viewers).
 * Masks ID/PII fields to last 4 characters.
 */

export const maskId = (id?: string): string => {
  if (!id) return '';
  const cleanId = String(id);
  if (cleanId.length <= 4) return '****';
  return `****-${cleanId.slice(-4)}`;
};

export const maskEmail = (email?: string): string => {
  if (!email || !email.includes('@')) return '****';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `**@${domain}`;
  return `${local[0]}***${local.slice(-1)}@${domain}`;
};

export const maskPhone = (phone?: string): string => {
  if (!phone) return '';
  const cleanPhone = String(phone);
  if (cleanPhone.length <= 4) return cleanPhone;
  return `***-***-${cleanPhone.slice(-4)}`;
};

export const maskPiiField = (val?: string): string => {
  if (!val) return '';
  const str = String(val);
  if (str.length <= 4) return '****';
  return `****${str.slice(-4)}`;
};
