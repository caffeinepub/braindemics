import { useState } from 'react';
import { useListAllStaff, useCreateStaffProfile, useUpdateStaffProfile } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';
import { Principal } from '@dfinity/principal';
import { StaffRole } from '../../backend';

export default function StaffManagementPage() {
  const { data: staff, isLoading } = useListAllStaff();
  const createStaff = useCreateStaffProfile();
  const updateStaff = useUpdateStaffProfile();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  const [newStaff, setNewStaff] = useState({
    principal: '',
    fullName: '',
    role: StaffRole.marketing,
    department: '',
    contactNumber: '',
    email: '',
  });

  const [editStaffData, setEditStaffData] = useState({
    fullName: '',
    role: StaffRole.marketing,
    department: '',
    contactNumber: '',
    email: '',
  });

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const principal = Principal.fromText(newStaff.principal);
      await createStaff.mutateAsync({
        principal,
        fullName: newStaff.fullName,
        role: newStaff.role,
        department: newStaff.department,
        contactNumber: newStaff.contactNumber,
        email: newStaff.email,
      });

      toast.success('Staff profile created successfully');
      setCreateDialogOpen(false);
      setNewStaff({
        principal: '',
        fullName: '',
        role: StaffRole.marketing,
        department: '',
        contactNumber: '',
        email: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create staff profile');
    }
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStaff) return;

    try {
      await updateStaff.mutateAsync({
        principal: selectedStaff.principal,
        fullName: editStaffData.fullName,
        role: editStaffData.role,
        department: editStaffData.department,
        contactNumber: editStaffData.contactNumber,
        email: editStaffData.email,
      });

      toast.success('Staff profile updated successfully');
      setEditDialogOpen(false);
      setSelectedStaff(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update staff profile');
    }
  };

  const openEditDialog = (staffMember: any) => {
    setSelectedStaff(staffMember);
    setEditStaffData({
      fullName: staffMember.fullName,
      role: staffMember.role,
      department: staffMember.department,
      contactNumber: staffMember.contactNumber,
      email: staffMember.email,
    });
    setEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground mt-1">Manage staff profiles and roles</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Staff Profile</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="principal">Principal ID</Label>
                <Input
                  id="principal"
                  value={newStaff.principal}
                  onChange={(e) => setNewStaff({ ...newStaff, principal: e.target.value })}
                  placeholder="Enter principal identifier"
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={newStaff.fullName}
                    onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={newStaff.role} onValueChange={(v: StaffRole) => setNewStaff({ ...newStaff, role: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={StaffRole.admin}>Admin</SelectItem>
                      <SelectItem value={StaffRole.marketing}>Marketing</SelectItem>
                      <SelectItem value={StaffRole.accounts}>Accounts</SelectItem>
                      <SelectItem value={StaffRole.packing}>Packing</SelectItem>
                      <SelectItem value={StaffRole.training}>Training</SelectItem>
                      <SelectItem value={StaffRole.academic}>Academic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={newStaff.department}
                    onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    value={newStaff.contactNumber}
                    onChange={(e) => setNewStaff({ ...newStaff, contactNumber: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" disabled={createStaff.isPending}>
                {createStaff.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Staff Profile
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Staff</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : staff && staff.length > 0 ? (
            <div className="border rounded-lg">
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
                      <TableCell className="capitalize">{member.role}</TableCell>
                      <TableCell>{member.department}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(member)}>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No staff members yet</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Staff Profile</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <form onSubmit={handleUpdateStaff} className="space-y-4">
              <div className="p-3 bg-muted rounded-md">
                <p className="text-xs font-medium mb-1">Principal ID:</p>
                <p className="text-sm font-mono">{selectedStaff.principal.toString()}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="editFullName">Full Name</Label>
                  <Input
                    id="editFullName"
                    value={editStaffData.fullName}
                    onChange={(e) => setEditStaffData({ ...editStaffData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editRole">Role</Label>
                  <Select
                    value={editStaffData.role}
                    onValueChange={(v: StaffRole) => setEditStaffData({ ...editStaffData, role: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={StaffRole.admin}>Admin</SelectItem>
                      <SelectItem value={StaffRole.marketing}>Marketing</SelectItem>
                      <SelectItem value={StaffRole.accounts}>Accounts</SelectItem>
                      <SelectItem value={StaffRole.packing}>Packing</SelectItem>
                      <SelectItem value={StaffRole.training}>Training</SelectItem>
                      <SelectItem value={StaffRole.academic}>Academic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="editDepartment">Department</Label>
                  <Input
                    id="editDepartment"
                    value={editStaffData.department}
                    onChange={(e) => setEditStaffData({ ...editStaffData, department: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editContactNumber">Contact Number</Label>
                  <Input
                    id="editContactNumber"
                    value={editStaffData.contactNumber}
                    onChange={(e) => setEditStaffData({ ...editStaffData, contactNumber: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editStaffData.email}
                  onChange={(e) => setEditStaffData({ ...editStaffData, email: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" disabled={updateStaff.isPending}>
                {updateStaff.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Staff Profile
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
