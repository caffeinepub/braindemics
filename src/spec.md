# Specification

## Summary
**Goal:** Restore a stable production build and working Demo Mode by fixing the main-route crash (Minified React error #185), eliminating invalid hook usage, and preventing redirect loops.

**Planned changes:**
- Fix the runtime crash on `"/"` so it reliably redirects once to `"/login"` when unauthenticated (non-demo) or to the correct role dashboard when authenticated or in Demo Mode.
- Refactor `getCallerUserProfileQuery()` in `frontend/src/hooks/useQueries.ts` to remove invalid hook usage (no hooks called inside `queryFn`/non-hook functions) and ensure callers use `useGetCallerUserProfile()` (or an equivalent safe, dependency-injected query approach).
- Add a single-run navigation guard in `frontend/src/components/layout/AppLayout.tsx` to prevent repeated redirect side-effects; use `replace: true` and only redirect when not already on the destination route.
- Ensure Demo Mode runs end-to-end without actor/backend availability by disabling or returning demo-safe values from React Query hooks used in dashboards and shared layout elements (including notifications) when `isDemoActive()` is true.
- Ensure a single, consistent React Query setup: exactly one `QueryClientProvider`, and the same `QueryClient` instance used across provider and router context wiring.
- Improve the global error fallback to show an actionable English error message plus available stack/component-stack details, and provide a safe path back to `"/login"`.

**User-visible outcome:** Opening the production build no longer crashes on `"/"`; users are redirected correctly without loops, Demo Sign In (admin/demo123) works without backend/actor errors, and unexpected errors show a helpful English message with debugging details and a way back to login.
