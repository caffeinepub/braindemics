// Banner component for Demo/Preview Mode with role switcher

import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useDemoPreview } from '../../demo/useDemoPreview';
import { getDashboardRoute } from '../../demo/demoRoutes';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TestTube2 } from 'lucide-react';
import type { StaffRole } from '../../backend';

export default function DemoPreviewBanner() {
  const { isDemo, currentRole, setRole } = useDemoPreview();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (!isDemo || !currentRole) return null;

  const handleRoleChange = (newRole: StaffRole) => {
    setRole(newRole);
    queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    navigate({ to: getDashboardRoute(newRole) });
  };

  return (
    <Alert className="rounded-none border-x-0 border-t-0 border-b-2 border-amber-400 bg-amber-50 dark:bg-amber-950/30">
      <TestTube2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
          Demo/Preview Mode is active
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-700 dark:text-amber-300">Switch Role:</span>
          <Select value={currentRole} onValueChange={handleRoleChange}>
            <SelectTrigger className="h-8 w-[140px] bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
  );
}
