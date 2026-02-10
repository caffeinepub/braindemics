// Demo/Preview Mode session management
// Stores demo session state in localStorage for persistence across page refreshes

import type { StaffRole } from '../backend';

interface DemoSession {
  active: boolean;
  role: StaffRole;
  timestamp: number;
}

const DEMO_SESSION_KEY = 'braindemics_demo_session';

export const demoCredentials = {
  username: 'admin',
  password: 'demo123',
};

export function validateDemoCredentials(username: string, password: string): boolean {
  return username === demoCredentials.username && password === demoCredentials.password;
}

export function setDemoSession(role: StaffRole): void {
  const session: DemoSession = {
    active: true,
    role,
    timestamp: Date.now(),
  };
  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
}

export function getDemoSession(): DemoSession | null {
  try {
    const stored = localStorage.getItem(DEMO_SESSION_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored) as DemoSession;
    
    // Validate that the session has all required fields
    if (!parsed || typeof parsed.active !== 'boolean' || !parsed.role) {
      return null;
    }
    
    return parsed;
  } catch {
    return null;
  }
}

export function clearDemoSession(): void {
  localStorage.removeItem(DEMO_SESSION_KEY);
}

export function isDemoActive(): boolean {
  const session = getDemoSession();
  return session?.active === true && !!session.role;
}

export function getDemoRole(): StaffRole | null {
  const session = getDemoSession();
  if (!session || !session.active) return null;
  return session.role || null;
}
