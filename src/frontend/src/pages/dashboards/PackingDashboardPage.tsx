import { useListAllPackingStatuses, useListAllSchools } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import SchoolSearchPanel from '../../components/schools/SchoolSearchPanel';

export default function PackingDashboardPage() {
  const { data: packingStatuses, isLoading: statusesLoading } = useListAllPackingStatuses();
  const { data: schools, isLoading: schoolsLoading } = useListAllSchools();

  const pendingDispatch = packingStatuses?.filter((s) => s.packed && !s.dispatched).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Packing Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage packing and dispatch operations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {schoolsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{schools?.length || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Dispatch</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statusesLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{pendingDispatch}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* School Search */}
      <SchoolSearchPanel packingView />
    </div>
  );
}
