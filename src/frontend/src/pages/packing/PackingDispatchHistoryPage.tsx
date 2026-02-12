// Packing Dispatch History page - view dispatch history for Packing role

import { useListAllPackingStatuses, useListAllSchools } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

export default function PackingDispatchHistoryPage() {
  const { data: packingStatuses = [], isLoading: statusesLoading } = useListAllPackingStatuses();
  const { data: schools = [], isLoading: schoolsLoading } = useListAllSchools();

  const isLoading = statusesLoading || schoolsLoading;

  const dispatchedStatuses = packingStatuses.filter((status) => status.dispatched);

  const getSchoolName = (schoolId: string) => {
    const school = schools.find((s) => s.id === schoolId);
    return school?.name || schoolId;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dispatch History</h1>
        <p className="text-muted-foreground mt-1">View all dispatched orders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dispatched Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : dispatchedStatuses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No dispatched orders found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>Kit Count</TableHead>
                  <TableHead>Add-On Count</TableHead>
                  <TableHead>Theme</TableHead>
                  <TableHead>Dispatch Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dispatchedStatuses.map((status) => (
                  <TableRow key={status.schoolId}>
                    <TableCell className="font-medium">{getSchoolName(status.schoolId)}</TableCell>
                    <TableCell>{status.kitCount.toString()}</TableCell>
                    <TableCell>{status.addOnCount.toString()}</TableCell>
                    <TableCell>{status.currentTheme}</TableCell>
                    <TableCell>{status.dispatchDetails || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="default">Dispatched</Badge>
                    </TableCell>
                    <TableCell>
                      {format(Number(status.lastUpdateTimestamp) / 1000000, 'MMM dd, yyyy')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
