import { useListAllSchools, useGetOutstandingAmountsBySchoolIds, useListAllPackingStatuses, useListAllAcademicQueries } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap, MessageSquare, CheckCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function TrainingDashboardPage() {
  const navigate = useNavigate();
  const { data: schools = [], isLoading: schoolsLoading } = useListAllSchools();
  const { data: queries = [], isLoading: queriesLoading } = useListAllAcademicQueries();
  const { data: packingStatuses = [] } = useListAllPackingStatuses();
  const { data: outstandingAmounts = [] } = useGetOutstandingAmountsBySchoolIds(schools.map((s) => s.id));

  const openQueries = queries.filter((q) => q.status === 'open').length;
  const solvedQueries = queries.filter((q) => q.status === 'resolved').length;

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Training Dashboard</h1>
        <p className="text-muted-foreground mt-1">Monitor training activities and school status</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
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
            <CardTitle className="text-sm font-medium">Open Queries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {queriesLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{openQueries}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Solved Queries</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {queriesLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{solvedQueries}</div>
            )}
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
                    <TableHead>School ID</TableHead>
                    <TableHead>School Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Spoke Name</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Packing Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.map((school) => {
                    const outstanding = getOutstandingForSchool(school.id);
                    const packingStatus = getPackingStatusForSchool(school.id);
                    return (
                      <TableRow
                        key={school.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate({ to: '/training/schools/$schoolId', params: { schoolId: school.id } })}
                      >
                        <TableCell className="font-medium">{school.id}</TableCell>
                        <TableCell>{school.name}</TableCell>
                        <TableCell>{school.city}</TableCell>
                        <TableCell>{school.state}</TableCell>
                        <TableCell>{school.product}</TableCell>
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
