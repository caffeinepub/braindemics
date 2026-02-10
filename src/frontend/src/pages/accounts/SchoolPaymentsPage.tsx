import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import {
  useGetSchool,
  useListPaymentsBySchool,
  useCreatePayment,
  useUpdatePayment,
  useUploadPaymentProof,
  Payment,
} from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Edit, Upload, Download } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ExternalBlob } from '../../backend';
import DemoDataUnavailableState from '../../components/demo/DemoDataUnavailableState';
import { shouldDisableMutations, demoDisabledReason } from '../../demo/demoGuards';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function SchoolPaymentsPage() {
  const { schoolId } = useParams({ from: '/authenticated/accounts/schools/$schoolId/payments' });
  const { data: school, isLoading: schoolLoading, isError: schoolError } = useGetSchool(schoolId);
  const { data: payments, isLoading: paymentsLoading, isError: paymentsError } = useListPaymentsBySchool(schoolId);
  const createMutation = useCreatePayment();
  const updateMutation = useUpdatePayment();
  const uploadProofMutation = useUploadPaymentProof();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    amount: '',
    dueDate: '',
    paid: false,
  });

  const isDemo = shouldDisableMutations();

  const handleOpenCreate = () => {
    setEditingPayment(null);
    setFormData({ amount: '', dueDate: '', paid: false });
    setDialogOpen(true);
  };

  const handleOpenEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      amount: payment.amount.toString(),
      dueDate: format(Number(payment.dueDate) / 1000000, 'yyyy-MM-dd'),
      paid: payment.paid,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (isDemo) {
      toast.error(demoDisabledReason());
      return;
    }

    try {
      const dueDateMs = new Date(formData.dueDate).getTime();
      if (editingPayment) {
        await updateMutation.mutateAsync({
          id: editingPayment.id,
          amount: BigInt(formData.amount),
          dueDate: BigInt(dueDateMs * 1000000),
          paid: formData.paid,
          schoolId,
        });
        toast.success('Payment updated successfully');
      } else {
        await createMutation.mutateAsync({
          schoolId,
          amount: BigInt(formData.amount),
          dueDate: BigInt(dueDateMs * 1000000),
        });
        toast.success('Payment created successfully');
      }
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save payment');
    }
  };

  const handleFileUpload = async (paymentId: string, file: File) => {
    if (isDemo) {
      toast.error(demoDisabledReason());
      return;
    }

    try {
      setUploadingFor(paymentId);
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array);

      await uploadProofMutation.mutateAsync({
        paymentId,
        proof: blob,
        schoolId,
      });
      toast.success('Payment proof uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload proof');
    } finally {
      setUploadingFor(null);
    }
  };

  if (schoolLoading || paymentsLoading) {
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
          <h1 className="text-3xl font-bold">School Payments</h1>
          <p className="text-muted-foreground mt-1">Manage payments for school</p>
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
          <h1 className="text-3xl font-bold">Payments - {school.name}</h1>
          <p className="text-muted-foreground mt-1">Manage payment records and proofs</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button onClick={handleOpenCreate} disabled={isDemo}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment
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
          <CardTitle>Payment Records</CardTitle>
          <CardDescription>View and manage all payments for this school</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentsError && isDemo ? (
            <DemoDataUnavailableState message="Payment data is not available in Demo/Preview Mode." />
          ) : !payments || payments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No payments found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                    <TableCell className="font-medium">₹{payment.amount.toString()}</TableCell>
                    <TableCell>{format(Number(payment.dueDate) / 1000000, 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant={payment.paid ? 'default' : 'secondary'}>
                        {payment.paid ? 'Paid' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payment.paymentProof ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(payment.paymentProof!.getDirectURL(), '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">No proof</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="inline-block">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEdit(payment)}
                                disabled={isDemo}
                              >
                                <Edit className="h-4 w-4" />
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

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="inline-block">
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={uploadingFor === payment.id || isDemo}
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'application/pdf,image/*';
                                  input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) handleFileUpload(payment.id, file);
                                  };
                                  input.click();
                                }}
                              >
                                {uploadingFor === payment.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Upload className="h-4 w-4" />
                                )}
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPayment ? 'Edit Payment' : 'Create Payment'}</DialogTitle>
            <DialogDescription>
              {editingPayment ? 'Update payment information' : 'Add a new payment record'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            {editingPayment && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="paid"
                  checked={formData.paid}
                  onCheckedChange={(checked) => setFormData({ ...formData, paid: checked as boolean })}
                />
                <Label htmlFor="paid" className="cursor-pointer">
                  Mark as paid
                </Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingPayment ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
