import { useListAllSchools, useGetOutstandingAmountsBySchoolIds, useGetPackingStatus, useGetPackingCountsBySchool } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap, DollarSign } from 'lucide-react';
import { useState } from 'react';

export default function MarketingDashboardPage() {
  const { data: schools = [], isLoading: schoolsLoading } = useListAllSchools();
  const { data: outstandingAmounts = [], isLoading: outstandingLoading } = useGetOutstandingAmountsBySchoolIds(schools.map((s) => s.id));
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const { data: packingStatus } = useGetPackingStatus(selectedSchoolId || '');
  const { data: packingCounts = [] } = useGetPackingCountsBySchool(selectedSchoolId || '');

  const totalOutstanding = outstandingAmounts.reduce(
    (sum: bigint, [_, amount]: [string, bigint]) => sum + amount,
    BigInt(0)
  );

  const getOutstandingForSchool = (schoolId: string): bigint => {
    const found = outstandingAmounts.find(([id]) => id === schoolId);
    return found ? found[1] : BigInt(0);
  };

  const selectedSchool = schools.find((s) => s.id === selectedSchoolId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Marketing Dashboard</h1>
        <p className="text-muted-foreground mt-1">School registrations and overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {schoolsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{schools.length}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {outstandingLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">₹{totalOutstanding.toString()}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Schools List */}
      <Card>
        <CardHeader>
          <CardTitle>Schools</CardTitle>
        </CardHeader>
        <CardContent>
          {schoolsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : schools.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No schools found</p>
          ) : (
            <div className="space-y-4">
              {schools.map((school) => {
                const outstanding = getOutstandingForSchool(school.id);
                const isSelected = selectedSchoolId === school.id;
                return (
                  <div key={school.id} className="border rounded-lg">
                    <div
                      className="p-4 cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedSchoolId(isSelected ? null : school.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{school.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {school.city}, {school.state}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{outstanding.toString()}</p>
                          <p className="text-sm text-muted-foreground">Outstanding</p>
                        </div>
                      </div>
                    </div>

                    {isSelected && selectedSchool && (
                      <div className="border-t p-4 space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
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
                          <div>
                            <p className="text-sm font-medium">Student Count</p>
                            <p className="text-sm text-muted-foreground">{school.studentCount.toString()}</p>
                          </div>
                        </div>

                        {packingStatus && (
                          <div>
                            <h4 className="font-semibold mb-2">Packing Status</h4>
                            <div className="flex gap-2">
                              <Badge variant={packingStatus.packed ? 'default' : 'secondary'}>
                                {packingStatus.packed ? 'Packed' : 'Not Packed'}
                              </Badge>
                              <Badge variant={packingStatus.dispatched ? 'default' : 'secondary'}>
                                {packingStatus.dispatched ? 'Dispatched' : 'Not Dispatched'}
                              </Badge>
                            </div>
                            {packingStatus.dispatchDetails && (
                              <div className="mt-2">
                                <p className="text-sm font-medium">Dispatch Details</p>
                                <p className="text-sm text-muted-foreground">{packingStatus.dispatchDetails}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {packingCounts.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Packing Counts</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Class</TableHead>
                                  <TableHead>Theme</TableHead>
                                  <TableHead>Total</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {packingCounts.map((count, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell>{count.classType}</TableCell>
                                    <TableCell>{count.theme}</TableCell>
                                    <TableCell>{count.totalCount.toString()}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
