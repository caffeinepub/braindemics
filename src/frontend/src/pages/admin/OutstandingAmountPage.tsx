import { useState } from 'react';
import { useListAllSchools, useGetOutstandingAmount, useSetOutstandingAmount } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, DollarSign, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

export default function OutstandingAmountPage() {
  const { data: schools, isLoading: schoolsLoading } = useListAllSchools();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [outstandingAmount, setOutstandingAmount] = useState('');

  const { data: currentOutstanding, isLoading: outstandingLoading } = useGetOutstandingAmount(selectedSchoolId || '');
  const setOutstandingMutation = useSetOutstandingAmount();

  const selectedSchool = schools?.find(s => s.id === selectedSchoolId);

  const filteredSchools = schools?.filter(
    (school) =>
      school.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectSchool = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    setOutstandingAmount('');
  };

  const handleSave = async () => {
    if (!selectedSchoolId) {
      toast.error('Please select a school');
      return;
    }

    const amount = parseInt(outstandingAmount || '0');
    if (amount < 0) {
      toast.error('Outstanding amount cannot be negative');
      return;
    }

    try {
      await setOutstandingMutation.mutateAsync({
        schoolId: selectedSchoolId,
        amount: BigInt(amount),
      });
      toast.success('Outstanding amount updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update outstanding amount');
    }
  };

  // Update input when outstanding loads
  useState(() => {
    if (currentOutstanding !== undefined && selectedSchoolId) {
      setOutstandingAmount(currentOutstanding.toString());
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Outstanding Amount Management</h1>
        <p className="text-muted-foreground mt-1">Set and manage outstanding amounts for schools</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* School Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Select School
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by School ID, name, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {schoolsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredSchools && filteredSchools.length > 0 ? (
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>School ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSchools.map((school) => (
                      <TableRow
                        key={school.id}
                        className={`cursor-pointer ${selectedSchoolId === school.id ? 'bg-accent' : ''}`}
                        onClick={() => handleSelectSchool(school.id)}
                      >
                        <TableCell className="font-mono text-sm">{school.id}</TableCell>
                        <TableCell className="font-medium">{school.name}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={selectedSchoolId === school.id ? 'default' : 'ghost'}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectSchool(school.id);
                            }}
                          >
                            {selectedSchoolId === school.id ? 'Selected' : 'Select'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                {searchTerm ? 'No schools found matching your search' : 'No schools registered yet'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Outstanding Amount Editor */}
        <div className="space-y-6">
          {selectedSchool ? (
            <>
              {/* School Details (Read-only) */}
              <Card>
                <CardHeader>
                  <CardTitle>School Details</CardTitle>
                  <CardDescription>Selected school information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    <div>
                      <Label className="text-muted-foreground">School Name</Label>
                      <p className="font-medium">{selectedSchool.name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">School ID</Label>
                      <p className="font-medium font-mono">{selectedSchool.id}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">City / State</Label>
                      <p className="font-medium">{selectedSchool.city}, {selectedSchool.state}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Contact Person</Label>
                      <p className="font-medium">{selectedSchool.contactPerson}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Contact Number</Label>
                      <p className="font-medium">{selectedSchool.contactNumber}</p>
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
                  <CardDescription>Set the outstanding amount for this school</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {outstandingLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="outstanding">Outstanding Amount (₹)</Label>
                        <Input
                          id="outstanding"
                          type="number"
                          value={outstandingAmount}
                          onChange={(e) => setOutstandingAmount(e.target.value)}
                          min="0"
                          placeholder="Enter amount"
                        />
                      </div>
                      <Button onClick={handleSave} disabled={setOutstandingMutation.isPending} className="w-full">
                        {setOutstandingMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Outstanding Amount
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Select a school from the list to manage its outstanding amount
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
