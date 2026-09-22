import React from 'react';
import { Activity, Gift, Moon, Shield, ShoppingCart, Sun, Video } from 'lucide-react';
import { Family, User } from '../../types';
import { useThemeStore } from '../../store/themeStore';

interface AppHeaderProps {
  currentUser: User | null;
  currentFamily: Family | null;
  selectedMember: User | null;
  onOpenSymptomChecker: () => void;
  onOpenTelemedicine: () => void;
  onOpenTelepharmacy: () => void;
  onOpenPointsStore: () => void;
  onLogout: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentUser,
  currentFamily,
  selectedMember,
  onOpenSymptomChecker,
  onOpenTelemedicine,
  onOpenTelepharmacy,
  onOpenPointsStore,
  onLogout
}) => {
  const isDoctor = currentUser?.role === 'doctor';
  const isCaregiver = currentUser?.role === 'caregiver';
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="bg-gradient-to-r from-white/90 to-blue-50/80 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl shadow-lg border-b border-blue-200/50 dark:border-gray-800 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Shield className="h-10 w-10 text-blue-600 drop-shadow-lg" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Aegis Link
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Family Health Management • {currentFamily?.family_name || 'Family'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                className="p-2 text-gray-600 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>

              {!isDoctor && (
                <button
                  onClick={onOpenSymptomChecker}
                  className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="AI Symptom Checker"
                >
                  <Activity className="h-5 w-5" />
                </button>
              )}
              {!isDoctor && !isCaregiver && (
                <>
                  <button
                    onClick={onOpenTelemedicine}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Telemedicine"
                  >
                    <Video className="h-5 w-5" />
                  </button>
                  <button
                    onClick={onOpenTelepharmacy}
                    className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Telepharmacy"
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </button>
                  <button
                    onClick={onOpenPointsStore}
                    className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-2 rounded-lg hover:from-yellow-500 hover:to-orange-500 transition-all duration-300"
                    title="Points Store"
                  >
                    <Gift className="h-4 w-4" />
                    <span className="font-bold">{currentUser?.points || 0}</span>
                  </button>
                </>
              )}
            </div>

            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Welcome, {currentUser?.name}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium capitalize">
                {currentUser?.role.replace('_', ' ')} • {selectedMember?.name}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 font-medium hover:underline transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;

