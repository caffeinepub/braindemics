// Hook to manage Demo/Preview Mode state and operations

import { useCallback } from 'react';
import { getDemoSession, setDemoSession, clearDemoSession, isDemoActive } from './demoSession';
import type { StaffRole } from '../backend';

export function useDemoPreview() {
  const session = getDemoSession();

  const isDemo = isDemoActive();
  const currentRole = session?.role || null;

  const setRole = useCallback((role: StaffRole) => {
    setDemoSession(role);
    // Trigger a storage event to notify other components
    window.dispatchEvent(new Event('storage'));
  }, []);

  const exitDemo = useCallback(() => {
    clearDemoSession();
    // Trigger a storage event to notify other components
    window.dispatchEvent(new Event('storage'));
  }, []);

  return {
    isDemo,
    currentRole,
    setRole,
    exitDemo,
  };
}
