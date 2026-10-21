import React from 'react';
import { Gift, Menu, Moon, ShoppingBag, Stethoscope, Sun, Video } from 'lucide-react';
import { Family, User } from '../../types';
import { useThemeStore } from '../../store/themeStore';
import { roleLabel } from '../../utils/format';
import { BrandMark } from './AppSidebar';

interface AppHeaderProps {
  currentUser: User | null;
  currentFamily: Family | null;
  selectedMember: User | null;
  sectionLabel: string;
  onSelectMember: (member: User) => void;
  onOpenSymptomChecker: () => void;
  onOpenTelemedicine: () => void;
  onOpenTelepharmacy: () => void;
  onOpenPointsStore: () => void;
  onOpenMobileNav: () => void;
}

const HeaderIconButton: React.FC<{ label: string; onClick: () => void; children: React.ReactNode }> = ({
  label,
  onClick,
  children
}) => (
  <button type="button" onClick={onClick} className="btn btn-ghost btn-icon" aria-label={label} title={label}>
    {children}
  </button>
);

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentUser,
  currentFamily,
  selectedMember,
  sectionLabel,
  onSelectMember,
  onOpenSymptomChecker,
  onOpenTelemedicine,
  onOpenTelepharmacy,
  onOpenPointsStore,
  onOpenMobileNav
}) => {
  const isDoctor = currentUser?.role === 'doctor';
  const isCaregiver = currentUser?.role === 'caregiver';
  const isPersonal = !isDoctor && !isCaregiver;
  const { theme, toggleTheme } = useThemeStore();

  // Member switching is only available to family members viewing a shared family (unchanged behaviour).
  const canSwitchMember =
    currentUser?.role === 'family_member' && !!currentFamily && currentFamily.members.length > 1;

  const contextLabel = isPersonal ? currentFamily?.family_name : roleLabel(currentUser?.role);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={onOpenMobileNav} className="btn btn-ghost btn-icon -ml-2 md:hidden" aria-label="Open navigation">
          <Menu />
        </button>
        <div className="md:hidden">
          <BrandMark compact />
        </div>

        <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-13 md:flex">
          {contextLabel && (
            <>
              <span className="truncate text-slate-500 dark:text-slate-400">{contextLabel}</span>
              <span className="text-slate-300 dark:text-slate-600" aria-hidden>/</span>
            </>
          )}
          <span className="truncate font-medium text-slate-900 dark:text-slate-100">{sectionLabel}</span>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {canSwitchMember && (
            <label className="mr-2 hidden items-center gap-2 sm:flex">
              <span className="text-xs font-medium text-slate-500">Viewing</span>
              <select
                className="select input-sm w-44 text-13"
                value={selectedMember?.user_id || ''}
                onChange={(e) => {
                  const member = currentFamily?.members.find((m) => m.user_id === e.target.value);
                  if (member) onSelectMember(member);
                }}
              >
                {currentFamily?.members.map((member) => (
                  <option key={member.user_id} value={member.user_id}>
                    {member.name}
                    {member.relationship ? ` (${member.relationship})` : ''}
                  </option>
                ))}
              </select>
            </label>
          )}

          {!isDoctor && (
            <HeaderIconButton label="Symptom checker" onClick={onOpenSymptomChecker}>
              <Stethoscope />
            </HeaderIconButton>
          )}
          {isPersonal && (
            <>
              <HeaderIconButton label="Book telemedicine visit" onClick={onOpenTelemedicine}>
                <Video />
              </HeaderIconButton>
              <HeaderIconButton label="Telepharmacy" onClick={onOpenTelepharmacy}>
                <ShoppingBag />
              </HeaderIconButton>
              <button
                type="button"
                onClick={onOpenPointsStore}
                className="btn btn-secondary btn-sm ml-1 hidden sm:inline-flex"
                title="Wellness points store"
              >
                <Gift className="text-amber-600" />
                <span className="tabular-nums">{currentUser?.points || 0}</span>
                <span className="text-slate-500">pts</span>
              </button>
            </>
          )}
          <span className="mx-1 hidden h-5 w-px bg-slate-200 dark:bg-slate-700 sm:block" aria-hidden />
          <HeaderIconButton label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`} onClick={toggleTheme}>
            {theme === 'light' ? <Moon /> : <Sun />}
          </HeaderIconButton>
        </div>
      </div>

      {canSwitchMember && (
        <div className="border-t border-slate-100 px-4 py-2 dark:border-slate-800 sm:hidden">
          <label className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Viewing</span>
            <select
              className="select input-sm flex-1 text-13"
              value={selectedMember?.user_id || ''}
              onChange={(e) => {
                const member = currentFamily?.members.find((m) => m.user_id === e.target.value);
                if (member) onSelectMember(member);
              }}
            >
              {currentFamily?.members.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
