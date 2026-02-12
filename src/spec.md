# Specification

## Summary
**Goal:** Fix the deployed app’s blank white screen by making routing/auth gating deterministic, using a single React Query client, and ensuring the UI always shows a login/loading/error state instead of rendering nothing.

**Planned changes:**
- Ensure the app renders a visible UI state at `"/"` and protected routes (login, loading indicator, or error state) instead of a blank page.
- Refactor `frontend/src/routeTree.tsx` to remove React Query profile fetching from `beforeLoad`; keep only demo-session routing decisions there and move non-demo auth/profile checks into UI components.
- Update `frontend/src/components/layout/AppLayout.tsx` to never return `null`; when profile is missing (and not in demo mode), navigate to `"/login"` and show a minimal fallback while navigating.
- Use exactly one React Query `QueryClient` instance for both the React Query provider and the TanStack Router context (avoid multiple instances across app setup).
- Add a simple global client-side error fallback that shows an English error panel with a “Go to Login” action instead of a blank white screen.

**User-visible outcome:** Opening the deployed app at `"/"` shows the login page, a loading indicator, or an error panel within 1 second (never blank). Protected routes reliably redirect unauthenticated users to `"/login"`, and demo mode routes to the correct demo dashboard with visible content.
