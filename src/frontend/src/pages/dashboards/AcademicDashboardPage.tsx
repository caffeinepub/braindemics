import { useListAllAcademicQueries } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export default function AcademicDashboardPage() {
  const { data: queries, isLoading } = useListAllAcademicQueries();

  const openQueries = queries?.filter((q) => q.status === 'open').length || 0;
  const resolvedQueries = queries?.filter((q) => q.status === 'resolved').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Academic Dashboard</h1>
          <p className="text-muted-foreground mt-1">Respond to academic queries from trainers</p>
        </div>
        <Link to="/academic/queries">
          <Button>View All Queries</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Queries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{openQueries}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolved Queries</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{resolvedQueries}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
