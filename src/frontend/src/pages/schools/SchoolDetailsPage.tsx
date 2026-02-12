import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetSchool, useUpdateSchool, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { StaffRole } from '../../backend';
import { getErrorMessage } from '../../utils/getErrorMessage';

const PRODUCT_OPTIONS = ['Toddler', 'Neo', 'Funtaskit', 'Braindemics'] as const;

export default function SchoolDetailsPage() {
  const { schoolId } = useParams({ from: '/authenticated/schools/$schoolId' });
  const navigate = useNavigate();
  const { data: school, isLoading } = useGetSchool(schoolId);
  const { data: profile } = useGetCallerUserProfile();
  const updateMutation = useUpdateSchool();

  const [isEditing, setIsEditing] = useState(false);
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
    shippingAddress: '',
    product: '',
  });

  useState(() => {
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
        shippingAddress: school.shippingAddress,
        product: school.product,
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        shippingAddress: formData.shippingAddress,
        product: formData.product,
      });
      toast.success('School updated successfully');
      setIsEditing(false);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
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
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/marketing/dashboard' })}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">School Not Found</h1>
        </div>
      </div>
    );
  }

  const isAdmin = profile?.role === StaffRole.admin;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/marketing/dashboard' })}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{school.name}</h1>
        </div>
        {isAdmin && !isEditing && (
          <Button onClick={() => setIsEditing(true)}>Edit</Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>School Information</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">School Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="shippingAddress">Shipping Address *</Label>
                  <Textarea
                    id="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                    required
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product">Product *</Label>
                  <Select
                    value={formData.product}
                    onValueChange={(value) => setFormData({ ...formData, product: value })}
                    required
                  >
                    <SelectTrigger id="product">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_OPTIONS.map((product) => (
                        <SelectItem key={product} value={product}>
                          {product}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentCount">Student Count *</Label>
                  <Input
                    id="studentCount"
                    type="number"
                    value={formData.studentCount}
                    onChange={(e) => setFormData({ ...formData, studentCount: e.target.value })}
                    required
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium">School ID</p>
                <p className="text-sm text-muted-foreground">{school.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium">City</p>
                <p className="text-sm text-muted-foreground">{school.city}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-muted-foreground">{school.address}, {school.city}, {school.state}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium">Shipping Address</p>
                <p className="text-sm text-muted-foreground">{school.shippingAddress}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Product</p>
                <p className="text-sm text-muted-foreground">{school.product}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Student Count</p>
                <p className="text-sm text-muted-foreground">{school.studentCount.toString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Contact Person</p>
                <p className="text-sm text-muted-foreground">{school.contactPerson}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Contact Number</p>
                <p className="text-sm text-muted-foreground">{school.contactNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{school.email}</p>
              </div>
              {school.website && (
                <div>
                  <p className="text-sm font-medium">Website</p>
                  <p className="text-sm text-muted-foreground">{school.website}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
