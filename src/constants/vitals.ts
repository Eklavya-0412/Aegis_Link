import { Vital } from '../types';

/**
 * Canonical vital types use the backend's names. `bp` is the combined
 * "systolic/diastolic" reading produced by the simulated live feed and sample data.
 */
export type VitalType =
  | 'blood_pressure_systolic'
  | 'blood_pressure_diastolic'
  | 'bp'
  | 'heart_rate'
  | 'oxygen_saturation'
  | 'blood_glucose'
  | 'temperature'
  | 'weight';

export interface AlertLimits {
  /** Readings below this value raise an alert. */
  low?: number;
  /** Readings above this value raise an alert. */
  high?: number;
  /** Readings below this value are escalated as emergencies. */
  criticalLow?: number;
  /** Readings above this value are escalated as emergencies. */
  criticalHigh?: number;
}

export interface VitalDefinition {
  type: VitalType;
  label: string;
  unit: string;
  placeholder: string;
  description: string;
  /** Plausible input range for manual entry. */
  min?: number;
  max?: number;
  /** Whether the type can be logged from the manual entry form. */
  loggable: boolean;
  /**
   * Alert limits mirrored from the server-side anomaly rules in
   * backend/app/services/anomaly_service.py. They are system alert triggers,
   * not clinician-defined targets. For combined blood pressure they apply to systolic.
   */
  limits?: AlertLimits;
}

const SYSTOLIC_LIMITS: AlertLimits = { low: 90, high: 140, criticalHigh: 180 };

export const VITAL_DEFINITIONS: Record<VitalType, VitalDefinition> = {
  blood_pressure_systolic: {
    type: 'blood_pressure_systolic',
    label: 'BP – systolic',
    unit: 'mmHg',
    placeholder: 'e.g. 120',
    description: 'Upper blood pressure reading',
    min: 70,
    max: 200,
    loggable: true,
    limits: SYSTOLIC_LIMITS
  },
  blood_pressure_diastolic: {
    type: 'blood_pressure_diastolic',
    label: 'BP – diastolic',
    unit: 'mmHg',
    placeholder: 'e.g. 80',
    description: 'Lower blood pressure reading',
    min: 40,
    max: 130,
    loggable: true,
    limits: { low: 60, high: 90 }
  },
  bp: {
    type: 'bp',
    label: 'Blood pressure',
    unit: 'mmHg',
    placeholder: 'e.g. 120/80',
    description: 'Systolic / diastolic',
    loggable: false,
    limits: SYSTOLIC_LIMITS
  },
  heart_rate: {
    type: 'heart_rate',
    label: 'Heart rate',
    unit: 'bpm',
    placeholder: 'e.g. 72',
    description: 'Beats per minute',
    min: 30,
    max: 220,
    loggable: true,
    limits: { low: 50, high: 120, criticalLow: 40, criticalHigh: 140 }
  },
  oxygen_saturation: {
    type: 'oxygen_saturation',
    label: 'Oxygen saturation',
    unit: '%',
    placeholder: 'e.g. 98',
    description: 'Peripheral blood oxygen (SpO₂)',
    min: 50,
    max: 100,
    loggable: true,
    limits: { low: 92, criticalLow: 88 }
  },
  blood_glucose: {
    type: 'blood_glucose',
    label: 'Blood glucose',
    unit: 'mg/dL',
    placeholder: 'e.g. 95',
    description: 'Fasting or post-meal',
    min: 20,
    max: 600,
    loggable: true,
    limits: { low: 70, high: 180, criticalLow: 55, criticalHigh: 250 }
  },
  temperature: {
    type: 'temperature',
    label: 'Body temperature',
    unit: '°F',
    placeholder: 'e.g. 98.6',
    description: 'Degrees Fahrenheit',
    min: 90,
    max: 110,
    loggable: true,
    limits: { low: 95, high: 100.4 }
  },
  weight: {
    type: 'weight',
    label: 'Body weight',
    unit: 'kg',
    placeholder: 'e.g. 70',
    description: 'Kilograms',
    min: 1,
    max: 400,
    loggable: true
  }
};

/** Legacy / alternate type names that map onto canonical types (same aliases the backend accepts). */
const ALIASES: Record<string, VitalType> = {
  hr: 'heart_rate',
  spo2: 'oxygen_saturation',
  glucose: 'blood_glucose',
  temp: 'temperature',
  bp_systolic: 'blood_pressure_systolic',
  bp_diastolic: 'blood_pressure_diastolic'
};

