import { useListAllSchools, useGetOutstandingAmountsBySchoolIds, useListAllPackingStatuses, useListAllAcademicQueries } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap, DollarSign, Package, MessageSquare } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { data: schools = [], isLoading: schoolsLoading } = useListAllSchools();
  
  // Memoize school IDs to prevent unnecessary re-renders and ensure stable reference
  const schoolIds = useMemo(() => schools.map((s) => s.id), [schools]);
  
  // Only fetch outstanding amounts when we have school IDs
  const { data: outstandingAmounts = [], isLoading: outstandingLoading } = useGetOutstandingAmountsBySchoolIds(schoolIds);
  const { data: packingStatuses = [] } = useListAllPackingStatuses();
  const { data: queries = [] } = useListAllAcademicQueries();

  const totalOutstanding = useMemo(() => {
    return outstandingAmounts.reduce((sum: bigint, [_, amount]: [string, bigint]) => sum + amount, BigInt(0));
  }, [outstandingAmounts]);

  const totalPacked = useMemo(() => {
    return packingStatuses.filter((s) => s.packed).length;
  }, [packingStatuses]);

  const totalDispatched = useMemo(() => {
    return packingStatuses.filter((s) => s.dispatched).length;
  }, [packingStatuses]);

  const openQueries = useMemo(() => {
    return queries.filter((q) => q.status === 'open').length;
  }, [queries]);

  const getOutstandingForSchool = (schoolId: string): bigint => {
    const found = outstandingAmounts.find(([id]) => id === schoolId);
    return found ? found[1] : BigInt(0);
  };

  const getPackingStatusForSchool = (schoolId: string): string => {
    const status = packingStatuses.find((s) => s.schoolId === schoolId);
    if (!status) return 'Not Started';
    if (status.dispatched) return 'Dispatched';
    if (status.packed) return 'Packed';
    return 'In Progress';
  };

  const getQueryCountForSchool = (schoolId: string): number => {
    return queries.filter((q) => q.schoolId === schoolId).length;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">System overview and management</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Dispatched</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDispatched}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Queries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openQueries}</div>
          </CardContent>
        </Card>
      </div>

      {/* Schools Table */}
      <Card>
        <CardHeader>
          <CardTitle>Schools Overview</CardTitle>
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>School Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Packing Status</TableHead>
                    <TableHead>Queries</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.map((school) => {
                    const outstanding = getOutstandingForSchool(school.id);
                    const packingStatus = getPackingStatusForSchool(school.id);
                    const queryCount = getQueryCountForSchool(school.id);
                    return (
                      <TableRow
                        key={school.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate({ to: '/admin/schools/$schoolId', params: { schoolId: school.id } })}
                      >
                        <TableCell className="font-medium">{school.name}</TableCell>
                        <TableCell>{school.city}</TableCell>
                        <TableCell>₹{outstanding.toString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              packingStatus === 'Dispatched'
                                ? 'default'
                                : packingStatus === 'Packed'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {packingStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>{queryCount}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
