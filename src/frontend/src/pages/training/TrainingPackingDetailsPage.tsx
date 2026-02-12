// Training Packing Details page - view packing information for Training role

import { useState } from 'react';
import { useListAllPackingStatuses, useListAllSchools, useGetPackingCountsBySchool } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function TrainingPackingDetailsPage() {
  const { data: packingStatuses = [], isLoading: statusesLoading } = useListAllPackingStatuses();
  const { data: schools = [], isLoading: schoolsLoading } = useListAllSchools();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);

  const { data: packingCounts = [] } = useGetPackingCountsBySchool(selectedSchoolId || '');

  const isLoading = statusesLoading || schoolsLoading;

  const getSchoolName = (schoolId: string) => {
    const school = schools.find((s) => s.id === schoolId);
    return school?.name || schoolId;
  };

  const filteredStatuses = packingStatuses.filter((status) => {
    const schoolName = getSchoolName(status.schoolId);
    return schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           status.schoolId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Packing Details</h1>
        <p className="text-muted-foreground mt-1">View packing information for all schools</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Schools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by school name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : filteredStatuses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm ? 'No schools found matching your search' : 'No packing data available'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>Kit Count</TableHead>
                  <TableHead>Add-On Count</TableHead>
                  <TableHead>Theme</TableHead>
                  <TableHead>Packed</TableHead>
                  <TableHead>Dispatched</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStatuses.map((status) => (
                  <TableRow key={status.schoolId}>
                    <TableCell className="font-medium">{getSchoolName(status.schoolId)}</TableCell>
                    <TableCell>{status.kitCount.toString()}</TableCell>
                    <TableCell>{status.addOnCount.toString()}</TableCell>
                    <TableCell>{status.currentTheme}</TableCell>
                    <TableCell>
                      <Badge variant={status.packed ? 'default' : 'secondary'}>
                        {status.packed ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.dispatched ? 'default' : 'secondary'}>
                        {status.dispatched ? 'Yes' : 'No'}
                      </Badge>
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
