import { useListAllSchools, useListAllAcademicQueries } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import SchoolSearchPanel from '../../components/schools/SchoolSearchPanel';

export default function TrainingDashboardPage() {
  const { data: schools, isLoading: schoolsLoading } = useListAllSchools();
  const { data: queries, isLoading: queriesLoading } = useListAllAcademicQueries();

  const openQueries = queries?.filter((q) => q.status === 'open').length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Training Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage training visits and academic queries</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Open Queries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {queriesLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{openQueries}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* School Search */}
      <SchoolSearchPanel trainingView />
    </div>
  );
}
