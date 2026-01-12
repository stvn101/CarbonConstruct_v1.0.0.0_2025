import { memo, useState, useMemo, useCallback } from 'react';
import { Check, X, AlertTriangle, Search, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { BOQRematchDialog } from './BOQRematchDialog';

export interface Material {
  material_name: string;
  quantity: number;
  unit: string;
  category: string;
  matched_epd_id?: string;
  confidence?: number;
  ef_total?: number;
  data_source?: string;
  requiresReview?: boolean;
  reviewReason?: string;
}

interface BOQMaterialReviewProps {
  materials: Material[];
  onConfirm: (selectedMaterials: Material[]) => void;
  onCancel: () => void;
}

export const BOQMaterialReview = memo(({
  materials: initialMaterials,
  onConfirm,
  onCancel
}: BOQMaterialReviewProps) => {
  // Allow materials to be updated via re-matching
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  
  // Use material indices as IDs for stable selection tracking
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set(initialMaterials.map((_, index) => index))
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'matched' | 'unmatched'>('all');
  
  // Re-match dialog state
  const [rematchOpen, setRematchOpen] = useState(false);
  const [rematchIndex, setRematchIndex] = useState<number | null>(null);

  // Split materials by match status
  const { matchedMaterials, unmatchedMaterials, materialsWithIndices } = useMemo(() => {
    const withIndices = materials.map((material, index) => ({ ...material, originalIndex: index }));
    return {
      materialsWithIndices: withIndices,
      matchedMaterials: withIndices.filter(m => m.matched_epd_id),
      unmatchedMaterials: withIndices.filter(m => !m.matched_epd_id),
    };
  }, [materials]);

  // Get current view based on tab
  const currentMaterials = useMemo(() => {
    switch (activeTab) {
      case 'matched':
        return matchedMaterials;
      case 'unmatched':
        return unmatchedMaterials;
      default:
        return materialsWithIndices;
    }
  }, [activeTab, matchedMaterials, unmatchedMaterials, materialsWithIndices]);

  const filteredMaterials = useMemo(() => {
    if (!searchTerm) return currentMaterials;

    const search = searchTerm.toLowerCase();
    return currentMaterials.filter(material =>
      material.material_name.toLowerCase().includes(search) ||
      material.category.toLowerCase().includes(search)
    );
  }, [currentMaterials, searchTerm]);

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
    const currentIndices = currentMaterials.map(m => m.originalIndex);
    const allCurrentSelected = currentIndices.every(i => selectedIndices.has(i));
    
    setSelectedIndices(prev => {
      const newSet = new Set(prev);
      if (allCurrentSelected) {
        currentIndices.forEach(i => newSet.delete(i));
      } else {
        currentIndices.forEach(i => newSet.add(i));
      }
      return newSet;
    });
  }, [currentMaterials, selectedIndices]);

  const handleConfirm = useCallback(() => {
    const selected = materials.filter((_, index) => selectedIndices.has(index));
    onConfirm(selected);
  }, [materials, selectedIndices, onConfirm]);

  const openRematchDialog = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setRematchIndex(index);
    setRematchOpen(true);
  }, []);

  const handleRematch = useCallback((epd: { id: string; material_name: string; material_category: string; unit: string; ef_total: number; data_source: string }) => {
    if (rematchIndex === null) return;
    
    setMaterials(prev => {
      const updated = [...prev];
      const original = updated[rematchIndex];
      updated[rematchIndex] = {
        ...original,
        matched_epd_id: epd.id,
        ef_total: epd.ef_total,
        data_source: epd.data_source,
        confidence: 1.0, // Manual match = high confidence
      };
      return updated;
    });
  }, [rematchIndex]);

  const getConfidenceBadge = useCallback((confidence?: number, dataSource?: string) => {
    if (dataSource) {
      return <Badge variant="secondary" className="text-xs">{dataSource}</Badge>;
    }
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
    matched: matchedMaterials.length,
    unmatched: unmatchedMaterials.length,
  }), [materials.length, selectedIndices.size, matchedMaterials.length, unmatchedMaterials.length]);

  const allCurrentSelected = useMemo(() => {
    const currentIndices = currentMaterials.map(m => m.originalIndex);
    return currentIndices.length > 0 && currentIndices.every(i => selectedIndices.has(i));
  }, [currentMaterials, selectedIndices]);

  const someCurrentSelected = useMemo(() => {
    const currentIndices = currentMaterials.map(m => m.originalIndex);
    const selectedCount = currentIndices.filter(i => selectedIndices.has(i)).length;
    return selectedCount > 0 && selectedCount < currentIndices.length;
  }, [currentMaterials, selectedIndices]);

  const rematchMaterial = rematchIndex !== null ? materials[rematchIndex] : null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Review Extracted Materials</CardTitle>
          <CardDescription>
            Review materials and manually re-match any that weren&apos;t found in the EPD database
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total Materials"
              value={stats.total}
              icon={<Check className="h-4 w-4" />}
              className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
            />
            <StatCard
              label="Selected"
              value={stats.selected}
              icon={<Check className="h-4 w-4" />}
              className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
            />
            <StatCard
              label="EPD Matched"
              value={stats.matched}
              icon={<Check className="h-4 w-4 text-green-600" />}
              className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950"
            />
            <StatCard
              label="Custom/Unmatched"
              value={stats.unmatched}
              icon={<AlertTriangle className="h-4 w-4 text-yellow-600" />}
              className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950"
            />
          </div>

          {/* Tabs for filtering by match status */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="matched">Matched ({stats.matched})</TabsTrigger>
              <TabsTrigger value="unmatched">Unmatched ({stats.unmatched})</TabsTrigger>
            </TabsList>

            {/* Search */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search materials by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                aria-label="Search materials"
              />
            </div>

            {/* Materials Table - shared across tabs */}
            <TabsContent value={activeTab} className="mt-4">
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={allCurrentSelected || (someCurrentSelected ? "indeterminate" : false)}
                            onCheckedChange={toggleAll}
                            aria-label="Select all materials"
                          />
                        </TableHead>
                        <TableHead>Material Name</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Match Status</TableHead>
                        <TableHead className="text-right">Carbon (kgCO₂e)</TableHead>
                        <TableHead className="w-24">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMaterials.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            {searchTerm ? 'No materials match your search' : 'No materials in this category'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredMaterials.map((material) => (
                          <TableRow
                            key={material.originalIndex}
                            className={cn(
                              'cursor-pointer transition-colors',
                              selectedIndices.has(material.originalIndex) && 'bg-muted/50'
                            )}
                            onClick={() => toggleMaterial(material.originalIndex)}
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedIndices.has(material.originalIndex)}
                                onCheckedChange={() => toggleMaterial(material.originalIndex)}
                                onClick={(e) => e.stopPropagation()}
                                aria-label={`Select ${material.material_name}`}
                              />
                            </TableCell>
                            <TableCell className="font-medium max-w-[200px] truncate" title={material.material_name}>
                              {material.material_name || 'Unnamed material'}
                            </TableCell>
                            <TableCell>{typeof material.quantity === 'number' ? material.quantity.toLocaleString() : (material.quantity ?? '-')}</TableCell>
                            <TableCell>{material.unit || '-'}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{material.category}</Badge>
                            </TableCell>
                            <TableCell>
                              {material.requiresReview ? (
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden="true" />
                                  <Badge variant="default" className="bg-amber-500 hover:bg-amber-600" title={material.reviewReason}>
                                    Review Required
                                  </Badge>
                                </div>
                              ) : material.matched_epd_id ? (
                                <div className="flex items-center gap-2">
                                  <Check className="h-4 w-4 text-green-500" aria-hidden="true" />
                                  {getConfidenceBadge(material.confidence, material.data_source)}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <X className="h-4 w-4 text-destructive" aria-hidden="true" />
                                  <Badge variant="destructive">Custom</Badge>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {typeof material.ef_total === 'number' ? (
                                material.ef_total.toFixed(2)
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {!material.matched_epd_id && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => openRematchDialog(material.originalIndex, e)}
                                  className="gap-1"
                                >
                                  <RefreshCw className="h-3 w-3" />
                                  Match
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Warning for unmatched materials */}
          {stats.unmatched > 0 && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-950 dark:border-yellow-800">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                  {stats.unmatched} material{stats.unmatched > 1 ? 's' : ''} not matched to EPD database
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Use the &quot;Match&quot; button to search the EPD database and find a proper match. 
                  Unmatched materials use estimated emission factors.
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

      {/* Re-match dialog */}
      {rematchMaterial && (
        <BOQRematchDialog
          open={rematchOpen}
          onOpenChange={setRematchOpen}
          materialName={rematchMaterial.material_name}
          category={rematchMaterial.category}
          onSelect={handleRematch}
        />
      )}
    </>
  );
});

BOQMaterialReview.displayName = 'BOQMaterialReview';

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
