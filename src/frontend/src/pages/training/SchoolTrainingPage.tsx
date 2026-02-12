import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import {
  useGetSchool,
  useListTrainingVisitsBySchool,
  useCreateTrainingVisit,
  useUpdateTrainingVisit,
  useCreateAcademicQuery,
  useGetOutstandingAmount,
  useGetPackingStatus,
  useGetPackingCountsBySchool,
} from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, Loader2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { getErrorMessage } from '../../utils/getErrorMessage';

export default function SchoolTrainingPage() {
  const { schoolId } = useParams({ from: '/authenticated/training/schools/$schoolId' });
  const navigate = useNavigate();
  const { data: school, isLoading: schoolLoading } = useGetSchool(schoolId);
  const { data: visits = [], isLoading: visitsLoading } = useListTrainingVisitsBySchool(schoolId);
  const { data: outstanding } = useGetOutstandingAmount(schoolId);
  const { data: packingStatus } = useGetPackingStatus(schoolId);
  const { data: packingCounts = [] } = useGetPackingCountsBySchool(schoolId);
  const createVisitMutation = useCreateTrainingVisit();
  const updateVisitMutation = useUpdateTrainingVisit();
  const createQueryMutation = useCreateAcademicQuery();

  const [visitDialogOpen, setVisitDialogOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<string | null>(null);
  const [queryDialogOpen, setQueryDialogOpen] = useState(false);

  const [visitForm, setVisitForm] = useState({
    visitDate: '',
    reason: '',
    visitingPerson: '',
    contactPersonMobile: '',
    observations: '',
  });

  const [queryForm, setQueryForm] = useState({
    queries: '',
  });

  const handleCreateVisit = async () => {
    try {
      const visitDateMs = new Date(visitForm.visitDate).getTime();
      const visitDateNs = BigInt(visitDateMs) * BigInt(1000000);

      if (editingVisit) {
        await updateVisitMutation.mutateAsync({
          id: editingVisit,
          schoolId,
          visitDate: visitDateNs,
          reason: visitForm.reason,
          visitingPerson: visitForm.visitingPerson,
          contactPersonMobile: visitForm.contactPersonMobile,
          observations: visitForm.observations,
          classroomObservationProof: null,
        });
        toast.success('Training visit updated successfully');
      } else {
        await createVisitMutation.mutateAsync({
          schoolId,
          visitDate: visitDateNs,
          reason: visitForm.reason,
          visitingPerson: visitForm.visitingPerson,
          contactPersonMobile: visitForm.contactPersonMobile,
          observations: visitForm.observations,
          classroomObservationProof: null,
        });
        toast.success('Training visit created successfully');
      }
      setVisitDialogOpen(false);
      setEditingVisit(null);
      setVisitForm({
        visitDate: '',
        reason: '',
        visitingPerson: '',
        contactPersonMobile: '',
        observations: '',
      });
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  };

  const handleEditVisit = (visit: any) => {
    setEditingVisit(visit.id);
    const visitDateMs = Number(visit.visitDate) / 1000000;
    const visitDateStr = format(visitDateMs, "yyyy-MM-dd'T'HH:mm");
    setVisitForm({
      visitDate: visitDateStr,
      reason: visit.reason,
      visitingPerson: visit.visitingPerson,
      contactPersonMobile: visit.contactPersonMobile,
      observations: visit.observations,
    });
    setVisitDialogOpen(true);
  };

  const handleCreateQuery = async () => {
    try {
      await createQueryMutation.mutateAsync({
        schoolId,
        queries: queryForm.queries,
      });
      toast.success('Academic query raised successfully');
      setQueryDialogOpen(false);
      setQueryForm({ queries: '' });
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  };

  if (schoolLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/training/dashboard' })}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">School Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/training/dashboard' })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">{school.name}</h1>
      </div>

      {/* School Details */}
      <Card>
        <CardHeader>
          <CardTitle>School Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium">School ID</p>
            <p className="text-sm text-muted-foreground">{school.id}</p>
          </div>
          <div>
            <p className="text-sm font-medium">City</p>
            <p className="text-sm text-muted-foreground">{school.city}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Shipping Address</p>
            <p className="text-sm text-muted-foreground">{school.shippingAddress}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Product</p>
            <p className="text-sm text-muted-foreground">{school.product}</p>
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Details */}
      {outstanding !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle>Outstanding Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{outstanding.toString()}</p>
          </CardContent>
        </Card>
      )}

      {/* Dispatch Details */}
      {packingStatus?.dispatchDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Dispatch Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{packingStatus.dispatchDetails}</p>
          </CardContent>
        </Card>
      )}

      {/* Packing Details (Read-only) */}
      {packingStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Packing Details</CardTitle>
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
              <div className="flex gap-2">
                <Badge variant={packingStatus.packed ? 'default' : 'secondary'}>
                  {packingStatus.packed ? 'Packed' : 'Not Packed'}
                </Badge>
                <Badge variant={packingStatus.dispatched ? 'default' : 'secondary'}>
                  {packingStatus.dispatched ? 'Dispatched' : 'Not Dispatched'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Packing Counts (Read-only) */}
      {packingCounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Packing Counts</CardTitle>
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
            <DialogContent className="bg-card">
              <DialogHeader>
                <DialogTitle>{editingVisit ? 'Edit Training Visit' : 'Log Training Visit'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="visitDate">Visit Date *</Label>
                  <Input
                    id="visitDate"
                    type="datetime-local"
                    value={visitForm.visitDate}
                    onChange={(e) => setVisitForm({ ...visitForm, visitDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason *</Label>
                  <Input
                    id="reason"
                    value={visitForm.reason}
                    onChange={(e) => setVisitForm({ ...visitForm, reason: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visitingPerson">Visiting Person *</Label>
                  <Input
                    id="visitingPerson"
                    value={visitForm.visitingPerson}
                    onChange={(e) => setVisitForm({ ...visitForm, visitingPerson: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPersonMobile">Contact Person Mobile *</Label>
                  <Input
                    id="contactPersonMobile"
                    type="tel"
                    value={visitForm.contactPersonMobile}
                    onChange={(e) => setVisitForm({ ...visitForm, contactPersonMobile: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observations">Observations *</Label>
                  <Textarea
                    id="observations"
                    value={visitForm.observations}
                    onChange={(e) => setVisitForm({ ...visitForm, observations: e.target.value })}
                    required
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateVisit}
                  disabled={createVisitMutation.isPending || updateVisitMutation.isPending}
                >
                  {(createVisitMutation.isPending || updateVisitMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingVisit ? 'Update Visit' : 'Log Visit'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {visitsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : visits.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No training visits recorded</p>
          ) : (
            <div className="space-y-4">
              {visits.map((visit) => (
                <div key={visit.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {format(Number(visit.visitDate) / 1000000, 'MMM dd, yyyy HH:mm')}
                    </p>
                    <Button variant="ghost" size="sm" onClick={() => handleEditVisit(visit)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Reason</p>
                    <p className="text-sm text-muted-foreground">{visit.reason}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Visiting Person</p>
                    <p className="text-sm text-muted-foreground">{visit.visitingPerson}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Observations</p>
                    <p className="text-sm text-muted-foreground">{visit.observations}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Raise Query */}
      <Card>
        <CardHeader>
          <CardTitle>Raise Academic Query</CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={queryDialogOpen} onOpenChange={setQueryDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Raise Query
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
              <DialogHeader>
                <DialogTitle>Raise Academic Query</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="queries">Query Details *</Label>
                  <Textarea
                    id="queries"
                    value={queryForm.queries}
                    onChange={(e) => setQueryForm({ ...queryForm, queries: e.target.value })}
                    required
                    rows={6}
                    placeholder="Describe the academic query..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateQuery} disabled={createQueryMutation.isPending}>
                  {createQueryMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Query
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
