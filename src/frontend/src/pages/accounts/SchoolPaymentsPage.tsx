import { useParams } from '@tanstack/react-router';
import { useGetSchool, useListPaymentsBySchool, useCreatePayment, useUpdatePayment, useUploadPaymentProof } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Plus, Upload, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ExternalBlob } from '../../backend';

export default function SchoolPaymentsPage() {
  const { schoolId } = useParams({ from: '/authenticated/accounts/schools/$schoolId/payments' });
  const { data: school, isLoading: schoolLoading } = useGetSchool(schoolId);
  const { data: payments, isLoading: paymentsLoading } = useListPaymentsBySchool(schoolId);
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();
  const uploadProof = useUploadPaymentProof();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [uploadingProof, setUploadingProof] = useState<string | null>(null);

  const [newPayment, setNewPayment] = useState({
    amount: '',
    dueDate: '',
  });

  const [editPaymentData, setEditPaymentData] = useState({
    amount: '',
    dueDate: '',
    paid: false,
  });

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createPayment.mutateAsync({
        schoolId,
        amount: BigInt(newPayment.amount),
        dueDate: BigInt(new Date(newPayment.dueDate).getTime() * 1000000),
      });

      toast.success('Payment created successfully');
      setCreateDialogOpen(false);
      setNewPayment({ amount: '', dueDate: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create payment');
    }
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPayment) return;

    try {
      await updatePayment.mutateAsync({
        id: selectedPayment.id,
        amount: BigInt(editPaymentData.amount),
        dueDate: BigInt(new Date(editPaymentData.dueDate).getTime() * 1000000),
        paid: editPaymentData.paid,
        schoolId,
      });

      toast.success('Payment updated successfully');
      setEditDialogOpen(false);
      setSelectedPayment(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update payment');
    }
  };

  const handleFileUpload = async (paymentId: string, file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    setUploadingProof(paymentId);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array);

      await uploadProof.mutateAsync({
        paymentId,
        proof: blob,
        schoolId,
      });

      toast.success('Payment proof uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload proof');
    } finally {
      setUploadingProof(null);
    }
  };

  const openEditDialog = (payment: any) => {
    setSelectedPayment(payment);
    setEditPaymentData({
      amount: payment.amount.toString(),
      dueDate: format(Number(payment.dueDate) / 1000000, 'yyyy-MM-dd'),
      paid: payment.paid,
    });
    setEditDialogOpen(true);
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
            <Skeleton className="h-64 w-full" />
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{school.name}</h1>
        <p className="text-muted-foreground mt-1">Manage payments for School ID: {school.id}</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payments</CardTitle>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Payment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePayment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newPayment.dueDate}
                    onChange={(e) => setNewPayment({ ...newPayment, dueDate: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" disabled={createPayment.isPending}>
                  {createPayment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Payment
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {paymentsLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : payments && payments.length > 0 ? (
            <div className="border rounded-lg">
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
                      <TableCell>₹{Number(payment.amount).toLocaleString()}</TableCell>
                      <TableCell>{format(Number(payment.dueDate) / 1000000, 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            payment.paid
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}
                        >
                          {payment.paid ? 'Paid' : 'Pending'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {payment.paymentProof ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const url = payment.paymentProof!.getDirectURL();
                              window.open(url, '_blank');
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        ) : (
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="application/pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(payment.id, file);
                              }}
                              disabled={uploadingProof === payment.id}
                            />
                            <Button variant="ghost" size="sm" disabled={uploadingProof === payment.id} asChild>
                              <span>
                                {uploadingProof === payment.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Upload className="h-4 w-4" />
                                )}
                              </span>
                            </Button>
                          </label>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(payment)}>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No payments recorded yet</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdatePayment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editAmount">Amount</Label>
              <Input
                id="editAmount"
                type="number"
                min="0"
                value={editPaymentData.amount}
                onChange={(e) => setEditPaymentData({ ...editPaymentData, amount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDueDate">Due Date</Label>
              <Input
                id="editDueDate"
                type="date"
                value={editPaymentData.dueDate}
                onChange={(e) => setEditPaymentData({ ...editPaymentData, dueDate: e.target.value })}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="paid"
                checked={editPaymentData.paid}
                onCheckedChange={(checked) => setEditPaymentData({ ...editPaymentData, paid: checked as boolean })}
              />
              <Label htmlFor="paid" className="cursor-pointer">
                Mark as Paid
              </Label>
            </div>
            <Button type="submit" disabled={updatePayment.isPending}>
              {updatePayment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Payment
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
