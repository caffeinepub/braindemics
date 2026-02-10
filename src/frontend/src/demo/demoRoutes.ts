// Centralized role-to-dashboard route mapping for Demo/Preview Mode

import type { StaffRole } from '../backend';

export const roleDashboardRoutes: Record<StaffRole, string> = {
  admin: '/admin/dashboard',
  marketing: '/marketing/dashboard',
  accounts: '/accounts/dashboard',
  packing: '/packing/dashboard',
  training: '/training/dashboard',
  academic: '/academic/dashboard',
};

export function getDashboardRoute(role: StaffRole): string {
  return roleDashboardRoutes[role];
}
