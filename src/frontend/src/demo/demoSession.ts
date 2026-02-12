// Demo/Preview Mode session management with event-based change notifications
// Stores demo session state in localStorage for persistence across page refreshes

import type { StaffRole } from '../backend';

interface DemoSession {
  active: boolean;
  role: StaffRole;
  timestamp: number;
}

const DEMO_SESSION_KEY = 'braindemics_demo_session';
const DEMO_CHANGE_EVENT = 'demo-session-change';

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
  // Dispatch custom event for reactive updates
  window.dispatchEvent(new CustomEvent(DEMO_CHANGE_EVENT));
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
  // Dispatch custom event for reactive updates
  window.dispatchEvent(new CustomEvent(DEMO_CHANGE_EVENT));
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

// Subscribe to demo session changes
export function subscribeToDemoChanges(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(DEMO_CHANGE_EVENT, handler);
  return () => window.removeEventListener(DEMO_CHANGE_EVENT, handler);
}
