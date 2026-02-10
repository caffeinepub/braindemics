import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useGetSchool, useListTrainingVisitsBySchool, useCreateTrainingVisit, useUpdateTrainingVisit, useCreateAcademicQuery } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Plus, Download, MessageSquare, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ExternalBlob, TrainingVisit } from '../../backend';
import DemoDataUnavailableState from '../../components/demo/DemoDataUnavailableState';
import { isDemoActive } from '../../demo/demoSession';
import { getErrorMessage } from '../../utils/getErrorMessage';

export default function SchoolTrainingPage() {
  const { schoolId } = useParams({ from: '/authenticated/training/schools/$schoolId' });
  const { data: school, isLoading: schoolLoading, isError: schoolError } = useGetSchool(schoolId);
  const { data: visits, isLoading: visitsLoading, isError: visitsError } = useListTrainingVisitsBySchool(schoolId);
  const createMutation = useCreateTrainingVisit();
  const updateMutation = useUpdateTrainingVisit();
  const createQueryMutation = useCreateAcademicQuery();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingVisit, setEditingVisit] = useState<TrainingVisit | null>(null);
  const [queryDialogOpen, setQueryDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [removeProof, setRemoveProof] = useState(false);

  const isDemo = isDemoActive();

  const [formData, setFormData] = useState({
    visitDate: '',
    reason: '',
    visitingPerson: '',
    contactPersonMobile: '',
    observations: '',
  });

  const [queryText, setQueryText] = useState('');

  const openCreateDialog = () => {
    setEditMode(false);
    setEditingVisit(null);
    setFormData({
      visitDate: '',
      reason: '',
      visitingPerson: '',
      contactPersonMobile: '',
      observations: '',
    });
    setSelectedFile(null);
    setRemoveProof(false);
    setDialogOpen(true);
  };

  const openEditDialog = (visit: TrainingVisit) => {
    setEditMode(true);
    setEditingVisit(visit);
    const visitDateStr = format(Number(visit.visitDate) / 1000000, 'yyyy-MM-dd');
    setFormData({
      visitDate: visitDateStr,
      reason: visit.reason,
      visitingPerson: visit.visitingPerson,
      contactPersonMobile: visit.contactPersonMobile,
      observations: visit.observations,
    });
    setSelectedFile(null);
    setRemoveProof(false);
    setDialogOpen(true);
  };

  const handleVisitDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      // Clear transient state when dialog closes
      setSelectedFile(null);
      setRemoveProof(false);
      setEditMode(false);
      setEditingVisit(null);
    }
  };

  const handleQueryDialogOpenChange = (open: boolean) => {
    setQueryDialogOpen(open);
    if (!open) {
      // Clear transient state when dialog closes
      setQueryText('');
    }
  };

  const handleSubmit = async () => {
    try {
      const visitDateMs = new Date(formData.visitDate).getTime();
      let proof: ExternalBlob | null = null;

      if (removeProof) {
        proof = null;
      } else if (selectedFile) {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        proof = ExternalBlob.fromBytes(uint8Array);
      } else if (editMode && editingVisit?.classroomObservationProof) {
        proof = editingVisit.classroomObservationProof;
      }

      if (editMode && editingVisit) {
        await updateMutation.mutateAsync({
          id: editingVisit.id,
          schoolId,
          visitDate: BigInt(visitDateMs * 1000000),
          reason: formData.reason,
          visitingPerson: formData.visitingPerson,
          contactPersonMobile: formData.contactPersonMobile,
          observations: formData.observations,
          classroomObservationProof: proof,
        });
        toast.success('Training visit updated successfully');
      } else {
        await createMutation.mutateAsync({
          schoolId,
          visitDate: BigInt(visitDateMs * 1000000),
          reason: formData.reason,
          visitingPerson: formData.visitingPerson,
          contactPersonMobile: formData.contactPersonMobile,
          observations: formData.observations,
          classroomObservationProof: proof,
        });
        toast.success('Training visit logged successfully');
      }

      setDialogOpen(false);
      setFormData({
        visitDate: '',
        reason: '',
        visitingPerson: '',
        contactPersonMobile: '',
        observations: '',
      });
      setSelectedFile(null);
      setEditMode(false);
      setEditingVisit(null);
      setRemoveProof(false);
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleSubmitQuery = async () => {
    if (!queryText.trim()) {
      toast.error('Please enter a query');
      return;
    }

    try {
      await createQueryMutation.mutateAsync({
        schoolId,
        queries: queryText,
      });
      toast.success('Academic query submitted successfully');
      setQueryDialogOpen(false);
      setQueryText('');
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    }
  };

  if (schoolLoading || visitsLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (schoolError && isDemo) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Training Visits</h1>
          <p className="text-muted-foreground mt-1">Log training visits</p>
        </div>
        <DemoDataUnavailableState message="School data is not available in Demo/Preview Mode." />
      </div>
    );
  }

  if (!school) {
    return <div>School not found</div>;
  }

  return (
    <div className="space-y-6 bg-background min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Training - {school.name}</h1>
          <p className="text-muted-foreground mt-1">Log visits and raise academic queries</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setQueryDialogOpen(true)} variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Raise Query
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Log Visit
          </Button>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Training Visits</CardTitle>
          <CardDescription>View all training visits for this school</CardDescription>
        </CardHeader>
        <CardContent>
          {visitsError && isDemo ? (
            <DemoDataUnavailableState message="Training visit data is not available in Demo/Preview Mode." />
          ) : !visits || visits.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No training visits logged yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visit Date</TableHead>
                  <TableHead>Visiting Person</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell>{format(Number(visit.visitDate) / 1000000, 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="font-medium">{visit.visitingPerson}</TableCell>
                    <TableCell>{visit.reason}</TableCell>
                    <TableCell>{visit.contactPersonMobile}</TableCell>
                    <TableCell>
                      {visit.classroomObservationProof ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(visit.classroomObservationProof!.getDirectURL(), '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">No proof</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(visit)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Visit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleVisitDialogOpenChange}>
        <DialogContent className="max-w-2xl bg-white dark:bg-background text-foreground border-border shadow-lg">
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edit Training Visit' : 'Log Training Visit'}</DialogTitle>
            <DialogDescription>
              {editMode ? 'Update the training visit details' : 'Record a new training visit for this school'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="visitDate">Visit Date</Label>
                <Input
                  id="visitDate"
                  type="date"
                  value={formData.visitDate}
                  onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visitingPerson">Visiting Person</Label>
                <Input
                  id="visitingPerson"
                  value={formData.visitingPerson}
                  onChange={(e) => setFormData({ ...formData, visitingPerson: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPersonMobile">Contacted Person Mobile</Label>
                <Input
                  id="contactPersonMobile"
                  value={formData.contactPersonMobile}
                  onChange={(e) => setFormData({ ...formData, contactPersonMobile: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Purpose of Visit</Label>
                <Input
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="observations">Observations</Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proof">Classroom Observation Proof (Optional)</Label>
              {editMode && editingVisit?.classroomObservationProof && !removeProof && !selectedFile && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-muted-foreground">Current proof attached</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRemoveProof(true)}
                  >
                    Remove
                  </Button>
                </div>
              )}
              {removeProof && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-destructive">Proof will be removed</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRemoveProof(false)}
                  >
                    Undo
                  </Button>
                </div>
              )}
              <Input
                id="proof"
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => {
                  setSelectedFile(e.target.files?.[0] || null);
                  setRemoveProof(false);
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editMode ? 'Update Visit' : 'Log Visit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Raise Query Dialog */}
      <Dialog open={queryDialogOpen} onOpenChange={handleQueryDialogOpenChange}>
        <DialogContent className="max-w-lg bg-white dark:bg-background text-foreground border-border shadow-lg">
          <DialogHeader>
            <DialogTitle>Raise Academic Query</DialogTitle>
            <DialogDescription>
              Submit a query to the academic team for this school
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="query">Query Details</Label>
              <Textarea
                id="query"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Describe the academic query..."
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setQueryDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitQuery}
              disabled={createQueryMutation.isPending}
            >
              {createQueryMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit Query
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
