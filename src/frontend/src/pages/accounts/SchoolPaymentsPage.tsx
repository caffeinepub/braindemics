import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useGetSchool, useGetOutstandingAmount, useSetOutstandingAmount } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { isDemoActive } from '../../demo/demoSession';
import { getErrorMessage } from '../../utils/getErrorMessage';

export default function SchoolPaymentsPage() {
  const { schoolId } = useParams({ from: '/authenticated/accounts/schools/$schoolId/payments' });
  const { data: school, isLoading: schoolLoading } = useGetSchool(schoolId);
  const { data: outstandingAmount, isLoading: outstandingLoading } = useGetOutstandingAmount(schoolId);
  const setOutstandingMutation = useSetOutstandingAmount();

  const [editingOutstanding, setEditingOutstanding] = useState(false);
  const [outstandingInput, setOutstandingInput] = useState('');

  const isDemo = isDemoActive();

  const handleEditOutstanding = () => {
    setOutstandingInput(outstandingAmount ? outstandingAmount.toString() : '0');
    setEditingOutstanding(true);
  };

  const handleSaveOutstanding = async () => {
    try {
      const amount = BigInt(outstandingInput || '0');
      await setOutstandingMutation.mutateAsync({ schoolId, amount });
      toast.success('Outstanding amount updated successfully');
      setEditingOutstanding(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (schoolLoading || outstandingLoading) {
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
      <div>
        <h1 className="text-3xl font-bold">Payments - {school.name}</h1>
        <p className="text-muted-foreground mt-1">Manage payments and outstanding amounts</p>
      </div>

      {/* School Details */}
      <Card>
        <CardHeader>
          <CardTitle>School Details</CardTitle>
          <CardDescription>Selected school information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">School Name</Label>
              <p className="font-medium">{school.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">School ID</Label>
              <p className="font-medium font-mono">{school.id}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Address</Label>
              <p className="font-medium">{school.address}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">City / State</Label>
              <p className="font-medium">{school.city}, {school.state}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Amount */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Outstanding Amount
          </CardTitle>
          <CardDescription>View and manage outstanding payment amount for this school</CardDescription>
        </CardHeader>
        <CardContent>
          {editingOutstanding ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="outstanding">Outstanding Amount (₹)</Label>
                <Input
                  id="outstanding"
                  type="number"
                  value={outstandingInput}
                  onChange={(e) => setOutstandingInput(e.target.value)}
                  min="0"
                  placeholder="Enter amount"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveOutstanding}
                  disabled={setOutstandingMutation.isPending}
                >
                  {setOutstandingMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingOutstanding(false)}
                  disabled={setOutstandingMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Current Outstanding</Label>
                <p className="text-2xl font-bold">
                  ₹{outstandingAmount ? Number(outstandingAmount).toLocaleString() : '0'}
                </p>
              </div>
              <Button onClick={handleEditOutstanding}>
                Update Outstanding Amount
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>View payment records for this school</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            {isDemo ? 'Payment history is not available in Demo/Preview Mode' : 'No payment records yet'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
