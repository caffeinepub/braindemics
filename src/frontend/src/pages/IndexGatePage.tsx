import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { isDemoActive, getDemoRole } from '../demo/demoSession';
import { getDashboardRoute } from '../demo/demoRoutes';
import { Loader2 } from 'lucide-react';

export default function IndexGatePage() {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  useEffect(() => {
    // Wait for initialization to complete
    if (isInitializing) return;

    // Check for demo mode first
    if (isDemoActive()) {
      const demoRole = getDemoRole();
      if (demoRole) {
        navigate({ to: getDashboardRoute(demoRole) });
        return;
      }
    }

    // Non-demo mode: check authentication and profile
    if (!identity) {
      // Not authenticated, go to login
      navigate({ to: '/login' });
      return;
    }

    // Wait for profile to be fetched
    if (profileLoading || !isFetched) return;

    if (!profile) {
      // Authenticated but no profile, go to login
      navigate({ to: '/login' });
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
    navigate({ to: dashboardRoute });
  }, [identity, isInitializing, profile, profileLoading, isFetched, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
