import { useNavigate } from '@tanstack/react-router';
import { useListAllSchools, useGetOutstandingAmounts, useListAllPackingStatuses, useListAllAcademicQueries } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap, DollarSign, Package, MessageSquare } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { data: schools, isLoading: schoolsLoading } = useListAllSchools();
  const { data: outstandingAmounts, isLoading: outstandingLoading } = useGetOutstandingAmounts();
  const { data: packingStatuses, isLoading: packingLoading } = useListAllPackingStatuses();
  const { data: queries, isLoading: queriesLoading } = useListAllAcademicQueries();

  const totalOutstanding = outstandingAmounts
    ? Object.values(outstandingAmounts).reduce((sum, amount) => sum + amount, BigInt(0))
    : BigInt(0);

  const packedCount = packingStatuses?.filter(s => s.packed).length || 0;
  const dispatchedCount = packingStatuses?.filter(s => s.dispatched).length || 0;
  const openQueriesCount = queries?.filter(q => q.status === 'open').length || 0;

  const packingStatusMap = new Map<string, any>();
  packingStatuses?.forEach(status => {
    packingStatusMap.set(status.schoolId, status);
  });

  const queriesCountMap = new Map<string, number>();
  queries?.forEach(query => {
    const count = queriesCountMap.get(query.schoolId) || 0;
    queriesCountMap.set(query.schoolId, count + 1);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of all school operations</p>
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
              <div className="text-2xl font-bold">{schools?.length || 0}</div>
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
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">₹{totalOutstanding.toString()}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Packing Status</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {packingLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-sm">
                <div className="text-2xl font-bold">{packedCount}/{schools?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Packed</p>
              </div>
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
              <div className="text-2xl font-bold">{openQueriesCount}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button onClick={() => navigate({ to: '/admin/staff' })}>
          Manage Staff
        </Button>
        <Button variant="outline" onClick={() => navigate({ to: '/admin/outstanding' })}>
          Set Outstanding Amounts
        </Button>
        <Button variant="outline" onClick={() => navigate({ to: '/admin/audit' })}>
          View Audit Logs
        </Button>
      </div>

      {/* Schools Overview Table */}
      <Card>
        <CardHeader>
          <CardTitle>Schools Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {schoolsLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : schools && schools.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School Name</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead>Packing Status</TableHead>
                  <TableHead>Queries</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((school) => {
                  const outstanding = outstandingAmounts?.[school.id] || BigInt(0);
                  const packingStatus = packingStatusMap.get(school.id);
                  const queriesCount = queriesCountMap.get(school.id) || 0;

                  return (
                    <TableRow key={school.id}>
                      <TableCell 
                        className="font-medium cursor-pointer hover:underline"
                        onClick={() => navigate({ to: '/admin/schools/$schoolId', params: { schoolId: school.id } })}
                      >
                        {school.name}
                      </TableCell>
                      <TableCell>₹{outstanding.toString()}</TableCell>
                      <TableCell>
                        {packingStatus ? (
                          <div className="flex gap-1">
                            <Badge variant={packingStatus.packed ? 'default' : 'secondary'} className="text-xs">
                              {packingStatus.packed ? 'Packed' : 'Not Packed'}
                            </Badge>
                            {packingStatus.dispatched && (
                              <Badge variant="default" className="text-xs">Dispatched</Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No status</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {queriesCount > 0 ? (
                          <Badge variant="secondary">{queriesCount}</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate({ to: '/admin/schools/$schoolId', params: { schoolId: school.id } })}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No schools registered yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
