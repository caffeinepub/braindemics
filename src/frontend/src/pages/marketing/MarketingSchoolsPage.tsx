// Marketing Schools page - school browsing and search for Marketing role

import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useListAllSchools } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus } from 'lucide-react';

export default function MarketingSchoolsPage() {
  const navigate = useNavigate();
  const { data: schools = [], isLoading } = useListAllSchools();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSchools = schools.filter((school) =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Schools</h1>
          <p className="text-muted-foreground mt-1">Browse and search all schools</p>
        </div>
        <Button onClick={() => navigate({ to: '/marketing/schools/create' })}>
          <Plus className="h-4 w-4 mr-2" />
          Register School
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Schools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, or city..."
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
          ) : filteredSchools.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm ? 'No schools found matching your search' : 'No schools registered yet'}
            </p>
          ) : (
            <div className="space-y-2">
              {filteredSchools.map((school) => (
                <div
                  key={school.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate({ to: '/schools/$schoolId', params: { schoolId: school.id } })}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{school.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {school.city}, {school.state} • ID: {school.id}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">View Details</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
