import { useState } from 'react';
import { useListAllAcademicQueries, useRespondToAcademicQuery, useListAllSchools } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Variant_resolved_open } from '../../backend';
import { getErrorMessage } from '../../utils/getErrorMessage';

export default function AcademicQueriesPage() {
  const { data: queries, isLoading } = useListAllAcademicQueries();
  const { data: schools, isLoading: schoolsLoading } = useListAllSchools();
  const respondToQuery = useRespondToAcademicQuery();

  const [selectedQuery, setSelectedQuery] = useState<any>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState<'open' | 'resolved'>('open');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'resolved'>('all');

  // Build school ID to name map
  const schoolMap = new Map<string, string>();
  if (schools) {
    schools.forEach(school => {
      schoolMap.set(school.id, school.name);
    });
  }

  const filteredQueries = queries?.filter((q) => {
    if (filterStatus === 'all') return true;
    return q.status === filterStatus;
  });

  const openResponseDialog = (query: any) => {
    setSelectedQuery(query);
    setResponse(query.response || '');
    setStatus(query.status);
    setResponseDialogOpen(true);
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedQuery) return;

    try {
      await respondToQuery.mutateAsync({
        id: selectedQuery.id,
        response,
        status: status as Variant_resolved_open,
      });

      toast.success('Response submitted successfully');
      setResponseDialogOpen(false);
      setSelectedQuery(null);
      setResponse('');
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Academic Queries</h1>
        <p className="text-muted-foreground mt-1">Respond to queries raised by trainers</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Queries</CardTitle>
          <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading || schoolsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredQueries && filteredQueries.length > 0 ? (
            <div className="space-y-3">
              {filteredQueries.map((query) => {
                const schoolName = schoolMap.get(query.schoolId) || 'Unknown';
                return (
                  <div key={query.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-sm font-medium">Query #{query.id}</span>
                        <p className="text-xs text-muted-foreground mt-1">School Name: {schoolName}</p>
                        <p className="text-xs text-muted-foreground">School ID: {query.schoolId}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={query.status === 'resolved' ? 'default' : 'secondary'}>
                          {query.status === 'resolved' ? 'Resolved' : 'Open'}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => openResponseDialog(query)}>
                          Respond
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{query.queries}</p>
                    {query.response && (
                      <div className="mt-3 p-3 bg-muted rounded-md">
                        <p className="text-xs font-medium mb-1">Response:</p>
                        <p className="text-sm">{query.response}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              {filterStatus === 'all' ? 'No queries yet' : `No ${filterStatus} queries`}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Respond to Query</DialogTitle>
          </DialogHeader>
          {selectedQuery && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-md">
                <p className="text-xs font-medium mb-1">Query:</p>
                <p className="text-sm">{selectedQuery.queries}</p>
              </div>
              <form onSubmit={handleSubmitResponse} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="response">Response</Label>
                  <Textarea
                    id="response"
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={4}
                    placeholder="Enter your response..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setResponseDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={respondToQuery.isPending}>
                    {respondToQuery.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Response
                  </Button>
                </DialogFooter>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
