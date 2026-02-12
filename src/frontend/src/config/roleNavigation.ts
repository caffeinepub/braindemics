// Centralized role navigation configuration mapping StaffRole to menu items and routes

import { StaffRole } from '../backend';

export interface NavItem {
  label: string;
  path: string;
}

export const roleNavigationConfig: Record<StaffRole, NavItem[]> = {
  [StaffRole.admin]: [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Staff Management', path: '/admin/staff' },
    { label: 'Outstanding', path: '/admin/outstanding' },
    { label: 'Logs', path: '/admin/audit' },
  ],
  [StaffRole.marketing]: [
    { label: 'Dashboard', path: '/marketing/dashboard' },
    { label: 'Schools', path: '/marketing/schools' },
    { label: 'Queries', path: '/marketing/queries' },
  ],
  [StaffRole.accounts]: [
    { label: 'Dashboard', path: '/accounts/dashboard' },
    { label: 'Queries', path: '/accounts/queries' },
    { label: 'Schools', path: '/accounts/schools' },
  ],
  [StaffRole.packing]: [
    { label: 'Dashboard', path: '/packing/dashboard' },
    { label: 'Dispatch history', path: '/packing/dispatch-history' },
    { label: 'Queries', path: '/packing/queries' },
  ],
  [StaffRole.training]: [
    { label: 'Dashboard', path: '/training/dashboard' },
    { label: 'Queries', path: '/training/queries' },
    { label: 'Packing details', path: '/training/packing-details' },
  ],
  [StaffRole.academic]: [
    { label: 'Dashboard', path: '/academic/dashboard' },
    { label: 'Queries', path: '/academic/queries' },
    { label: 'Packing status', path: '/academic/packing-status' },
  ],
};

export function getNavigationForRole(role: StaffRole): NavItem[] {
  return roleNavigationConfig[role] || [];
}
