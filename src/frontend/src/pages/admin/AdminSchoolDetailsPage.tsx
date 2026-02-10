import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetConsolidatedSchoolDetails } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { isDemoActive } from '../../demo/demoSession';

export default function AdminSchoolDetailsPage() {
  const { schoolId } = useParams({ from: '/authenticated/admin/schools/$schoolId' });
  const navigate = useNavigate();
  const { data: consolidatedData, isLoading, isError } = useGetConsolidatedSchoolDetails(schoolId);
  const isDemo = isDemoActive();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isDemo || !consolidatedData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/admin/dashboard' })}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">School Details</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground py-8">
              {isDemo
                ? 'Update history is not available in Demo/Preview Mode.'
                : 'School details not found.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { school, outstandingAmount, packingStatus, packingCounts, trainingVisits, academicQueries, sectionMetadata } = consolidatedData;

  const getSectionMeta = (sectionName: string) => {
    return sectionMetadata.find(m => m.section === sectionName);
  };

  const formatTimestamp = (timestamp?: bigint | null) => {
    if (!timestamp) return 'N/A';
    try {
      return format(Number(timestamp) / 1000000, 'MMM dd, yyyy HH:mm');
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/admin/dashboard' })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">{school.name}</h1>
      </div>

      {/* School Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>School Information</CardTitle>
            {getSectionMeta('School') && (
              <div className="text-sm text-muted-foreground">
                Last updated by {getSectionMeta('School')!.lastUpdatedByName || 'Unknown'} on{' '}
                {formatTimestamp(getSectionMeta('School')!.lastUpdatedTimestamp)}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium">School ID</p>
            <p className="text-sm text-muted-foreground">{school.id}</p>
          </div>
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
            <p className="text-sm font-medium">Address</p>
            <p className="text-sm text-muted-foreground">{school.address}, {school.city}, {school.state}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Student Count</p>
            <p className="text-sm text-muted-foreground">{school.studentCount.toString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Amount */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Outstanding Amount</CardTitle>
            {getSectionMeta('OutstandingAmount') && (
              <div className="text-sm text-muted-foreground">
                Last updated by {getSectionMeta('OutstandingAmount')!.lastUpdatedByName || 'Unknown'} on{' '}
                {formatTimestamp(getSectionMeta('OutstandingAmount')!.lastUpdatedTimestamp)}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">₹{outstandingAmount.toString()}</p>
        </CardContent>
      </Card>

      {/* Packing Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Packing Status</CardTitle>
            {getSectionMeta('PackingStatus') && (
              <div className="text-sm text-muted-foreground">
                Last updated by {getSectionMeta('PackingStatus')!.lastUpdatedByName || 'Unknown'} on{' '}
                {formatTimestamp(getSectionMeta('PackingStatus')!.lastUpdatedTimestamp)}
              </div>
            )}
          </div>
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
              {packingStatus.dispatchDetails && (
                <div>
                  <p className="text-sm font-medium">Dispatch Details</p>
                  <p className="text-sm text-muted-foreground">{packingStatus.dispatchDetails}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No packing status available</p>
          )}
        </CardContent>
      </Card>

      {/* Packing Counts */}
      {packingCounts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Packing Counts</CardTitle>
              {getSectionMeta('PackingCount') && (
                <div className="text-sm text-muted-foreground">
                  Last updated by {getSectionMeta('PackingCount')!.lastUpdatedByName || 'Unknown'} on{' '}
                  {formatTimestamp(getSectionMeta('PackingCount')!.lastUpdatedTimestamp)}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {packingCounts.map((count, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="text-sm font-medium">{count.classType} - {count.theme}</p>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Total: {count.totalCount.toString()}</span>
                    <span>Packed: {count.packedCount.toString()}</span>
                    <span>Add-On: {count.addOnCount.toString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Training Visits */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Training Visits</CardTitle>
            {getSectionMeta('TrainingVisit') && (
              <div className="text-sm text-muted-foreground">
                Last updated by {getSectionMeta('TrainingVisit')!.lastUpdatedByName || 'Unknown'} on{' '}
                {formatTimestamp(getSectionMeta('TrainingVisit')!.lastUpdatedTimestamp)}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {trainingVisits.length > 0 ? (
            <div className="space-y-2">
              {trainingVisits.map((visit) => (
                <div key={visit.id} className="p-3 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">{visit.visitingPerson}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(Number(visit.visitDate) / 1000000, 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{visit.reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No training visits recorded</p>
          )}
        </CardContent>
      </Card>

      {/* Academic Queries */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Academic Queries</CardTitle>
            {getSectionMeta('AcademicQuery') && (
              <div className="text-sm text-muted-foreground">
                Last updated by {getSectionMeta('AcademicQuery')!.lastUpdatedByName || 'Unknown'} on{' '}
                {formatTimestamp(getSectionMeta('AcademicQuery')!.lastUpdatedTimestamp)}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {academicQueries.length > 0 ? (
            <div className="space-y-2">
              {academicQueries.map((query) => (
                <div key={query.id} className="p-3 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={query.status === 'resolved' ? 'default' : 'secondary'}>
                      {query.status === 'resolved' ? 'Resolved' : 'Open'}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {format(Number(query.createdTimestamp) / 1000000, 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <p className="text-sm mb-2">{query.queries}</p>
                  {query.response && (
                    <div className="mt-2 p-2 bg-muted rounded">
                      <p className="text-xs font-medium mb-1">Response:</p>
                      <p className="text-sm">{query.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No academic queries recorded</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
