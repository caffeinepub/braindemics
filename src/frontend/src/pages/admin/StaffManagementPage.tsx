import { useState } from 'react';
import {
  useListAllStaff,
  useCreateStaffProfile,
  useUpdateStaffProfile,
  useRepairStaffPermissions,
} from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Plus, Edit, Wrench } from 'lucide-react';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';
import type { StaffRole, StaffProfile } from '../../backend';
import { StaffRole as StaffRoleEnum } from '../../backend';
import DemoDataUnavailableState from '../../components/demo/DemoDataUnavailableState';
import { shouldDisableMutations, demoDisabledReason } from '../../demo/demoGuards';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function StaffManagementPage() {
  const { data: staff, isLoading, isError } = useListAllStaff();
  const createMutation = useCreateStaffProfile();
  const updateMutation = useUpdateStaffProfile();
  const repairMutation = useRepairStaffPermissions();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffProfile | null>(null);
  const [repairDialogOpen, setRepairDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    principal: '',
    fullName: '',
    role: StaffRoleEnum.marketing as StaffRole,
    department: '',
    contactNumber: '',
    email: '',
  });

  const isDemo = shouldDisableMutations();

  const handleOpenCreate = () => {
    setEditingStaff(null);
    setFormData({
      principal: '',
      fullName: '',
      role: StaffRoleEnum.marketing,
      department: '',
      contactNumber: '',
      email: '',
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (staffMember: StaffProfile) => {
    setEditingStaff(staffMember);
    setFormData({
      principal: staffMember.principal.toString(),
      fullName: staffMember.fullName,
      role: staffMember.role,
      department: staffMember.department,
      contactNumber: staffMember.contactNumber,
      email: staffMember.email,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (isDemo) {
      toast.error(demoDisabledReason());
      return;
    }

    try {
      if (editingStaff) {
        await updateMutation.mutateAsync({
          principal: Principal.fromText(formData.principal),
          fullName: formData.fullName,
          role: formData.role,
          department: formData.department,
          contactNumber: formData.contactNumber,
          email: formData.email,
        });
        toast.success('Staff profile updated successfully');
      } else {
        await createMutation.mutateAsync({
          principal: Principal.fromText(formData.principal),
          fullName: formData.fullName,
          role: formData.role,
          department: formData.department,
          contactNumber: formData.contactNumber,
          email: formData.email,
        });
        toast.success('Staff profile created successfully');
      }
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save staff profile');
    }
  };

  const handleRepair = async () => {
    if (isDemo) {
      toast.error(demoDisabledReason());
      setRepairDialogOpen(false);
      return;
    }

    try {
      const count = await repairMutation.mutateAsync();
      toast.success(`Repaired permissions for ${count} staff profiles`);
      setRepairDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to repair staff permissions');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground mt-1">Manage staff profiles and permissions</p>
        </div>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    onClick={() => setRepairDialogOpen(true)}
                    variant="outline"
                    disabled={isDemo}
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    Repair Permissions
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
                <div>
                  <Button onClick={handleOpenCreate} disabled={isDemo}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Staff
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
          <CardDescription>View and manage all staff profiles</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError && isDemo ? (
            <DemoDataUnavailableState message="Staff data is not available in Demo/Preview Mode." />
          ) : !staff || staff.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No staff members found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member.principal.toString()}>
                    <TableCell className="font-medium">{member.fullName}</TableCell>
                    <TableCell>
                      <span className="capitalize">{member.role}</span>
                    </TableCell>
                    <TableCell>{member.department}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="inline-block">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEdit(member)}
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
            <DialogTitle>{editingStaff ? 'Edit Staff Profile' : 'Create Staff Profile'}</DialogTitle>
            <DialogDescription>
              {editingStaff ? 'Update staff member information' : 'Add a new staff member'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="principal">Principal ID</Label>
              <Input
                id="principal"
                value={formData.principal}
                onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                disabled={!!editingStaff}
                placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as StaffRole })}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={StaffRoleEnum.admin}>Admin</SelectItem>
                  <SelectItem value={StaffRoleEnum.marketing}>Marketing</SelectItem>
                  <SelectItem value={StaffRoleEnum.accounts}>Accounts</SelectItem>
                  <SelectItem value={StaffRoleEnum.packing}>Packing</SelectItem>
                  <SelectItem value={StaffRoleEnum.training}>Training</SelectItem>
                  <SelectItem value={StaffRoleEnum.academic}>Academic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
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
              {editingStaff ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Repair Permissions Dialog */}
      <AlertDialog open={repairDialogOpen} onOpenChange={setRepairDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Repair Staff Permissions</AlertDialogTitle>
            <AlertDialogDescription>
              This will backfill missing user permissions for all staff profiles. This is a safe operation
              that only adds missing permissions without removing any existing ones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRepair} disabled={repairMutation.isPending}>
              {repairMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Repair Permissions
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
