import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetSchool, useGetPackingStatus, useCreateOrUpdatePackingStatus, useCreateOrUpdatePackingCount, useGetPackingCount } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { isDemoActive } from '../../demo/demoSession';
import { PACKING_CLASSES, PACKING_THEMES } from './packingOptions';
import { PackingClass, PackingTheme } from '../../backend';

export default function SchoolPackingPage() {
  const { schoolId } = useParams({ from: '/authenticated/packing/schools/$schoolId' });
  const navigate = useNavigate();
  const { data: school, isLoading: schoolLoading } = useGetSchool(schoolId);
  const { data: packingStatus, isLoading: statusLoading } = useGetPackingStatus(schoolId);
  const updateStatusMutation = useCreateOrUpdatePackingStatus();
  const updateCountMutation = useCreateOrUpdatePackingCount();

  const isDemo = isDemoActive();

  const [selectedClass, setSelectedClass] = useState<string>('Beginner');
  const [selectedTheme, setSelectedTheme] = useState<string>('MYSELF');

  const [formData, setFormData] = useState({
    kitCount: '0',
    addOnCount: '0',
    packed: false,
    dispatched: false,
    dispatchDetails: '',
    currentTheme: '',
  });

  const [countsData, setCountsData] = useState({
    totalCount: '0',
    packedCount: '0',
    addOnCount: '0',
  });

  // Map UI class/theme to backend enums
  const mapClassToBackend = (uiClass: string): PackingClass => {
    const mapping: Record<string, PackingClass> = {
      'Beginner': PackingClass.preSchool,
      'Explorer': PackingClass.class1,
      'Master': PackingClass.class2,
    };
    return mapping[uiClass] || PackingClass.preSchool;
  };

  const mapThemeToBackend = (uiTheme: string): PackingTheme => {
    const mapping: Record<string, PackingTheme> = {
      'MYSELF': PackingTheme.themeA,
      'SHAPES': PackingTheme.themeB,
      'ANIMAL KINGDOM': PackingTheme.themeC,
      'PLANT TREES AND FLOWERS': PackingTheme.themeD,
      'FRUITS AND VEGETABLES': PackingTheme.themeE,
      'FIVE ELEMENTS': PackingTheme.themeE,
    };
    return mapping[uiTheme] || PackingTheme.themeA;
  };

  // Load packing count for selected class/theme
  const backendClass = mapClassToBackend(selectedClass);
  const backendTheme = mapThemeToBackend(selectedTheme);
  const { data: packingCount } = useGetPackingCount(schoolId, backendClass, backendTheme);

  // Update form when data loads
  useEffect(() => {
    if (packingStatus) {
      setFormData({
        kitCount: packingStatus.kitCount.toString(),
        addOnCount: packingStatus.addOnCount.toString(),
        packed: packingStatus.packed,
        dispatched: packingStatus.dispatched,
        dispatchDetails: packingStatus.dispatchDetails || '',
        currentTheme: packingStatus.currentTheme,
      });
    }
  }, [packingStatus]);

  useEffect(() => {
    if (packingCount) {
      setCountsData({
        totalCount: packingCount.totalCount.toString(),
        packedCount: packingCount.packedCount.toString(),
        addOnCount: packingCount.addOnCount.toString(),
      });
    } else {
      setCountsData({
        totalCount: '0',
        packedCount: '0',
        addOnCount: '0',
      });
    }
  }, [packingCount, selectedClass, selectedTheme]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateStatusMutation.mutateAsync({
        schoolId,
        kitCount: BigInt(formData.kitCount || 0),
        addOnCount: BigInt(formData.addOnCount || 0),
        packed: formData.packed,
        dispatched: formData.dispatched,
        dispatchDetails: formData.dispatchDetails || null,
        currentTheme: formData.currentTheme,
      });
      toast.success('Packing status updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update packing status');
    }
  };

  const handleSaveCounts = async () => {
    const total = parseInt(countsData.totalCount || '0');
    const packed = parseInt(countsData.packedCount || '0');
    const addOn = parseInt(countsData.addOnCount || '0');

    if (total < 0 || packed < 0 || addOn < 0) {
      toast.error('Counts cannot be negative');
      return;
    }

    try {
      await updateCountMutation.mutateAsync({
        schoolId,
        pClass: backendClass,
        theme: backendTheme,
        totalCount: BigInt(total),
        packedCount: BigInt(packed),
        addOnCount: BigInt(addOn),
      });
      toast.success('Counts updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update counts');
    }
  };

  if (schoolLoading || statusLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!school) {
    return <div>School not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/packing/dashboard' })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Packing - {school.name}</h1>
        <p className="text-muted-foreground mt-1">Manage packing and dispatch status</p>
      </div>

      {/* School Details (Read-only) */}
      <Card>
        <CardHeader>
          <CardTitle>School Details</CardTitle>
          <CardDescription>Selected school information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">School Name</Label>
              <p className="font-medium">{school.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">School ID</Label>
              <p className="font-medium font-mono">{school.id}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Address</Label>
              <p className="font-medium">{school.address}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">City / State</Label>
              <p className="font-medium">{school.city}, {school.state}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Contact Person</Label>
              <p className="font-medium">{school.contactPerson}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Contact Number</Label>
              <p className="font-medium">{school.contactNumber}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Student Count</Label>
              <p className="font-medium">{Number(school.studentCount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Packing Status */}
      <Card>
        <CardHeader>
          <CardTitle>Packing Status</CardTitle>
          <CardDescription>Update kit counts, packing, and dispatch information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="kitCount">Kit Count</Label>
                <Input
                  id="kitCount"
                  type="number"
                  value={formData.kitCount}
                  onChange={(e) => setFormData({ ...formData, kitCount: e.target.value })}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addOnCount">Add-On Count</Label>
                <Input
                  id="addOnCount"
                  type="number"
                  value={formData.addOnCount}
                  onChange={(e) => setFormData({ ...formData, addOnCount: e.target.value })}
                  min="0"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="currentTheme">Current Theme</Label>
                <Input
                  id="currentTheme"
                  value={formData.currentTheme}
                  onChange={(e) => setFormData({ ...formData, currentTheme: e.target.value })}
                />
              </div>
              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="packed"
                    checked={formData.packed}
                    onCheckedChange={(checked) => setFormData({ ...formData, packed: checked as boolean })}
                  />
                  <Label htmlFor="packed" className="cursor-pointer">
                    Packed
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dispatched"
                    checked={formData.dispatched}
                    onCheckedChange={(checked) => setFormData({ ...formData, dispatched: checked as boolean })}
                  />
                  <Label htmlFor="dispatched" className="cursor-pointer">
                    Dispatched
                  </Label>
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="dispatchDetails">Dispatch Details</Label>
                <Textarea
                  id="dispatchDetails"
                  value={formData.dispatchDetails}
                  onChange={(e) => setFormData({ ...formData, dispatchDetails: e.target.value })}
                  rows={4}
                />
              </div>
            </div>

            <Button type="submit" disabled={updateStatusMutation.isPending}>
              {updateStatusMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Packing Status
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Class and Theme Selection with Counts */}
      <Card>
        <CardHeader>
          <CardTitle>Counts by Class and Theme</CardTitle>
          <CardDescription>Select class and theme to manage counts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger 
                  id="class"
                  className="bg-white dark:bg-card"
                >
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-popover">
                  {PACKING_CLASSES.map((cls) => (
                    <SelectItem 
                      key={cls.value} 
                      value={cls.value}
                      className="hover:bg-[#e73d4b] hover:text-white focus:bg-[#e73d4b] focus:text-white"
                    >
                      {cls.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                <SelectTrigger 
                  id="theme"
                  className="bg-white dark:bg-card"
                >
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-popover">
                  {PACKING_THEMES.map((theme) => (
                    <SelectItem 
                      key={theme.value} 
                      value={theme.value}
                      className="hover:bg-[#e73d4b] hover:text-white focus:bg-[#e73d4b] focus:text-white"
                    >
                      {theme.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="totalCount">Total Count</Label>
              <Input
                id="totalCount"
                type="number"
                value={countsData.totalCount}
                onChange={(e) => setCountsData({ ...countsData, totalCount: e.target.value })}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="packedCount">Packed Count</Label>
              <Input
                id="packedCount"
                type="number"
                value={countsData.packedCount}
                onChange={(e) => setCountsData({ ...countsData, packedCount: e.target.value })}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addOnCountDetail">Add-On Count</Label>
              <Input
                id="addOnCountDetail"
                type="number"
                value={countsData.addOnCount}
                onChange={(e) => setCountsData({ ...countsData, addOnCount: e.target.value })}
                min="0"
              />
            </div>
          </div>

          <Button onClick={handleSaveCounts} disabled={updateCountMutation.isPending}>
            {updateCountMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Counts
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
