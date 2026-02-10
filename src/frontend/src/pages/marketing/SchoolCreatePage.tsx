import { useState } from 'react';
import { useCreateSchool } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function SchoolCreatePage() {
  const navigate = useNavigate();
  const createSchool = useCreateSchool();
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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.id || !formData.name || !formData.city || !formData.state) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createSchool.mutateAsync({
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
      });

      toast.success('School registered successfully');
      navigate({ to: '/marketing/dashboard' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to register school');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Register New School</h1>
        <p className="text-muted-foreground mt-1">Add a new school to the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>School Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="id">
                  School ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="id"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  placeholder="e.g., SCH001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  School Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter school name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter full address"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">
                  City <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Enter city"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">
                  State <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Enter state"
                  required
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
                  placeholder="Enter contact person name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  placeholder="Enter contact number"
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
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="Enter website URL"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentCount">Student Count</Label>
              <Input
                id="studentCount"
                type="number"
                min="0"
                value={formData.studentCount}
                onChange={(e) => setFormData({ ...formData, studentCount: e.target.value })}
                placeholder="Enter number of students"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={createSchool.isPending}>
                {createSchool.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register School
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate({ to: '/marketing/dashboard' })}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
