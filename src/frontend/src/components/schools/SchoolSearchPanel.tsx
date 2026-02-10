import { useState } from 'react';
import { useListAllSchools } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ExternalLink } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface SchoolSearchPanelProps {
  accountsView?: boolean;
  packingView?: boolean;
  trainingView?: boolean;
}

export default function SchoolSearchPanel({ accountsView, packingView, trainingView }: SchoolSearchPanelProps) {
  const { data: schools, isLoading } = useListAllSchools();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSchools = schools?.filter(
    (school) =>
      school.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionLink = (schoolId: string) => {
    if (accountsView) return `/accounts/schools/${schoolId}/payments`;
    if (packingView) return `/packing/schools/${schoolId}`;
    if (trainingView) return `/training/schools/${schoolId}`;
    return `/schools/${schoolId}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schools</CardTitle>
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

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filteredSchools && filteredSchools.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-mono text-sm">{school.id}</TableCell>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell>{school.city}</TableCell>
                    <TableCell>{Number(school.studentCount)}</TableCell>
                    <TableCell className="text-right">
                      <Link to={getActionLink(school.id)}>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
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
  );
}
