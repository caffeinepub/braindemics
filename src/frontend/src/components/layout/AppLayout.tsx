import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut, User } from 'lucide-react';
import RoleNav from './RoleNav';
import DemoPreviewBanner from '../demo/DemoPreviewBanner';
import { useDemoPreview } from '../../demo/useDemoPreview';
import { clearDemoSession } from '../../demo/demoSession';

export default function AppLayout() {
  const { clear, identity } = useInternetIdentity();
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDemo, exitDemo } = useDemoPreview();

  // Listen for storage events to update when demo session changes
  useEffect(() => {
    const handleStorageChange = () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [queryClient]);

  // Allow rendering in demo mode even without identity
  if (!isDemo && !identity) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const handleLogout = async () => {
    if (isDemo) {
      // Demo mode logout
      exitDemo();
      queryClient.clear();
      navigate({ to: '/login' });
    } else {
      // Internet Identity logout
      await clear();
      queryClient.clear();
      navigate({ to: '/login' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Preview Banner */}
      <DemoPreviewBanner />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-4 md:px-6">
          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-16 items-center border-b px-6">
                <span className="text-lg font-bold">Braindemics</span>
              </div>
              <RoleNav role={profile.role} mobile onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-white">B</span>
            </div>
            <span className="hidden md:inline-block text-lg font-bold">Braindemics</span>
          </div>

          <div className="flex-1" />

          {/* User Info & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{profile.fullName}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground capitalize">{profile.role}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              {isDemo ? 'Exit Demo' : 'Logout'}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 border-r min-h-[calc(100vh-4rem)] sticky top-16">
          <RoleNav role={profile.role} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
