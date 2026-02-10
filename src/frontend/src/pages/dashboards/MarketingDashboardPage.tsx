import { useState } from 'react';
import { useListAllSchools, useGetOutstandingAmounts, useGetPackingStatus, useGetPackingCountsBySchool } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, DollarSign, School as SchoolIcon, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

export default function MarketingDashboardPage() {
  const { data: schools, isLoading: schoolsLoading } = useListAllSchools();
  const { data: outstandingAmounts } = useGetOutstandingAmounts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);

  const selectedSchool = schools?.find(s => s.id === selectedSchoolId);
  const { data: packingStatus } = useGetPackingStatus(selectedSchoolId || '');
  const { data: packingCounts } = useGetPackingCountsBySchool(selectedSchoolId || '');

  const filteredSchools = schools?.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSchools = schools?.length || 0;
  const totalOutstanding = Object.values(outstandingAmounts || {}).reduce(
    (sum, amount) => sum + Number(amount),
    0
  );

  if (schoolsLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Marketing Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of schools and outstanding amounts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <SchoolIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSchools}</div>
            <p className="text-xs text-muted-foreground">Registered schools</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalOutstanding.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all schools</p>
          </CardContent>
        </Card>
      </div>

      {/* Schools List and Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Schools List */}
        <Card>
          <CardHeader>
            <CardTitle>Schools</CardTitle>
            <CardDescription>Select a school to view details</CardDescription>
            <div className="pt-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search schools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredSchools && filteredSchools.length > 0 ? (
                filteredSchools.map((school) => {
                  const outstanding = outstandingAmounts?.[school.id] || BigInt(0);
                  const isSelected = selectedSchoolId === school.id;
                  return (
                    <Button
                      key={school.id}
                      variant={isSelected ? 'default' : 'outline'}
                      className="w-full justify-start text-left h-auto py-3"
                      onClick={() => setSelectedSchoolId(school.id)}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{school.name}</div>
                        <div className="text-xs text-muted-foreground">{school.city}</div>
                        <div className="text-xs mt-1">
                          Outstanding: ₹{Number(outstanding).toLocaleString()}
                        </div>
                      </div>
                    </Button>
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground py-8">No schools found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* School Details */}
        <Card>
          <CardHeader>
            <CardTitle>School Details</CardTitle>
            <CardDescription>
              {selectedSchool ? 'Detailed information and packing status' : 'Select a school to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedSchool ? (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground text-xs">School Name</Label>
                    <p className="font-medium">{selectedSchool.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">School ID</Label>
                    <p className="font-mono text-sm">{selectedSchool.id}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Location</Label>
                    <p>{selectedSchool.city}, {selectedSchool.state}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Contact</Label>
                    <p>{selectedSchool.contactPerson} - {selectedSchool.contactNumber}</p>
                  </div>
                </div>

                <Separator />

                {/* Outstanding Amount */}
                <div>
                  <Label className="text-muted-foreground text-xs">Outstanding Amount</Label>
                  <p className="text-xl font-bold text-destructive">
                    ₹{Number(outstandingAmounts?.[selectedSchool.id] || BigInt(0)).toLocaleString()}
                  </p>
                </div>

                <Separator />

                {/* Packing Status */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <Label className="text-sm font-semibold">Packing Status</Label>
                  </div>
                  {packingStatus ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Packed:</span>
                        <Badge variant={packingStatus.packed ? 'default' : 'secondary'}>
                          {packingStatus.packed ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Dispatched:</span>
                        <Badge variant={packingStatus.dispatched ? 'default' : 'secondary'}>
                          {packingStatus.dispatched ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      {packingStatus.dispatchDetails && (
                        <div>
                          <Label className="text-muted-foreground text-xs">Dispatch Details</Label>
                          <p className="text-sm">{packingStatus.dispatchDetails}</p>
                        </div>
                      )}
                      <div>
                        <Label className="text-muted-foreground text-xs">Current Theme</Label>
                        <p className="text-sm">{packingStatus.currentTheme || 'Not set'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div>
                          <Label className="text-muted-foreground text-xs">Kit Count</Label>
                          <p className="font-medium">{Number(packingStatus.kitCount)}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-xs">Add-On Count</Label>
                          <p className="font-medium">{Number(packingStatus.addOnCount)}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No packing status available</p>
                  )}
                </div>

                {/* Packing Counts by Class/Theme */}
                {packingCounts && packingCounts.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Class & Theme Counts</Label>
                      <div className="space-y-2">
                        {packingCounts.map((count, idx) => (
                          <div key={idx} className="p-2 border rounded-md text-sm">
                            <div className="font-medium">
                              {count.classType} - {count.theme}
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-1 text-xs text-muted-foreground">
                              <div>Total: {Number(count.totalCount)}</div>
                              <div>Packed: {Number(count.packedCount)}</div>
                              <div>Add-On: {Number(count.addOnCount)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">
                Select a school from the list to view details
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
