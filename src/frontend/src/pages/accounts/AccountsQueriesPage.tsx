// Accounts Queries page - view academic queries for Accounts role

import { useListAllAcademicQueries } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function AccountsQueriesPage() {
  const { data: queries = [], isLoading } = useListAllAcademicQueries();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Queries</h1>
        <p className="text-muted-foreground mt-1">View all academic queries</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Queries</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : queries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No queries found</p>
          ) : (
            <div className="space-y-4">
              {queries.map((query) => (
                <div key={query.id} className="border rounded-lg p-4 space-y-2 bg-card">
                  <div className="flex items-center justify-between">
                    <Badge variant={query.status === 'open' ? 'destructive' : 'default'}>
                      {query.status === 'open' ? 'Open' : 'Resolved'}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {format(Number(query.createdTimestamp) / 1000000, 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">School ID: {query.schoolId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Query</p>
                    <p className="text-sm text-muted-foreground">{query.queries}</p>
                  </div>
                  {query.response && (
                    <div>
                      <p className="text-sm font-medium">Response</p>
                      <p className="text-sm text-muted-foreground">{query.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
