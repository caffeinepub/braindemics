import { useParams } from '@tanstack/react-router';
import { useGetSchool, useListTrainingVisitsBySchool, useCreateTrainingVisit, useListAcademicQueriesBySchool, useCreateAcademicQuery } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Plus, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ExternalBlob } from '../../backend';

export default function SchoolTrainingPage() {
  const { schoolId } = useParams({ from: '/authenticated/training/schools/$schoolId' });
  const { data: school, isLoading: schoolLoading } = useGetSchool(schoolId);
  const { data: visits, isLoading: visitsLoading } = useListTrainingVisitsBySchool(schoolId);
  const { data: queries, isLoading: queriesLoading } = useListAcademicQueriesBySchool(schoolId);
  const createVisit = useCreateTrainingVisit();
  const createQuery = useCreateAcademicQuery();

  const [visitDialogOpen, setVisitDialogOpen] = useState(false);
  const [queryDialogOpen, setQueryDialogOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [newVisit, setNewVisit] = useState({
    visitDate: '',
    reason: '',
    visitingPerson: '',
    contactPersonMobile: '',
    observations: '',
    file: null as File | null,
  });

  const [newQuery, setNewQuery] = useState({
    queries: '',
  });

  const handleCreateVisit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let proof: ExternalBlob | null = null;

      if (newVisit.file) {
        if (newVisit.file.type !== 'application/pdf') {
          toast.error('Only PDF files are allowed');
          return;
        }

        setUploadingFile(true);
        const arrayBuffer = await newVisit.file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        proof = ExternalBlob.fromBytes(uint8Array);
      }

      await createVisit.mutateAsync({
        schoolId,
        visitDate: BigInt(new Date(newVisit.visitDate).getTime() * 1000000),
        reason: newVisit.reason,
        visitingPerson: newVisit.visitingPerson,
        contactPersonMobile: newVisit.contactPersonMobile,
        observations: newVisit.observations,
        classroomObservationProof: proof,
      });

      toast.success('Training visit created successfully');
      setVisitDialogOpen(false);
      setNewVisit({
        visitDate: '',
        reason: '',
        visitingPerson: '',
        contactPersonMobile: '',
        observations: '',
        file: null,
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create visit');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleCreateQuery = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createQuery.mutateAsync({
        schoolId,
        queries: newQuery.queries,
      });

      toast.success('Academic query raised successfully');
      setQueryDialogOpen(false);
      setNewQuery({ queries: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to raise query');
    }
  };

  if (schoolLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">School not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{school.name}</h1>
        <p className="text-muted-foreground mt-1">Training visits for School ID: {school.id}</p>
      </div>

      {/* Training Visits */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Training Visits</CardTitle>
          <Dialog open={visitDialogOpen} onOpenChange={setVisitDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Log Visit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Log Training Visit</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateVisit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="visitDate">Visit Date</Label>
                    <Input
                      id="visitDate"
                      type="date"
                      value={newVisit.visitDate}
                      onChange={(e) => setNewVisit({ ...newVisit, visitDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visitingPerson">Visiting Person</Label>
                    <Input
                      id="visitingPerson"
                      value={newVisit.visitingPerson}
                      onChange={(e) => setNewVisit({ ...newVisit, visitingPerson: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Input
                      id="reason"
                      value={newVisit.reason}
                      onChange={(e) => setNewVisit({ ...newVisit, reason: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPersonMobile">Contact Person Mobile</Label>
                    <Input
                      id="contactPersonMobile"
                      value={newVisit.contactPersonMobile}
                      onChange={(e) => setNewVisit({ ...newVisit, contactPersonMobile: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observations">Observations</Label>
                  <Textarea
                    id="observations"
                    value={newVisit.observations}
                    onChange={(e) => setNewVisit({ ...newVisit, observations: e.target.value })}
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Classroom Observation PDF (Optional)</Label>
                  <Input
                    id="file"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setNewVisit({ ...newVisit, file: e.target.files?.[0] || null })}
                  />
                </div>
                <Button type="submit" disabled={createVisit.isPending || uploadingFile}>
                  {(createVisit.isPending || uploadingFile) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Log Visit
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {visitsLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : visits && visits.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Visiting Person</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Proof</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell>{format(Number(visit.visitDate) / 1000000, 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{visit.visitingPerson}</TableCell>
                      <TableCell>{visit.reason}</TableCell>
                      <TableCell>
                        {visit.classroomObservationProof && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const url = visit.classroomObservationProof!.getDirectURL();
                              window.open(url, '_blank');
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No visits logged yet</p>
          )}
        </CardContent>
      </Card>

      {/* Academic Queries */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Academic Queries</CardTitle>
          <Dialog open={queryDialogOpen} onOpenChange={setQueryDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Raise Query
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Raise Academic Query</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateQuery} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="queries">Query Description</Label>
                  <Textarea
                    id="queries"
                    value={newQuery.queries}
                    onChange={(e) => setNewQuery({ queries: e.target.value })}
                    rows={4}
                    placeholder="Describe the academic query or issue..."
                    required
                  />
                </div>
                <Button type="submit" disabled={createQuery.isPending}>
                  {createQuery.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Raise Query
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {queriesLoading ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : queries && queries.length > 0 ? (
            <div className="space-y-3">
              {queries.map((query) => (
                <div key={query.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium">Query #{query.id}</span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        query.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}
                    >
                      {query.status === 'resolved' ? 'Resolved' : 'Open'}
                    </span>
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
