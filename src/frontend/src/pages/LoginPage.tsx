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
import { validateDemoCredentials, setDemoSession, isDemoActive, getDemoRole } from '../demo/demoSession';
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

  // Check for existing demo session on mount
  useEffect(() => {
    if (isDemoActive()) {
      const role = getDemoRole();
      if (role) {
        navigate({ to: getDashboardRoute(role) });
      }
    }
  }, [navigate]);

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
      navigate({ to: '/admin/dashboard' });
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
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-md">
            <span className="text-2xl font-bold text-white">B</span>
          </div>
          <CardTitle className="text-3xl font-bold">Braindemics</CardTitle>
          <CardDescription className="text-base">
            Internal Operations Management System
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Demo/Preview Mode Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <TestTube2 className="h-4 w-4" />
              <span className="text-sm font-semibold">Demo/Preview Mode</span>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="demo-username">Username</Label>
                <Input
                  id="demo-username"
                  type="text"
                  placeholder="admin"
                  value={demoUsername}
                  onChange={(e) => setDemoUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDemoSignIn()}
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
                  onKeyDown={(e) => e.key === 'Enter' && handleDemoSignIn()}
                />
              </div>

              {demoError && activeLoginMethod === 'demo' && (
                <p className="text-sm text-destructive">{demoError}</p>
              )}

              <Button
                onClick={handleDemoSignIn}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                Demo Sign In
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Use credentials: <span className="font-mono">admin / demo123</span>
              </p>
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
            {showInternetIdentityLoginError && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                Login failed. Please try again.
              </div>
            )}
            
            {showBackendError && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg space-y-2">
                <p className="text-sm font-medium text-destructive">
                  Unable to load your staff profile due to a server authorization error.
                </p>
                <p className="text-xs text-destructive/80">
                  Please contact an administrator for assistance.
                </p>
              </div>
            )}
            
            {showAccessNotConfigured && (
              <div className="space-y-3">
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-800 dark:text-amber-200">
                  Access not configured. Please contact your administrator to set up your staff profile.
                </div>
                
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Your Principal ID:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs font-mono bg-background px-2 py-1.5 rounded border break-all">
                        {identity?.getPrincipal().toString()}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyPrincipal}
                        className="shrink-0"
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Share this Principal ID with your administrator to set up your access.
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {loginStatus === 'logging-in' ? 'Connecting...' : 'Loading...'}
                </>
              ) : (
                'Sign In with Internet Identity'
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Secure authentication for authorized staff only
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
