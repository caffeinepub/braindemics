// UI guards and helpers for Demo/Preview Mode
// Action-scoped mutation gating for granular control

import { isDemoActive } from './demoSession';

// Actions that are explicitly allowed in demo mode
const ALLOWED_DEMO_ACTIONS = new Set([
  'outstanding-amount',
  'packing-status',
  'packing-count',
  'training-visit',
  'training-query',
  'academic-response',
  'setOutstandingAmount',
  'updatePackingStatus',
  'updatePackingCount',
  'createTrainingVisit',
  'updateTrainingVisit',
  'createAcademicQuery',
  'respondToAcademicQuery',
  'createSchool',
  'updateSchool',
]);

export function shouldDisableMutations(): boolean {
  return isDemoActive();
}

export function isActionAllowedInDemo(action: string): boolean {
  if (!isDemoActive()) return true;
  return ALLOWED_DEMO_ACTIONS.has(action);
}

export function canPerformAction(action: string): void {
  if (!isDemoActive()) return;
  if (!ALLOWED_DEMO_ACTIONS.has(action)) {
    throw new Error(`This action (${action}) is unavailable in Demo/Preview Mode`);
  }
}

export function demoDisabledReason(action?: string): string {
  if (action && ALLOWED_DEMO_ACTIONS.has(action)) {
    return ''; // Action is allowed
  }
  return 'This action is unavailable in Demo/Preview Mode';
}

export function getDemoDisabledTooltip(): string {
  return 'Demo mode: mutations are disabled';
}
