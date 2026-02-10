import { useNavigate } from '@tanstack/react-router';
import { useListAllSchools } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import DemoDataUnavailableState from '../../components/demo/DemoDataUnavailableState';
import { isDemoActive } from '../../demo/demoSession';

export default function PackingDashboardPage() {
  const navigate = useNavigate();
  const { data: schools, isLoading, isError } = useListAllSchools();
  const isDemo = isDemoActive();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Packing Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage packing and dispatch operations</p>
        </div>
        <Button onClick={() => navigate({ to: '/packing/schools' })}>
          <Search className="h-4 w-4 mr-2" />
          Search Schools
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : isError && isDemo ? (
              <div className="text-sm text-muted-foreground">N/A</div>
            ) : (
              <div className="text-2xl font-bold">{schools?.length || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate({ to: '/packing/schools' })} className="justify-start">
              <Search className="h-4 w-4 mr-2" />
              Search and Select School
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
