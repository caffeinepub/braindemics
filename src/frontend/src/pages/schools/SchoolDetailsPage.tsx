import { useParams } from '@tanstack/react-router';
import { useGetSchool, useUpdateSchool, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function SchoolDetailsPage() {
  const { schoolId } = useParams({ from: '/authenticated/schools/$schoolId' });
  const { data: school, isLoading } = useGetSchool(schoolId);
  const { data: profile } = useGetCallerUserProfile();
  const updateSchool = useUpdateSchool();

  const canEdit = profile?.role === 'marketing' || profile?.role === 'admin';

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    contactPerson: '',
    contactNumber: '',
    email: '',
    website: '',
    studentCount: '',
  });

  useEffect(() => {
    if (school) {
      setFormData({
        name: school.name,
        address: school.address,
        city: school.city,
        state: school.state,
        contactPerson: school.contactPerson,
        contactNumber: school.contactNumber,
        email: school.email,
        website: school.website || '',
        studentCount: school.studentCount.toString(),
      });
    }
  }, [school]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canEdit) {
      toast.error('You do not have permission to edit school details');
      return;
    }

    try {
      await updateSchool.mutateAsync({
        id: schoolId,
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        contactPerson: formData.contactPerson,
        contactNumber: formData.contactNumber,
        email: formData.email,
        website: formData.website || null,
        studentCount: BigInt(formData.studentCount || 0),
      });

      toast.success('School updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update school');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
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
        <p className="text-muted-foreground mt-1">School ID: {school.id}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>School Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">School Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentCount">Student Count</Label>
                <Input
                  id="studentCount"
                  type="number"
                  value={formData.studentCount}
                  onChange={(e) => setFormData({ ...formData, studentCount: e.target.value })}
                  disabled={!canEdit}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={!canEdit}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  disabled={!canEdit}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  disabled={!canEdit}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  disabled={!canEdit}
                />
              </div>
            </div>

            {canEdit && (
              <div className="pt-4">
                <Button type="submit" disabled={updateSchool.isPending}>
                  {updateSchool.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
