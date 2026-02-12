import { useEffect, useRef } from 'react';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useDemoPreview } from '../demo/useDemoPreview';
import { getDashboardRoute } from '../demo/demoRoutes';
import { Loader2 } from 'lucide-react';

export default function IndexGatePage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { identity, isInitializing } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { isDemo, currentRole } = useDemoPreview();
  const hasNavigated = useRef(false);

  useEffect(() => {
    // Prevent multiple navigation attempts
    if (hasNavigated.current) return;

    // Wait for initialization to complete
    if (isInitializing) return;

    // Check for demo mode first (highest priority)
    if (isDemo && currentRole) {
      const targetRoute = getDashboardRoute(currentRole);
      // Only navigate if we're not already on the target route
      if (router.state.location.pathname !== targetRoute) {
        hasNavigated.current = true;
        navigate({ to: targetRoute, replace: true });
      }
      return;
    }

    // Non-demo mode: check authentication and profile
    if (!identity) {
      // Not authenticated, go to login
      if (router.state.location.pathname !== '/login') {
        hasNavigated.current = true;
        navigate({ to: '/login', replace: true });
      }
      return;
    }

    // Wait for profile to be fetched
    if (profileLoading || !isFetched) return;

    if (!profile) {
      // Authenticated but no profile, go to login
      if (router.state.location.pathname !== '/login') {
        hasNavigated.current = true;
        navigate({ to: '/login', replace: true });
      }
      return;
    }

    // Profile exists, navigate to role dashboard
    const roleRoutes: Record<string, string> = {
      admin: '/admin/dashboard',
      marketing: '/marketing/dashboard',
      accounts: '/accounts/dashboard',
      packing: '/packing/dashboard',
      training: '/training/dashboard',
      academic: '/academic/dashboard',
    };

    const dashboardRoute = roleRoutes[profile.role] || '/login';
    if (router.state.location.pathname !== dashboardRoute) {
      hasNavigated.current = true;
      navigate({ to: dashboardRoute, replace: true });
    }
  }, [identity, isInitializing, profile, profileLoading, isFetched, navigate, isDemo, currentRole, router.state.location.pathname]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
