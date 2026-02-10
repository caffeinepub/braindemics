import { useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();

  useEffect(() => {
    if (identity && profile) {
      const roleRoutes = {
        admin: '/admin/dashboard',
        marketing: '/marketing/dashboard',
        accounts: '/accounts/dashboard',
        packing: '/packing/dashboard',
        training: '/training/dashboard',
        academic: '/academic/dashboard',
      };
      navigate({ to: roleRoutes[profile.role] || '/' });
    }
  }, [identity, profile, navigate]);

  const handleLogin = () => {
    login();
  };

  const isLoading = loginStatus === 'logging-in' || (identity && profileLoading);

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
          {loginStatus === 'loginError' && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              Login failed. Please try again.
            </div>
          )}
          
          {identity && !profile && !profileLoading && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-800 dark:text-amber-200">
              Access not configured. Please contact your administrator to set up your staff profile.
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
        </CardContent>
      </Card>
    </div>
  );
}
