import {
  Bell,
  Calendar,
  ClipboardCheck,
  ClipboardList,
  FileText,
  FolderLock,
  HeartPulse,
  History,
  LayoutDashboard,
  LucideIcon,
  Phone,
  Pill,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Video
} from 'lucide-react';
import { User } from '../../types';

export interface NavItem {
  key: string;
  label: string;
  /** Optional compact label for the mobile bottom bar. */
  shortLabel?: string;
  icon: LucideIcon;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

const PERSONAL_HEALTH: NavSection[] = [
  { items: [{ key: 'dashboard', label: 'Overview', icon: LayoutDashboard }] },
  {
    title: 'Care',
    items: [
      { key: 'vitals', label: 'Vital signs', icon: HeartPulse },
      { key: 'medications', label: 'Medications', icon: Pill },
      { key: 'appointments', label: 'Appointments', shortLabel: 'Visits', icon: Calendar },
      { key: 'goals', label: 'Health goals', icon: Target }
    ]
  },
  { title: 'Assistant', items: [{ key: 'insights', label: 'AI insights', icon: Sparkles }] },
  {
    title: 'Records & privacy',
    items: [
      { key: 'vault', label: 'Medical vault', icon: FolderLock },
      { key: 'consent', label: 'Consent & access', icon: ShieldCheck },
      { key: 'audit', label: 'Activity log', icon: History }
    ]
  },
  { title: 'Safety', items: [{ key: 'emergency', label: 'Emergency contacts', icon: Phone }] }
];

export const NAVIGATION_CONFIG: Record<User['role'], NavSection[]> = {
  patient: PERSONAL_HEALTH,
  family_member: PERSONAL_HEALTH,
  caregiver: [
    { items: [{ key: 'dashboard', label: 'Overview', icon: LayoutDashboard }] },
    {
      title: 'Care delivery',
      items: [
        { key: 'patients', label: 'Assigned patients', shortLabel: 'Patients', icon: Users },
        { key: 'tasks', label: 'Care tasks', icon: ClipboardCheck },
        { key: 'logs', label: 'Visit logs', shortLabel: 'Visits', icon: ClipboardList },
        { key: 'alerts', label: 'Alerts', icon: Bell }
      ]
    },
    { title: 'Records', items: [{ key: 'audit', label: 'Activity log', icon: History }] },
    { title: 'Safety', items: [{ key: 'emergency', label: 'Emergency contacts', icon: Phone }] }
  ],
  doctor: [
    { items: [{ key: 'dashboard', label: 'Overview', icon: LayoutDashboard }] },
    {
      title: 'Clinical',
      items: [
        { key: 'patients', label: 'Patients', icon: Users },
        { key: 'treatments', label: 'Treatment plans', shortLabel: 'Plans', icon: FileText },
        { key: 'telemedicine', label: 'Telemedicine', icon: Video }
      ]
    },
    { title: 'Records', items: [{ key: 'audit', label: 'Activity log', icon: History }] }
  ]
};

export const navForRole = (role?: string): NavSection[] =>
  NAVIGATION_CONFIG[(role as User['role']) || 'patient'] || NAVIGATION_CONFIG.patient;

export const flatNav = (role?: string): NavItem[] => navForRole(role).flatMap((s) => s.items);

export const labelForTab = (role: string | undefined, key: string): string =>
  flatNav(role).find((item) => item.key === key)?.label || 'Overview';
