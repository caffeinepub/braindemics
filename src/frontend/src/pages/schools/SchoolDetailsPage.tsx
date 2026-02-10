import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetSchool, useUpdateSchool, useGetCallerUserProfile, useGetOutstandingAmount, useHasOutstandingAmount } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { StaffRole } from '../../backend';
import { isDemoActive } from '../../demo/demoSession';

export default function SchoolDetailsPage() {
  const { schoolId } = useParams({ from: '/authenticated/schools/$schoolId' });
  const navigate = useNavigate();
  const { data: school, isLoading } = useGetSchool(schoolId);
  const { data: profile } = useGetCallerUserProfile();
  const { data: hasOutstanding } = useHasOutstandingAmount(schoolId);
  const { data: outstandingAmount } = useGetOutstandingAmount(schoolId);
  const updateMutation = useUpdateSchool();

  const [isEditing, setIsEditing] = useState(false);
  const isDemo = isDemoActive();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    contactPerson: '',
    contactNumber: '',
    email: '',
    website: '',
    studentCount: '0',
  });

  // Update form when school data loads
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

  const canEdit = profile?.role === StaffRole.marketing || profile?.role === StaffRole.admin;

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
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
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update school');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
          <h1 className="text-3xl font-bold">{school.name}</h1>
          <p className="text-muted-foreground mt-1">School ID: {school.id}</p>
        </div>
        {canEdit && !isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
        {isEditing && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        )}
      </div>

      {/* Outstanding Amount (Read-only) */}
      {hasOutstanding && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="text-amber-900 dark:text-amber-100">Outstanding Amount</CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              Financial information for this school
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                ₹{outstandingAmount?.toString() || '0'}
              </span>
              <span className="text-sm text-amber-700 dark:text-amber-300">outstanding</span>
            </div>
          </CardContent>
        </Card>
      )}

      {!hasOutstanding && (
        <Card className="border-muted">
          <CardHeader>
            <CardTitle>Outstanding Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Not set</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>School Information</CardTitle>
          <CardDescription>Basic details and contact information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">School Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentCount">Student Count</Label>
              <Input
                id="studentCount"
                type="number"
                value={formData.studentCount}
                onChange={(e) => setFormData({ ...formData, studentCount: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
