import { useNavigate } from '@tanstack/react-router';
import { useListAllSchools, useListAllAuditLogs, useListAllStaff } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { School, Users, FileText, Activity, DollarSign, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import DemoDataUnavailableState from '../../components/demo/DemoDataUnavailableState';
import { isDemoActive } from '../../demo/demoSession';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { data: schools, isLoading: schoolsLoading, isError: schoolsError } = useListAllSchools();
  const { data: staff, isLoading: staffLoading, isError: staffError } = useListAllStaff();
  const { data: auditLogs, isLoading: logsLoading, isError: logsError } = useListAllAuditLogs();

  const recentLogs = auditLogs?.slice(0, 10) || [];
  const isDemo = isDemoActive();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">System overview and recent activity</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate({ to: '/admin/outstanding' })}>
            <DollarSign className="h-4 w-4 mr-2" />
            Outstanding Amounts
          </Button>
          <Button onClick={() => navigate({ to: '/marketing/schools/create' })}>
            <Plus className="h-4 w-4 mr-2" />
            Register School
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {schoolsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : schoolsError && isDemo ? (
              <div className="text-sm text-muted-foreground">N/A</div>
            ) : (
              <div className="text-2xl font-bold">{schools?.length || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {staffLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : staffError && isDemo ? (
              <div className="text-sm text-muted-foreground">N/A</div>
            ) : (
              <div className="text-2xl font-bold">{staff?.length || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : logsError && isDemo ? (
              <div className="text-sm text-muted-foreground">N/A</div>
            ) : (
              <div className="text-2xl font-bold">{auditLogs?.length || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : logsError && isDemo ? (
            <DemoDataUnavailableState message="Activity logs are not available in Demo/Preview Mode." />
          ) : recentLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{log.action.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{log.details}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {log.entityType} • {formatDistanceToNow(Number(log.timestamp) / 1000000, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
