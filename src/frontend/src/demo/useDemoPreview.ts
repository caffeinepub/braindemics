// Hook to manage Demo/Preview Mode state and operations with reactive updates

import { useCallback, useSyncExternalStore } from 'react';
import { 
  getDemoSession, 
  setDemoSession, 
  clearDemoSession, 
  isDemoActive,
  subscribeToDemoChanges 
} from './demoSession';
import type { StaffRole } from '../backend';

export function useDemoPreview() {
  // Use useSyncExternalStore for reactive updates when demo session changes
  const session = useSyncExternalStore(
    subscribeToDemoChanges,
    getDemoSession,
    getDemoSession
  );

  const isDemo = session?.active === true && !!session?.role;
  const currentRole = session?.role || null;

  const setRole = useCallback((role: StaffRole) => {
    setDemoSession(role);
  }, []);

  const exitDemo = useCallback(() => {
    clearDemoSession();
  }, []);

  return {
    isDemo,
    currentRole,
    setRole,
    exitDemo,
  };
}
