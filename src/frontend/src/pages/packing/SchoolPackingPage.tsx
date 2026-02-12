import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import {
  useGetSchool,
  useGetPackingStatus,
  useCreateOrUpdatePackingStatus,
  useGetPackingCountsBySchool,
  useCreateOrUpdatePackingCount,
} from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { PackingClass, PackingTheme } from '../../backend';

const THEMES = [
  { value: PackingTheme.themeA, label: 'MYSELF' },
  { value: PackingTheme.themeB, label: 'SHAPES' },
  { value: PackingTheme.themeC, label: 'ANIMAL KINGDOM' },
  { value: PackingTheme.themeD, label: 'PLANT TREES AND FLOWERS' },
  { value: PackingTheme.themeE, label: 'FRUITS AND VEGETABLES' },
];

const CLASSES = [
  { value: PackingClass.preSchool, label: 'Toddler' },
  { value: PackingClass.class1, label: 'Beginner' },
  { value: PackingClass.class2, label: 'Explorer' },
  { value: PackingClass.class3, label: 'Master' },
];

type PackingRow = {
  theme: PackingTheme;
  themeLabel: string;
  toddler: string;
  beginner: string;
  explorer: string;
  master: string;
  product: string;
  details: string;
};

export default function SchoolPackingPage() {
  const { schoolId } = useParams({ from: '/authenticated/packing/schools/$schoolId' });
  const navigate = useNavigate();
  const { data: school, isLoading: schoolLoading } = useGetSchool(schoolId);
  const { data: packingStatus } = useGetPackingStatus(schoolId);
  const updateStatusMutation = useCreateOrUpdatePackingStatus();
  const updateCountMutation = useCreateOrUpdatePackingCount();

  const [kitCount, setKitCount] = useState('');
  const [addOnCount, setAddOnCount] = useState('');
  const [packed, setPacked] = useState(false);
  const [dispatched, setDispatched] = useState(false);
  const [dispatchDetails, setDispatchDetails] = useState('');
  const [currentTheme, setCurrentTheme] = useState('');

  const [packingRows, setPackingRows] = useState<PackingRow[]>(
    THEMES.map((theme) => ({
      theme: theme.value,
      themeLabel: theme.label,
      toddler: '',
      beginner: '',
      explorer: '',
      master: '',
      product: '',
      details: '',
    }))
  );

  // Initialize form when data loads
  useState(() => {
    if (packingStatus) {
      setKitCount(packingStatus.kitCount.toString());
      setAddOnCount(packingStatus.addOnCount.toString());
      setPacked(packingStatus.packed);
      setDispatched(packingStatus.dispatched);
      setDispatchDetails(packingStatus.dispatchDetails || '');
      setCurrentTheme(packingStatus.currentTheme);
    }
  });

  const handleUpdateRow = (themeValue: PackingTheme, field: keyof PackingRow, value: string) => {
    setPackingRows((prev) =>
      prev.map((row) => (row.theme === themeValue ? { ...row, [field]: value } : row))
    );
  };

  const handleSaveStatus = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        schoolId,
        kitCount: BigInt(kitCount || 0),
        addOnCount: BigInt(addOnCount || 0),
        packed,
        dispatched,
        dispatchDetails: dispatchDetails || null,
        currentTheme,
      });
      toast.success('Packing status updated successfully');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  };

  const handleSaveTable = async () => {
    try {
      // Save all rows
      for (const row of packingRows) {
        // Save for each class
        for (const classItem of CLASSES) {
          const countValue = row[classItem.label.toLowerCase() as keyof PackingRow] as string;
          if (countValue) {
            await updateCountMutation.mutateAsync({
              schoolId,
              pClass: classItem.value,
              theme: row.theme,
              totalCount: BigInt(countValue || 0),
              packedCount: BigInt(0),
              addOnCount: BigInt(0),
            });
          }
        }
      }
      toast.success('Packing counts saved successfully');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  };

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
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/packing/schools' })}>
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
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/packing/schools' })}>
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

      {/* Counts by Class and Theme */}
      <Card>
        <CardHeader>
          <CardTitle>Counts by Class and Theme</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="dispatchDetails">Dispatch Details</Label>
            <Textarea
              id="dispatchDetails"
              value={dispatchDetails}
              onChange={(e) => setDispatchDetails(e.target.value)}
              rows={3}
              placeholder="Enter dispatch details..."
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Theme</TableHead>
                  <TableHead>Toddler</TableHead>
                  <TableHead>Beginner</TableHead>
                  <TableHead>Explorer</TableHead>
                  <TableHead>Master</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packingRows.map((row) => (
                  <TableRow key={row.theme}>
                    <TableCell className="font-medium">{row.themeLabel}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={row.toddler}
                        onChange={(e) => handleUpdateRow(row.theme, 'toddler', e.target.value)}
                        className="w-20"
                        min="0"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={row.beginner}
                        onChange={(e) => handleUpdateRow(row.theme, 'beginner', e.target.value)}
                        className="w-20"
                        min="0"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={row.explorer}
                        onChange={(e) => handleUpdateRow(row.theme, 'explorer', e.target.value)}
                        className="w-20"
                        min="0"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={row.master}
                        onChange={(e) => handleUpdateRow(row.theme, 'master', e.target.value)}
                        className="w-20"
                        min="0"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.product}
                        onChange={(e) => handleUpdateRow(row.theme, 'product', e.target.value)}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.details}
                        onChange={(e) => handleUpdateRow(row.theme, 'details', e.target.value)}
                        className="w-40"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="kitCount">Kit Count</Label>
              <Input
                id="kitCount"
                type="number"
                value={kitCount}
                onChange={(e) => setKitCount(e.target.value)}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addOnCount">Add-On Count</Label>
              <Input
                id="addOnCount"
                type="number"
                value={addOnCount}
                onChange={(e) => setAddOnCount(e.target.value)}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentTheme">Current Theme</Label>
              <Input
                id="currentTheme"
                value={currentTheme}
                onChange={(e) => setCurrentTheme(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox id="packed" checked={packed} onCheckedChange={(checked) => setPacked(checked === true)} />
              <Label htmlFor="packed" className="cursor-pointer">
                Packed
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dispatched"
                checked={dispatched}
                onCheckedChange={(checked) => setDispatched(checked === true)}
              />
              <Label htmlFor="dispatched" className="cursor-pointer">
                Dispatched
              </Label>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={handleSaveStatus} disabled={updateStatusMutation.isPending}>
              {updateStatusMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Status
            </Button>
            <Button onClick={handleSaveTable} disabled={updateCountMutation.isPending} variant="outline">
              {updateCountMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Table Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
