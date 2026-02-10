import { useListAllSchools } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { School, Plus } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Skeleton } from '@/components/ui/skeleton';
import SchoolSearchPanel from '../../components/schools/SchoolSearchPanel';

export default function MarketingDashboardPage() {
  const { data: schools, isLoading } = useListAllSchools();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage schools and registrations</p>
        </div>
        <Link to="/marketing/schools/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Register School
          </Button>
        </Link>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
          <School className="h-4 w-4 text-muted-foreground" />
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
      <SchoolSearchPanel />
    </div>
  );
}
