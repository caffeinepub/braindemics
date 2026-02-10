import { useListAllAcademicQueries } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function TrainingQueriesPage() {
  const { data: queries, isLoading } = useListAllAcademicQueries();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Queries</h1>
        <p className="text-muted-foreground mt-1">View all academic queries you've raised</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Queries</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : queries && queries.length > 0 ? (
            <div className="space-y-3">
              {queries.map((query) => (
                <div key={query.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-sm font-medium">Query #{query.id}</span>
                      <p className="text-xs text-muted-foreground mt-1">School ID: {query.schoolId}</p>
                    </div>
                    <Badge variant={query.status === 'resolved' ? 'default' : 'secondary'}>
                      {query.status === 'resolved' ? 'Resolved' : 'Open'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{query.queries}</p>
                  {query.response && (
                    <div className="mt-3 p-3 bg-muted rounded-md">
                      <p className="text-xs font-medium mb-1">Response:</p>
                      <p className="text-sm">{query.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No queries raised yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
