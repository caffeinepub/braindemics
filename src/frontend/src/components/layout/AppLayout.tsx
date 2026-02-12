import { useEffect } from 'react';
import { Outlet, useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, User, Heart } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DemoPreviewBanner from '../demo/DemoPreviewBanner';
import NotificationsBell from '../notifications/NotificationsBell';
import { isDemoActive, getDemoRole } from '../../demo/demoSession';
import { createDemoProfile } from '../../demo/demoProfile';

export default function AppLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clear, identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const isDemo = isDemoActive();

  // Get the effective profile (demo or real)
  const effectiveProfile = isDemo && getDemoRole() ? createDemoProfile(getDemoRole()!) : profile;

  useEffect(() => {
    // If not in demo mode and no identity, redirect to login
    if (!isDemo && !identity && !profileLoading) {
      navigate({ to: '/login' });
    }

    // If not in demo mode, identity exists, profile is fetched but null, redirect to login
    if (!isDemo && identity && isFetched && !profile) {
      navigate({ to: '/login' });
    }
  }, [isDemo, identity, profile, profileLoading, isFetched, navigate]);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/login' });
  };

  const roleRoutes: Record<string, { label: string; path: string }[]> = {
    admin: [
      { label: 'Dashboard', path: '/admin/dashboard' },
      { label: 'Staff Management', path: '/admin/staff' },
      { label: 'Outstanding Amounts', path: '/admin/outstanding' },
      { label: 'Audit Logs', path: '/admin/audit' },
    ],
    marketing: [
      { label: 'Dashboard', path: '/marketing/dashboard' },
      { label: 'Register School', path: '/marketing/schools/create' },
    ],
    accounts: [
      { label: 'Dashboard', path: '/accounts/dashboard' },
    ],
    packing: [
      { label: 'Dashboard', path: '/packing/dashboard' },
      { label: 'Packing', path: '/packing/schools' },
    ],
    training: [
      { label: 'Dashboard', path: '/training/dashboard' },
      { label: 'My Queries', path: '/training/queries' },
    ],
    academic: [
      { label: 'Dashboard', path: '/academic/dashboard' },
      { label: 'Queries', path: '/academic/queries' },
    ],
  };

  // Show loading state
  if (profileLoading || (!isDemo && !isFetched)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Show fallback if no profile available (shouldn't happen due to useEffect redirect, but safety net)
  if (!effectiveProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const navItems = roleRoutes[effectiveProfile.role] || [];

  return (
    <div className="min-h-screen flex flex-col">
      {isDemo && <DemoPreviewBanner />}
      
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold" style={{ color: '#e73d4b' }}>Braindemics</h1>
            <nav className="hidden md:flex gap-6">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  onClick={() => navigate({ to: item.path })}
                >
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-2">
            <NotificationsBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{effectiveProfile.fullName}</span>
                    <span className="text-xs font-normal text-muted-foreground capitalize">
                      {effectiveProfile.role}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t bg-background py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Braindemics. Built with <Heart className="inline h-4 w-4 text-red-500" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.hostname : 'braindemics-app'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
