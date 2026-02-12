import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateSchool, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { StaffRole } from '../../backend';
import { getErrorMessage } from '../../utils/getErrorMessage';

const PRODUCT_OPTIONS = ['Toddler', 'Neo', 'Funtaskit', 'Braindemics'] as const;

export default function SchoolCreatePage() {
  const navigate = useNavigate();
  const { data: profile } = useGetCallerUserProfile();
  const createMutation = useCreateSchool();

  const [formData, setFormData] = useState({
    id: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.product) {
      toast.error('Please select a product');
      return;
    }

    try {
      await createMutation.mutateAsync({
        id: formData.id,
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
      toast.success('School registered successfully');
      
      // Navigate based on role
      if (profile?.role === StaffRole.admin) {
        navigate({ to: '/admin/dashboard' });
      } else {
        navigate({ to: '/marketing/dashboard' });
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Register New School</h1>
        <p className="text-muted-foreground mt-1">Add a new school to the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>School Information</CardTitle>
          <CardDescription>Enter the details of the new school</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="id">School ID *</Label>
                <Input
                  id="id"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">School Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
                    <SelectValue placeholder="Select a product" />
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
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register School
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: profile?.role === StaffRole.admin ? '/admin/dashboard' : '/marketing/dashboard' })}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
