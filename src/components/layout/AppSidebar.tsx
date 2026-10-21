import React from 'react';
import { Copy, LogOut, Menu, Shield, Users, X } from 'lucide-react';
import { Family, User } from '../../types';
import { useToastStore } from '../../store';
import { Avatar } from '../ui';
import { roleLabel } from '../../utils/format';
import { flatNav, navForRole, NavItem } from './navigation';

interface AppSidebarProps {
  currentUser: User | null;
  currentFamily: Family | null;
  activeTab: string;
  showFamilyView: boolean;
  onNavigate: (key: string, label: string) => void;
  onToggleFamilyView: () => void;
  onLogout: () => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

export const BrandMark: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div className="flex items-center gap-2.5">
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-xs">
      <Shield className="h-[18px] w-[18px]" aria-hidden />
    </span>
    {!compact && (
      <div className="leading-tight">
        <p className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-50">Aegis Link</p>
        <p className="text-2xs text-slate-500 dark:text-slate-400">Care, together</p>
      </div>
    )}
  </div>
);

const SidebarContent: React.FC<AppSidebarProps & { onItemClick?: () => void }> = ({
  currentUser,
  currentFamily,
  activeTab,
  showFamilyView,
  onNavigate,
  onToggleFamilyView,
  onLogout,
  onItemClick
}) => {
  const sections = navForRole(currentUser?.role);
  const isPersonal = currentUser?.role === 'patient' || currentUser?.role === 'family_member';
  const familyViewActive = showFamilyView && isPersonal;

  const handleNavigate = (item: NavItem) => {
    if (familyViewActive) onToggleFamilyView();
    onNavigate(item.key, item.label);
    onItemClick?.();
  };

  const copyFamilyId = () => {
    if (!currentFamily) return;
    navigator.clipboard?.writeText(currentFamily.family_id);
    useToastStore.getState().showToast('Family ID copied to clipboard.', 'success');
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center border-b border-slate-200/80 px-4 dark:border-slate-800">
        <BrandMark />
      </div>

      <nav className="no-scrollbar flex-1 overflow-y-auto px-3 py-4" aria-label="Main">
        {sections.map((section, i) => (
          <div key={section.title || i} className={i > 0 ? 'mt-5' : ''}>
            {section.title && <p className="eyebrow mb-1.5 px-2.5">{section.title}</p>}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = !familyViewActive && activeTab === item.key;
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => handleNavigate(item)}
                      aria-current={active ? 'page' : undefined}
                      className={`nav-item ${active ? 'nav-item-active' : ''}`}
                    >
                      {active && <span className="absolute -left-3 top-1.5 h-6 w-[3px] rounded-r bg-brand-600" aria-hidden />}
                      <item.icon aria-hidden />
                      <span className="truncate">{item.label}</span>
                    </button>
                  </li>
                );
              })}
              {i === 0 && isPersonal && (
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      onToggleFamilyView();
                      onItemClick?.();
                    }}
                    aria-pressed={familyViewActive}
                    className={`nav-item ${familyViewActive ? 'nav-item-active' : ''}`}
                  >
                    {familyViewActive && <span className="absolute -left-3 top-1.5 h-6 w-[3px] rounded-r bg-brand-600" aria-hidden />}
                    <Users aria-hidden />
                    <span className="truncate">Family overview</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 space-y-3 border-t border-slate-200/80 p-3 dark:border-slate-800">
        {currentFamily && isPersonal && (
          <div className="surface-muted px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-2xs font-medium text-slate-500">Family ID · {currentFamily.members.length} members</p>
                <p className="truncate font-mono text-xs font-medium text-slate-800 dark:text-slate-200">
                  {currentFamily.family_id}
                </p>
              </div>
              <button type="button" onClick={copyFamilyId} className="btn btn-ghost btn-icon btn-sm" aria-label="Copy family ID" title="Copy family ID">
                <Copy />
              </button>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2.5 px-1">
          <Avatar name={currentUser?.name} size="sm" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-13 font-medium text-slate-900 dark:text-slate-100">{currentUser?.name}</p>
            <p className="truncate text-2xs text-slate-500">{roleLabel(currentUser?.role)}</p>
          </div>
          <button type="button" onClick={onLogout} className="btn btn-ghost btn-icon btn-sm" aria-label="Sign out" title="Sign out">
            <LogOut />
          </button>
        </div>
      </div>
    </div>
  );
};

export const AppSidebar: React.FC<AppSidebarProps> = (props) => {
  const { currentUser, activeTab, showFamilyView, onNavigate, onToggleFamilyView, mobileOpen, onMobileOpenChange } = props;
  const items = flatNav(currentUser?.role).slice(0, 4);
  const isPersonal = currentUser?.role === 'patient' || currentUser?.role === 'family_member';
  const familyViewActive = showFamilyView && isPersonal;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-sidebar border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 md:block">
        <SidebarContent {...props} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40"
            aria-label="Close navigation"
            onClick={() => onMobileOpenChange(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[17rem] max-w-[85vw] bg-white shadow-pop dark:bg-slate-900">
            <button
              type="button"
              onClick={() => onMobileOpenChange(false)}
              className="btn btn-ghost btn-icon btn-sm absolute right-3 top-3"
              aria-label="Close navigation"
            >
              <X />
            </button>
            <SidebarContent {...props} onItemClick={() => onMobileOpenChange(false)} />
          </aside>
        </div>
      )}

      {/* Mobile bottom navigation */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch justify-around border-t border-slate-200 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:hidden"
        aria-label="Quick navigation"
      >
        {items.map(({ key, label, shortLabel, icon: Icon }) => {
          const active = !familyViewActive && activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (familyViewActive) onToggleFamilyView();
                onNavigate(key, label);
              }}
              aria-current={active ? 'page' : undefined}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg text-2xs font-medium transition-colors ${
                active ? 'text-brand-700 dark:text-brand-300' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span className="max-w-full truncate px-1">{shortLabel || label}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onMobileOpenChange(true)}
          className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-2xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400"
        >
          <Menu className="h-5 w-5" aria-hidden />
          <span>More</span>
        </button>
      </nav>
    </>
  );
};

export default AppSidebar;
