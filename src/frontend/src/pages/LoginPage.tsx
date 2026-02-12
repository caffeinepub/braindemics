import { useEffect, useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Copy, Check, TestTube2 } from 'lucide-react';
import { toast } from 'sonner';
import { validateDemoCredentials, setDemoSession, isDemoActive, getDemoRole, clearDemoSession } from '../demo/demoSession';
import { getDashboardRoute } from '../demo/demoRoutes';
import { StaffRole } from '../backend';

type LoginMethod = 'none' | 'demo' | 'internetIdentity';

export default function LoginPage() {
  const { login, loginStatus, identity, isLoginError } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading, isError, error, isFetched } = useGetCallerUserProfile();
  const [copied, setCopied] = useState(false);
  const [activeLoginMethod, setActiveLoginMethod] = useState<LoginMethod>('none');

  // Demo mode state
  const [demoUsername, setDemoUsername] = useState('');
  const [demoPassword, setDemoPassword] = useState('');
  const [demoError, setDemoError] = useState('');

  // Check for existing demo session on mount and clear it
  useEffect(() => {
    if (isDemoActive()) {
      // Clear existing demo session when landing on login page
      clearDemoSession();
    }
  }, []);

  // Handle Internet Identity login success
  useEffect(() => {
    if (identity && profile && activeLoginMethod === 'internetIdentity') {
      const roleRoutes = {
        [StaffRole.admin]: '/admin/dashboard',
        [StaffRole.marketing]: '/marketing/dashboard',
        [StaffRole.accounts]: '/accounts/dashboard',
        [StaffRole.packing]: '/packing/dashboard',
        [StaffRole.training]: '/training/dashboard',
        [StaffRole.academic]: '/academic/dashboard',
      };
      navigate({ to: roleRoutes[profile.role] || '/' });
    }
  }, [identity, profile, navigate, activeLoginMethod]);

  const handleLogin = () => {
    setActiveLoginMethod('internetIdentity');
    setDemoError(''); // Clear demo errors when switching to Internet Identity
    login();
  };

  const handleCopyPrincipal = async () => {
    if (!identity) return;
    
    try {
      await navigator.clipboard.writeText(identity.getPrincipal().toString());
      setCopied(true);
      toast.success('Principal ID copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy Principal ID');
    }
  };

  const handleDemoSignIn = () => {
    setActiveLoginMethod('demo');
    setDemoError('');
    
    if (!demoUsername || !demoPassword) {
      setDemoError('Please enter both username and password');
      return;
    }

    if (validateDemoCredentials(demoUsername, demoPassword)) {
      // Set demo session as admin by default
      setDemoSession(StaffRole.admin);
      toast.success('Demo mode activated');
      navigate({ to: '/admin/dashboard', replace: true });
    } else {
      setDemoError('Invalid credentials. Use username: admin, password: demo123');
    }
  };

  const isLoading = loginStatus === 'logging-in' || (identity && profileLoading && activeLoginMethod === 'internetIdentity');
  const showAccessNotConfigured = activeLoginMethod === 'internetIdentity' && identity && !profileLoading && isFetched && profile === null && !isError;
  const showBackendError = activeLoginMethod === 'internetIdentity' && identity && !profileLoading && isError;
  const showInternetIdentityLoginError = activeLoginMethod === 'internetIdentity' && isLoginError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center" style={{ color: '#e73d4b' }}>
            Braindemics
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Demo Mode Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TestTube2 className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-semibold">Demo/Preview Mode</h3>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="demo-username">Username</Label>
                <Input
                  id="demo-username"
                  placeholder="admin"
                  value={demoUsername}
                  onChange={(e) => setDemoUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-password">Password</Label>
                <Input
                  id="demo-password"
                  type="password"
                  placeholder="demo123"
                  value={demoPassword}
                  onChange={(e) => setDemoPassword(e.target.value)}
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleDemoSignIn();
                    }
                  }}
                />
              </div>
              {demoError && (
                <p className="text-sm text-destructive">{demoError}</p>
              )}
              <Button
                onClick={handleDemoSignIn}
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                {isLoading && activeLoginMethod === 'demo' && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sign In (Demo)
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Internet Identity Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Internet Identity</h3>
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading && activeLoginMethod === 'internetIdentity' && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {loginStatus === 'logging-in' && activeLoginMethod === 'internetIdentity'
                ? 'Connecting...'
                : 'Sign In with Internet Identity'}
            </Button>

            {showInternetIdentityLoginError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">
                  Failed to connect to Internet Identity. Please try again.
                </p>
              </div>
            )}

            {showAccessNotConfigured && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive font-medium mb-1">Access Not Configured</p>
                <p className="text-sm text-muted-foreground">
                  Your account is not set up yet. Please contact an administrator to create your staff profile.
                </p>
                {identity && (
                  <div className="mt-2 flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-hidden text-ellipsis">
                      {identity.getPrincipal().toString()}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopyPrincipal}
                      className="shrink-0"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {showBackendError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive font-medium mb-1">Connection Error</p>
                <p className="text-sm text-muted-foreground">
                  {error instanceof Error ? error.message : 'Unable to connect to the backend. Please try again later.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
