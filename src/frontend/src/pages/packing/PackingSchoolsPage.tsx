import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useListAllSchools } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function PackingSchoolsPage() {
  const navigate = useNavigate();
  const { data: schools, isLoading } = useListAllSchools();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSchools = schools?.filter(
    (school) =>
      school.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectSchool = (schoolId: string) => {
    navigate({ to: `/packing/schools/${schoolId}` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Packing Management</h1>
        <p className="text-muted-foreground mt-1">Search and select a school to manage packing status</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
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
                    <TableRow key={school.id} className="cursor-pointer hover:bg-accent/50" onClick={() => handleSelectSchool(school.id)}>
                      <TableCell className="font-mono text-sm">{school.id}</TableCell>
                      <TableCell className="font-medium">{school.name}</TableCell>
                      <TableCell>{school.city}</TableCell>
                      <TableCell>{Number(school.studentCount)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleSelectSchool(school.id); }}>
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'No schools found matching your search' : 'No schools registered yet'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
