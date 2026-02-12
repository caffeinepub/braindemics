import { useState } from 'react';
import { useListAllAcademicQueries, useRespondToAcademicQuery, useGetSchool, useGetPackingStatus, useGetPackingCountsBySchool } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { Variant_resolved_open } from '../../backend';

export default function AcademicQueriesPage() {
  const { data: queries = [], isLoading } = useListAllAcademicQueries();
  const respondMutation = useRespondToAcademicQuery();

  const [selectedQuery, setSelectedQuery] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState<'open' | 'resolved'>('open');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);

  const { data: school } = useGetSchool(selectedSchoolId || '');
  const { data: packingStatus } = useGetPackingStatus(selectedSchoolId || '');
  const { data: packingCounts = [] } = useGetPackingCountsBySchool(selectedSchoolId || '');

  const handleRespond = (query: any) => {
    setSelectedQuery(query);
    setSelectedSchoolId(query.schoolId);
    setResponse(query.response || '');
    setStatus(query.status === 'open' ? 'open' : 'resolved');
    setDialogOpen(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedQuery) return;

    try {
      await respondMutation.mutateAsync({
        id: selectedQuery.id,
        response,
        status: status === 'resolved' ? Variant_resolved_open.resolved : Variant_resolved_open.open,
      });
      toast.success('Response submitted successfully');
      setDialogOpen(false);
      setSelectedQuery(null);
      setSelectedSchoolId(null);
      setResponse('');
      setStatus('open');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Academic Queries</h1>
        <p className="text-muted-foreground mt-1">Respond to queries raised by trainers</p>
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
                <div key={query.id} className="border rounded-lg p-4 space-y-2">
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
                  <Button size="sm" onClick={() => handleRespond(query)}>
                    {query.response ? 'Update Response' : 'Respond'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Respond to Query</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {selectedQuery && (
              <>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Query</p>
                  <p className="text-sm text-muted-foreground">{selectedQuery.queries}</p>
                </div>

                {/* Packing Details (Read-only) */}
                {packingStatus && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Packing Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <p className="text-sm font-medium">Kit Count</p>
                            <p className="text-sm text-muted-foreground">{packingStatus.kitCount.toString()}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Add-On Count</p>
                            <p className="text-sm text-muted-foreground">{packingStatus.addOnCount.toString()}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Current Theme</p>
                            <p className="text-sm text-muted-foreground">{packingStatus.currentTheme}</p>
                          </div>
                        </div>
                        {packingStatus.dispatchDetails && (
                          <div>
                            <p className="text-sm font-medium">Dispatch Details</p>
                            <p className="text-sm text-muted-foreground">{packingStatus.dispatchDetails}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Packing Counts (Read-only) */}
                {packingCounts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Packing Counts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Class</TableHead>
                            <TableHead>Theme</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Packed</TableHead>
                            <TableHead>Add-On</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {packingCounts.map((count, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{count.classType}</TableCell>
                              <TableCell>{count.theme}</TableCell>
                              <TableCell>{count.totalCount.toString()}</TableCell>
                              <TableCell>{count.packedCount.toString()}</TableCell>
                              <TableCell>{count.addOnCount.toString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

                <div className="bg-card p-4 rounded-lg space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="response">Response *</Label>
                    <Textarea
                      id="response"
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      required
                      rows={6}
                      placeholder="Enter your response..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select value={status} onValueChange={(value: 'open' | 'resolved') => setStatus(value)}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleSubmitResponse} disabled={respondMutation.isPending}>
              {respondMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
