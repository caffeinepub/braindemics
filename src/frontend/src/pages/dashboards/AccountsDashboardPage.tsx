import { useListAllSchools } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import SchoolSearchPanel from '../../components/schools/SchoolSearchPanel';

export default function AccountsDashboardPage() {
  const { data: schools, isLoading } = useListAllSchools();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Accounts Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage payments and financial records</p>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-bold">{schools?.length || 0}</div>
          )}
        </CardContent>
      </Card>

      {/* School Search */}
      <SchoolSearchPanel accountsView />
    </div>
  );
}
