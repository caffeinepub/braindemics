import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetSchool, useGetPackingStatus, useGetPackingCountsBySchool, useListAcademicQueriesBySchool } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';

export default function SchoolPaymentsPage() {
  const { schoolId } = useParams({ from: '/authenticated/accounts/schools/$schoolId/payments' });
  const navigate = useNavigate();
  const { data: school, isLoading: schoolLoading } = useGetSchool(schoolId);
  const { data: packingStatus } = useGetPackingStatus(schoolId);
  const { data: packingCounts = [] } = useGetPackingCountsBySchool(schoolId);
  const { data: queries = [] } = useListAcademicQueriesBySchool(schoolId);

  if (schoolLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/accounts/dashboard' })}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">School Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/accounts/dashboard' })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">{school.name}</h1>
      </div>

      {/* School Details */}
      <Card>
        <CardHeader>
          <CardTitle>School Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium">School ID</p>
            <p className="text-sm text-muted-foreground">{school.id}</p>
          </div>
          <div>
            <p className="text-sm font-medium">City</p>
            <p className="text-sm text-muted-foreground">{school.city}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Shipping Address</p>
            <p className="text-sm text-muted-foreground">{school.shippingAddress}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Product</p>
            <p className="text-sm text-muted-foreground">{school.product}</p>
          </div>
        </CardContent>
      </Card>

      {/* Packing Details (Read-only) */}
      <Card>
        <CardHeader>
          <CardTitle>Packing Details</CardTitle>
        </CardHeader>
        <CardContent>
          {packingStatus ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm font-medium">Kit Count</p>
                  <p className="text-sm text-muted-foreground">{packingStatus.kitCount.toString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Add-On Count</p>
                  <p className="text-sm text-muted-foreground">{packingStatus.addOnCount.toString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Current Theme</p>
                  <p className="text-sm text-muted-foreground">{packingStatus.currentTheme}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant={packingStatus.packed ? 'default' : 'secondary'}>
                  {packingStatus.packed ? 'Packed' : 'Not Packed'}
                </Badge>
                <Badge variant={packingStatus.dispatched ? 'default' : 'secondary'}>
                  {packingStatus.dispatched ? 'Dispatched' : 'Not Dispatched'}
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No packing details available</p>
          )}
        </CardContent>
      </Card>

      {/* Dispatch Details (Read-only) */}
      {packingStatus?.dispatchDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Dispatch Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{packingStatus.dispatchDetails}</p>
          </CardContent>
        </Card>
      )}

      {/* Packing Counts (Read-only) */}
      {packingCounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Packing Counts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Theme</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Packed</TableHead>
                  <TableHead>Add-On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packingCounts.map((count, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{count.classType}</TableCell>
                    <TableCell>{count.theme}</TableCell>
                    <TableCell>{count.totalCount.toString()}</TableCell>
                    <TableCell>{count.packedCount.toString()}</TableCell>
                    <TableCell>{count.addOnCount.toString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* School Queries (Read-only) */}
      {queries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>School Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {queries.map((query) => (
                <div key={query.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={query.status === 'open' ? 'destructive' : 'default'}>
                      {query.status === 'open' ? 'Open' : 'Resolved'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Query</p>
                    <p className="text-sm text-muted-foreground">{query.queries}</p>
                  </div>
                  {query.response && (
                    <div>
                      <p className="text-sm font-medium">Response</p>
                      <p className="text-sm text-muted-foreground">{query.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
