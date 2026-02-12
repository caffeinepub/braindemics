// Banner component for Demo/Preview Mode with role switcher and data reset warning

import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useDemoPreview } from '../../demo/useDemoPreview';
import { getDashboardRoute } from '../../demo/demoRoutes';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TestTube2, AlertTriangle } from 'lucide-react';
import type { StaffRole } from '../../backend';
import { wasDataReset, clearDataResetFlag } from '../../demo/demoDataStore';
import { useEffect, useState } from 'react';

export default function DemoPreviewBanner() {
  const { isDemo, currentRole, setRole } = useDemoPreview();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showResetWarning, setShowResetWarning] = useState(false);

  useEffect(() => {
    if (isDemo && wasDataReset()) {
      setShowResetWarning(true);
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowResetWarning(false);
        clearDataResetFlag();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isDemo]);

  if (!isDemo || !currentRole) return null;

  const handleRoleChange = (newRole: StaffRole) => {
    // Update role first
    setRole(newRole);
    // Invalidate profile query to trigger re-render
    queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    // Navigate to the new role's dashboard using replace to avoid history stack issues
    navigate({ to: getDashboardRoute(newRole), replace: true });
  };

  const handleDismissWarning = () => {
    setShowResetWarning(false);
    clearDataResetFlag();
  };

  return (
    <>
      {showResetWarning && (
        <Alert className="rounded-none border-x-0 border-t-0 border-b-2 border-orange-400 bg-orange-50 dark:bg-orange-950/30">
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="flex items-center justify-between gap-4">
            <span className="text-sm text-orange-800 dark:text-orange-200">
              Demo data was reset due to corrupted storage. You're starting with a clean slate.
            </span>
            <button
              onClick={handleDismissWarning}
              className="text-xs text-orange-700 dark:text-orange-300 hover:underline"
            >
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      )}
      <Alert className="rounded-none border-x-0 border-t-0 border-b-2 border-amber-400 bg-amber-50 dark:bg-amber-950/30">
        <TestTube2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Demo/Preview Mode is active
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-700 dark:text-amber-300">Switch Role:</span>
            <Select value={currentRole} onValueChange={handleRoleChange}>
              <SelectTrigger className="h-8 w-[140px] bg-white dark:bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-popover">
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="accounts">Accounts</SelectItem>
                <SelectItem value="packing">Packing</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </AlertDescription>
      </Alert>
    </>
  );
}
