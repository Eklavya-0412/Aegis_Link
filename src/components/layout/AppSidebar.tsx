import React from 'react';
import {
  Bell,
  Calendar,
  CheckCircle,
  FileText,
  Heart,
  Home,
  Phone,
  Pill,
  Sparkles,
  Target,
  Users,
  Video
} from 'lucide-react';
import { Family, User } from '../../types';
import { useToastStore } from '../../store';

interface AppSidebarProps {
  currentUser: User | null;
  currentFamily: Family | null;
  activeTab: string;
  showFamilyView: boolean;
  onNavigate: (key: string, label: string) => void;
  onToggleFamilyView: () => void;
}

const NAVIGATION_CONFIG = {
  patient: [
    { key: 'dashboard', label: 'Dashboard', icon: Home },
    { key: 'medications', label: 'Medications', icon: Pill },
    { key: 'appointments', label: 'Appointments', icon: Calendar },
    { key: 'vitals', label: 'Vitals', icon: Heart },
    { key: 'insights', label: 'AI Insights', icon: Sparkles },
    { key: 'goals', label: 'Health Goals', icon: Target },
    { key: 'emergency', label: 'Emergency', icon: Phone }
  ],
  family_member: [
    { key: 'dashboard', label: 'Dashboard', icon: Home },
    { key: 'medications', label: 'Medications', icon: Pill },
    { key: 'appointments', label: 'Appointments', icon: Calendar },
    { key: 'vitals', label: 'Vitals', icon: Heart },
    { key: 'insights', label: 'AI Insights', icon: Sparkles },
    { key: 'goals', label: 'Health Goals', icon: Target },
    { key: 'emergency', label: 'Emergency', icon: Phone }
  ],
  caregiver: [
    { key: 'dashboard', label: 'Dashboard', icon: Home },
    { key: 'patients', label: 'Patients', icon: Users },
    { key: 'alerts', label: 'Alerts', icon: Bell },
    { key: 'tasks', label: 'Care Tasks', icon: CheckCircle },
    { key: 'emergency', label: 'Emergency', icon: Phone }
  ],
  doctor: [
    { key: 'dashboard', label: 'Dashboard', icon: Home },
    { key: 'patients', label: 'Patients', icon: Users },
    { key: 'treatments', label: 'Treatments', icon: FileText },
    { key: 'telemedicine', label: 'Telemedicine', icon: Video }
  ]
};

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentUser,
  currentFamily,
  activeTab,
  showFamilyView,
  onNavigate,
  onToggleFamilyView
}) => {
  const role = currentUser?.role as keyof typeof NAVIGATION_CONFIG;
  const currentNav = NAVIGATION_CONFIG[role] || NAVIGATION_CONFIG.patient;

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:block w-72 relative flex-shrink-0">
        <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-blue-400 via-cyan-300 to-emerald-400 opacity-60 blur" />
        <div className="relative bg-gradient-to-br from-white/90 to-blue-50/50 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 dark:border-gray-800 p-6 sticky top-24 h-fit transition-colors">
          {!(showFamilyView && (currentUser?.role === 'patient' || currentUser?.role === 'family_member')) && (
            <ul className="space-y-2">
              {currentNav.map(({ key, label, icon: Icon }) => (
                <li key={key}>
                  <button
                    onClick={() => onNavigate(key, label)}
                    className={`w-full flex items-center space-x-4 px-4 py-4 rounded-xl text-left transition-all duration-300 font-medium transform ${
                      activeTab === key
                        ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg scale-105'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-0.5'
                    }`}
                  >
                    <Icon className="h-6 w-6 flex-shrink-0" />
                    <span>{label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {(currentUser?.role === 'patient' || currentUser?.role === 'family_member') && (
            <div className="mt-6 bg-white/70 dark:bg-gray-800/70 border border-blue-100 dark:border-gray-700 rounded-xl p-4 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Family View</span>
                <button
                  onClick={onToggleFamilyView}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    showFamilyView ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {showFamilyView ? 'On' : 'Off'}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Toggle to view aggregated family stats and challenges.</p>
            </div>
          )}

          {currentFamily && currentUser?.role !== 'caregiver' && currentUser?.role !== 'doctor' && (
            <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800/60 dark:to-gray-800/40 rounded-2xl border border-green-200 dark:border-gray-700 transition-colors">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Family Information</h3>
              <div className="space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-400">Family ID:</p>
                <div className="bg-white/60 dark:bg-gray-900/60 p-2 rounded-lg">
                  <p className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 truncate">{currentFamily.family_id}</p>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">Members: {currentFamily.members.length}</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(currentFamily.family_id);
                  useToastStore.getState().showToast('Family ID copied to clipboard!', 'success');
                }}
                className="w-full mt-3 bg-blue-500 text-white py-2 px-4 rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors shadow"
              >
                Share Family ID
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 flex justify-around items-center px-2 py-2 shadow-2xl transition-colors">
        {currentNav.slice(0, 5).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onNavigate(key, label)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-xs transition-colors ${
              activeTab === key
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Icon className="h-5 w-5 mb-0.5" />
            <span className="truncate max-w-[60px]">{label}</span>
          </button>
        ))}
      </div>
    </>
  );
};

export default AppSidebar;

