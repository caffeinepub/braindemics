// UI guards and helpers for Demo/Preview Mode
// Standardizes disabling mutations and showing appropriate messages

import { isDemoActive } from './demoSession';

export function shouldDisableMutations(): boolean {
  return isDemoActive();
}

export function demoDisabledReason(): string {
  return 'This action is unavailable in Demo/Preview Mode';
}

export function getDemoDisabledTooltip(): string {
  return 'Demo mode: mutations are disabled';
}
