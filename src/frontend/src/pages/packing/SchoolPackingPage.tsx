import { useParams } from '@tanstack/react-router';
import { useGetSchool, useGetPackingStatus, useCreateOrUpdatePackingStatus } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function SchoolPackingPage() {
  const { schoolId } = useParams({ from: '/authenticated/packing/schools/$schoolId' });
  const { data: school, isLoading: schoolLoading } = useGetSchool(schoolId);
  const { data: packingStatus, isLoading: statusLoading } = useGetPackingStatus(schoolId);
  const updateStatus = useCreateOrUpdatePackingStatus();

  const [formData, setFormData] = useState({
    kitCount: '',
    addOnCount: '',
    packed: false,
    dispatched: false,
    dispatchDetails: '',
    currentTheme: '',
  });

  useEffect(() => {
    if (packingStatus) {
      setFormData({
        kitCount: packingStatus.kitCount.toString(),
        addOnCount: packingStatus.addOnCount.toString(),
        packed: packingStatus.packed,
        dispatched: packingStatus.dispatched,
        dispatchDetails: packingStatus.dispatchDetails || '',
        currentTheme: packingStatus.currentTheme,
      });
    }
  }, [packingStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateStatus.mutateAsync({
        schoolId,
        kitCount: BigInt(formData.kitCount || 0),
        addOnCount: BigInt(formData.addOnCount || 0),
        packed: formData.packed,
        dispatched: formData.dispatched,
        dispatchDetails: formData.dispatchDetails || null,
        currentTheme: formData.currentTheme,
      });

      toast.success('Packing status updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update packing status');
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
            <Skeleton className="h-96 w-full" />
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{school.name}</h1>
        <p className="text-muted-foreground mt-1">Manage packing for School ID: {school.id}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Packing Status</CardTitle>
        </CardHeader>
        <CardContent>
          {statusLoading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="kitCount">Kit Count</Label>
                  <Input
                    id="kitCount"
                    type="number"
                    min="0"
                    value={formData.kitCount}
                    onChange={(e) => setFormData({ ...formData, kitCount: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addOnCount">Add-on Count</Label>
                  <Input
                    id="addOnCount"
                    type="number"
                    min="0"
                    value={formData.addOnCount}
                    onChange={(e) => setFormData({ ...formData, addOnCount: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentTheme">Current Theme</Label>
                <Input
                  id="currentTheme"
                  value={formData.currentTheme}
                  onChange={(e) => setFormData({ ...formData, currentTheme: e.target.value })}
                  placeholder="Enter current curriculum theme"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="packed"
                    checked={formData.packed}
                    onCheckedChange={(checked) => setFormData({ ...formData, packed: checked as boolean })}
                  />
                  <Label htmlFor="packed" className="cursor-pointer">
                    Packed
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dispatched"
                    checked={formData.dispatched}
                    onCheckedChange={(checked) => setFormData({ ...formData, dispatched: checked as boolean })}
                  />
                  <Label htmlFor="dispatched" className="cursor-pointer">
                    Dispatched
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dispatchDetails">Dispatch Details</Label>
                <Textarea
                  id="dispatchDetails"
                  value={formData.dispatchDetails}
                  onChange={(e) => setFormData({ ...formData, dispatchDetails: e.target.value })}
                  placeholder="Enter dispatch tracking info, courier details, etc."
                  rows={3}
                />
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={updateStatus.isPending}>
                  {updateStatus.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Status
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