export const canonicalType = (type: string): VitalType | undefined =>
  (VITAL_DEFINITIONS as Record<string, VitalDefinition>)[type] ? (type as VitalType) : ALIASES[type];

/** Display order for summary tiles. */
export const VITAL_ORDER: VitalType[] = [
  'bp',
  'blood_pressure_systolic',
  'blood_pressure_diastolic',
  'heart_rate',
  'oxygen_saturation',
  'blood_glucose',
  'temperature',
  'weight'
];

/** Types offered in the manual entry form (backend names). */
export const LOGGABLE_TYPES: VitalType[] = VITAL_ORDER.filter((t) => VITAL_DEFINITIONS[t].loggable);

export const vitalDefinition = (type: string): VitalDefinition | undefined => {
  const canonical = canonicalType(type);
  return canonical ? VITAL_DEFINITIONS[canonical] : undefined;
};

export const vitalLabel = (type: string) => vitalDefinition(type)?.label || type.replace(/_/g, ' ');

/** Primary numeric value of a reading (systolic for combined blood pressure). */
export const primaryValue = (vital: Pick<Vital, 'value'>): number | null => {
  const n = parseFloat(String(vital.value).split('/')[0]);
  return Number.isFinite(n) ? n : null;
};

export type ReadingStatus = 'within' | 'outside' | 'critical' | 'unknown';

export const evaluateReading = (vital: Pick<Vital, 'type' | 'value'>): ReadingStatus => {
  const def = vitalDefinition(vital.type);
  const value = primaryValue(vital);
  if (!def?.limits || value === null) return 'unknown';
  const { low, high, criticalLow, criticalHigh } = def.limits;
  if ((criticalLow !== undefined && value < criticalLow) || (criticalHigh !== undefined && value > criticalHigh)) {
    return 'critical';
  }
  if ((low !== undefined && value < low) || (high !== undefined && value > high)) return 'outside';
  return 'within';
};

export const READING_STATUS_LABEL: Record<ReadingStatus, string> = {
  within: 'Within alert limits',
  outside: 'Outside alert limits',
  critical: 'Critical',
  unknown: 'No alert limits'
};

export const describeLimits = (type: string): string | null => {
  const def = vitalDefinition(type);
  if (!def?.limits) return null;
  const { low, high } = def.limits;
  if (low !== undefined && high !== undefined) return `${low}–${high} ${def.unit}`;
  if (low !== undefined) return `≥ ${low} ${def.unit}`;
  if (high !== undefined) return `≤ ${high} ${def.unit}`;
  return null;
};

/** Readings produced by the in-app simulated telemetry feed (see hooks/useLiveVitals). */
export const isSimulatedReading = (vital: Pick<Vital, 'id'>) => String(vital.id).startsWith('live-');

/** A reading older than this is shown as stale rather than current. */
export const STALE_AFTER_MS = 24 * 60 * 60 * 1000;

export const isStale = (vital: Pick<Vital, 'recorded_at'>, now = Date.now()) =>
  now - new Date(vital.recorded_at).getTime() > STALE_AFTER_MS;

export const sortByRecordedDesc = <T extends Pick<Vital, 'recorded_at'>>(list: T[]) =>
  [...list].sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());

/** Most recent reading per canonical type. */
export const latestByType = (vitals: Vital[]): Partial<Record<VitalType, Vital>> => {
  const out: Partial<Record<VitalType, Vital>> = {};
  sortByRecordedDesc(vitals).forEach((v) => {
    const key = canonicalType(v.type);
    if (key && !out[key]) out[key] = v;
  });
  return out;
};

/** Readings of one canonical type (aliases included), oldest first. */
export const seriesOf = (vitals: Vital[], type: VitalType, limit = 20): Vital[] =>
  sortByRecordedDesc(vitals.filter((v) => canonicalType(v.type) === type))
    .slice(0, limit)
    .reverse();

/** Systolic pressure over time from both combined `bp` and `blood_pressure_systolic` readings, oldest first. */
export const systolicSeries = (vitals: Vital[], limit = 14): Vital[] =>
  sortByRecordedDesc(vitals.filter((v) => ['bp', 'blood_pressure_systolic'].includes(canonicalType(v.type) || '')))
    .slice(0, limit)
    .reverse();

/** Latest blood pressure reading, combined or systolic-only. */
export const latestBloodPressure = (vitals: Vital[]): Vital | undefined =>
  sortByRecordedDesc(vitals).find((v) => ['bp', 'blood_pressure_systolic'].includes(canonicalType(v.type) || ''));
