import { memo, useState, useMemo, useCallback } from 'react';
import { Check, X, AlertTriangle, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface Material {
  material_name: string;
  quantity: number;
  unit: string;
  category: string;
  matched_epd_id?: string;
  confidence?: number;
  ef_total?: number;
}

interface BOQMaterialReviewProps {
  materials: Material[];
  onConfirm: (selectedMaterials: Material[]) => void;
  onCancel: () => void;
}

export const BOQMaterialReview = memo(({
  materials,
  onConfirm,
  onCancel
}: BOQMaterialReviewProps) => {
  // Use material indices as IDs for stable selection tracking
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set(materials.map((_, index) => index))
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Create materials with stable indices
  const materialsWithIndices = useMemo(() =>
    materials.map((material, index) => ({ ...material, originalIndex: index })),
    [materials]
  );

  const filteredMaterials = useMemo(() => {
    if (!searchTerm) return materialsWithIndices;

    const search = searchTerm.toLowerCase();
    return materialsWithIndices.filter(material =>
      material.material_name.toLowerCase().includes(search) ||
      material.category.toLowerCase().includes(search)
    );
  }, [materialsWithIndices, searchTerm]);

  const toggleMaterial = useCallback((index: number) => {
    setSelectedIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedIndices.size === materials.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(materials.map((_, index) => index)));
    }
  }, [selectedIndices.size, materials.length]);

  const handleConfirm = useCallback(() => {
    const selected = materials.filter((_, index) => selectedIndices.has(index));
    onConfirm(selected);
  }, [materials, selectedIndices, onConfirm]);

  const getConfidenceBadge = useCallback((confidence?: number) => {
    if (!confidence) return null;

    if (confidence >= 0.9) {
      return <Badge variant="default" className="bg-green-500">High</Badge>;
    } else if (confidence >= 0.7) {
      return <Badge variant="default" className="bg-yellow-500">Medium</Badge>;
    } else {
      return <Badge variant="destructive">Low</Badge>;
    }
  }, []);

  const stats = useMemo(() => ({
    total: materials.length,
    selected: selectedIndices.size,
    highConfidence: materials.filter(m => (m.confidence ?? 0) >= 0.9).length,
    lowConfidence: materials.filter(m => (m.confidence ?? 0) < 0.7).length,
  }), [materials, selectedIndices.size]);

  const allSelected = selectedIndices.size === materials.length;
  const someSelected = selectedIndices.size > 0 && selectedIndices.size < materials.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Extracted Materials</CardTitle>
        <CardDescription>
          Review and confirm the materials extracted from your BOQ before importing to calculator
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Materials"
            value={stats.total}
            icon={<Check className="h-4 w-4" />}
            className="border-blue-200 bg-blue-50"
          />
          <StatCard
            label="Selected"
            value={stats.selected}
            icon={<Check className="h-4 w-4" />}
            className="border-green-200 bg-green-50"
          />
          <StatCard
            label="High Confidence"
            value={stats.highConfidence}
            icon={<Check className="h-4 w-4" />}
            className="border-emerald-200 bg-emerald-50"
          />
          <StatCard
            label="Needs Review"
            value={stats.lowConfidence}
            icon={<AlertTriangle className="h-4 w-4" />}
            className="border-yellow-200 bg-yellow-50"
          />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search materials by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            aria-label="Search materials"
          />
        </div>

        {/* Materials Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onCheckedChange={toggleAll}
                      aria-label="Select all materials"
                    />
                  </TableHead>
                  <TableHead>Material Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Match</TableHead>
                  <TableHead className="text-right">Carbon (kgCO₂e)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No materials match your search' : 'No materials found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMaterials.map((material) => (
                    <MaterialRow
                      key={material.originalIndex}
                      material={material}
                      isSelected={selectedIndices.has(material.originalIndex)}
                      onToggle={() => toggleMaterial(material.originalIndex)}
                      getConfidenceBadge={getConfidenceBadge}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Warning for low confidence materials */}
        {stats.lowConfidence > 0 && (
          <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">
                {stats.lowConfidence} material{stats.lowConfidence > 1 ? 's' : ''} with low confidence match
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                These materials may need manual verification after import. You can update them in the calculator.
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between gap-4 flex-wrap">
        <Button variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={selectedIndices.size === 0}
          size="lg"
        >
          <Check className="mr-2 h-4 w-4" />
          Import {selectedIndices.size} Material{selectedIndices.size !== 1 ? 's' : ''} to Calculator
        </Button>
      </CardFooter>
    </Card>
  );
});

BOQMaterialReview.displayName = 'BOQMaterialReview';

// Memoized row component for better performance
interface MaterialRowProps {
  material: Material & { originalIndex: number };
  isSelected: boolean;
  onToggle: () => void;
  getConfidenceBadge: (confidence?: number) => React.ReactNode;
}

const MaterialRow = memo(({ material, isSelected, onToggle, getConfidenceBadge }: MaterialRowProps) => (
  <TableRow
    className={cn(
      'cursor-pointer transition-colors',
      isSelected && 'bg-muted/50'
    )}
    onClick={onToggle}
  >
    <TableCell>
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggle}
        onClick={(e) => e.stopPropagation()}
        aria-label={`Select ${material.material_name}`}
      />
    </TableCell>
    <TableCell className="font-medium">
      {material.material_name}
    </TableCell>
    <TableCell>{material.quantity.toLocaleString()}</TableCell>
    <TableCell>{material.unit}</TableCell>
    <TableCell>
      <Badge variant="outline">{material.category}</Badge>
    </TableCell>
    <TableCell>
      {material.matched_epd_id ? (
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" aria-hidden="true" />
          {getConfidenceBadge(material.confidence)}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <X className="h-4 w-4 text-destructive" aria-hidden="true" />
          <Badge variant="destructive">No match</Badge>
        </div>
      )}
    </TableCell>
    <TableCell className="text-right font-mono">
      {material.ef_total !== undefined ? (
        material.ef_total.toFixed(2)
      ) : (
        <span className="text-muted-foreground">-</span>
      )}
    </TableCell>
  </TableRow>
));

MaterialRow.displayName = 'MaterialRow';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  className?: string;
}

const StatCard = memo(({ label, value, icon, className }: StatCardProps) => (
  <div className={cn('p-4 rounded-lg border', className)}>
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      <div aria-hidden="true">{icon}</div>
    </div>
    <p className="text-2xl font-bold mt-2">{value}</p>
  </div>
));

StatCard.displayName = 'StatCard';
