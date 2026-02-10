import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useGetSchool, useListTrainingVisitsBySchool, useCreateTrainingVisit } from '../../hooks/useQueries';
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
import { Loader2, Plus, Download } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ExternalBlob } from '../../backend';
import DemoDataUnavailableState from '../../components/demo/DemoDataUnavailableState';
import { shouldDisableMutations, demoDisabledReason } from '../../demo/demoGuards';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function SchoolTrainingPage() {
  const { schoolId } = useParams({ from: '/authenticated/training/schools/$schoolId' });
  const { data: school, isLoading: schoolLoading, isError: schoolError } = useGetSchool(schoolId);
  const { data: visits, isLoading: visitsLoading, isError: visitsError } = useListTrainingVisitsBySchool(schoolId);
  const createMutation = useCreateTrainingVisit();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isDemo = shouldDisableMutations();

  const [formData, setFormData] = useState({
    visitDate: '',
    reason: '',
    visitingPerson: '',
    contactPersonMobile: '',
    observations: '',
  });

  const handleSubmit = async () => {
    if (isDemo) {
      toast.error(demoDisabledReason());
      return;
    }

    try {
      const visitDateMs = new Date(formData.visitDate).getTime();
      let proof: ExternalBlob | null = null;

      if (selectedFile) {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        proof = ExternalBlob.fromBytes(uint8Array);
      }

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
      setDialogOpen(false);
      setFormData({
        visitDate: '',
        reason: '',
        visitingPerson: '',
        contactPersonMobile: '',
        observations: '',
      });
      setSelectedFile(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to log training visit');
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Training - {school.name}</h1>
          <p className="text-muted-foreground mt-1">Log and view training visits</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button onClick={() => setDialogOpen(true)} disabled={isDemo}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Visit
                </Button>
              </div>
            </TooltipTrigger>
            {isDemo && (
              <TooltipContent>
                <p>{demoDisabledReason()}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      <Card>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Log Training Visit</DialogTitle>
            <DialogDescription>Record a new training visit for this school</DialogDescription>
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
                <Label htmlFor="contactPersonMobile">Contact Mobile</Label>
                <Input
                  id="contactPersonMobile"
                  value={formData.contactPersonMobile}
                  onChange={(e) => setFormData({ ...formData, contactPersonMobile: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
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
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proof">Classroom Observation Proof (PDF/Image)</Label>
              <Input
                id="proof"
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Log Visit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
